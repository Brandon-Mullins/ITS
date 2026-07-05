import type { QuestProgress, QuestStep } from '../types/quest';
import type { ItemBrain } from '../types/quest-data';
import { extractItemName } from './items';
import { listIncludesItem } from './item-match';

export type QuestAction = 'Talk-to' | 'Use' | 'Search' | 'Climb' | 'Enter' | 'Operate' | 'Equip' | 'Withdraw' | 'Click';

export type ClickTargetKind = 'npc' | 'object' | 'inventory-item' | 'bank-item' | 'destination';

export type AuraState = 'blue' | 'green' | 'red';

/** Legacy shape — kept for game overlay IPC */
export type ClickTargetType = 'npc' | 'object' | 'use-item' | 'equip-item' | 'click-item' | 'bank-item' | 'destination';

export interface ClickTarget {
  type: ClickTargetType;
  label: string;
  action: string;
  itemName?: string;
  targetName?: string;
  location?: string;
}

/** Rich click-target card for the quest guide UI */
export interface ClickTargetCard {
  id: string;
  kind: ClickTargetKind;
  name: string;
  location?: string;
  action: QuestAction;
  aura: AuraState;
  itemName?: string;
  useOnTarget?: string;
  hint?: string;
}

const USE_PATTERNS = [
  /\buse (?:the |your |a |an )?(.+?)\s+on\s+(.+?)[.,;!?\s]*$/i,
  /\buse (?:the |your |a |an )?(.+?)\s+on\s+(.+)/i,
];

const OBJECT_ACTION_PATTERNS: Array<{ pattern: RegExp; action: QuestAction }> = [
  { pattern: /\bsearch\b/i, action: 'Search' },
  { pattern: /\bclimb\b/i, action: 'Climb' },
  { pattern: /\benter\b/i, action: 'Enter' },
  { pattern: /\boperate\b/i, action: 'Operate' },
];

function cleanCaptured(s: string): string {
  return extractItemName(s.replace(/\.$/, '').trim());
}

function inferObjectAction(text: string): QuestAction {
  for (const { pattern, action } of OBJECT_ACTION_PATTERNS) {
    if (pattern.test(text)) return action;
  }
  return 'Click';
}

function itemAura(
  itemLabel: string,
  inv: string[],
  bank: string[],
  isCurrentTarget: boolean,
): AuraState {
  if (listIncludesItem(inv, itemLabel)) return isCurrentTarget ? 'blue' : 'green';
  if (listIncludesItem(bank, itemLabel)) return isCurrentTarget ? 'blue' : 'green';
  return 'red';
}

/** Build rich click-target cards with blue/green/red aura states */
export function buildClickTargetCards(
  step: QuestStep,
  progress: QuestProgress,
  itemBrain?: ItemBrain,
): ClickTargetCard[] {
  const cards: ClickTargetCard[] = [];
  const seen = new Set<string>();
  const inv = progress.collectedItems ?? [];
  const bank = progress.bankItems ?? [];
  const location = step.location ?? step.markers?.area ?? undefined;
  const textBlob = `${step.text} ${step.areaWarning ?? ''}`;

  const add = (card: ClickTargetCard) => {
    if (seen.has(card.id)) return;
    seen.add(card.id);
    cards.push(card);
  };

  if (step.npc || step.markers?.npc) {
    const name = step.npc ?? step.markers!.npc!;
    add({
      id: `npc:${name}`,
      kind: 'npc',
      name,
      location,
      action: 'Talk-to',
      aura: 'blue',
      hint: 'Click this NPC in the game world',
    });
  }

  if (step.object || step.markers?.object) {
    const name = step.object ?? step.markers!.object!;
    const action = inferObjectAction(textBlob);
    add({
      id: `object:${name}`,
      kind: 'object',
      name,
      location,
      action,
      aura: 'blue',
      hint: `${action} this object in the game world`,
    });
  }

  if (location && !step.npc && !step.object) {
    add({
      id: `dest:${location}`,
      kind: 'destination',
      name: location,
      location,
      action: 'Enter',
      aura: 'blue',
      hint: 'Travel to this area',
    });
  }

  for (const pat of USE_PATTERNS) {
    const m = textBlob.match(pat);
    if (m) {
      const item = cleanCaptured(m[1]);
      const target = cleanCaptured(m[2]);
      if (item.length > 2 && target.length > 2) {
        const aura = itemAura(item, inv, bank, true);
        add({
          id: `use:${item}:${target}`,
          kind: 'inventory-item',
          name: item,
          location,
          action: 'Use',
          aura,
          itemName: item,
          useOnTarget: target,
          hint: `Use ${item} on ${target}`,
        });
        add({
          id: `object:${target}`,
          kind: 'object',
          name: target,
          location,
          action: 'Use',
          aura: 'blue',
          hint: `Target for ${item}`,
        });
      }
    }
  }

  const equipMatch = textBlob.match(/\b(?:equip|wield) (?:the |your |a |an )?(.+?)[.,;!?\s]*$/i);
  if (equipMatch) {
    const item = cleanCaptured(equipMatch[1]);
    add({
      id: `equip:${item}`,
      kind: 'inventory-item',
      name: item,
      location,
      action: 'Equip',
      aura: itemAura(item, inv, bank, true),
      itemName: item,
      hint: 'Equip from inventory',
    });
  }

  const withdrawMatch = textBlob.match(/\bwithdraw (?:the |your |a |an )?(.+?)[.,;!?\s]*$/i);
  if (withdrawMatch) {
    const item = cleanCaptured(withdrawMatch[1]);
    add({
      id: `bank:${item}`,
      kind: 'bank-item',
      name: item,
      location: 'Bank',
      action: 'Withdraw',
      aura: listIncludesItem(inv, item) ? 'green' : listIncludesItem(bank, item) ? 'blue' : 'red',
      itemName: item,
      hint: 'Withdraw from bank',
    });
  }

  for (const item of step.stepItems ?? []) {
    const itemName = extractItemName(item);
    const lower = textBlob.toLowerCase();
    const itemLower = itemName.toLowerCase();
    if ((lower.includes(`use ${itemLower}`) || lower.includes(`use the ${itemLower}`)) && !seen.has(`use:${itemName}:`)) {
      add({
        id: `use-item:${item}`,
        kind: 'inventory-item',
        name: itemName,
        location,
        action: 'Use',
        aura: itemAura(item, inv, bank, true),
        itemName: item,
        hint: 'Use from inventory',
      });
    }
    if (lower.includes('equip') && lower.includes(itemLower.split(' ')[0]) && !seen.has(`equip:${itemName}`)) {
      add({
        id: `equip-item:${item}`,
        kind: 'inventory-item',
        name: itemName,
        location,
        action: 'Equip',
        aura: itemAura(item, inv, bank, true),
        itemName: item,
        hint: 'Equip from inventory',
      });
    }
    const needsItem = step.stepItems?.includes(item);
    const consumed = itemBrain?.consumed?.some((c) => listIncludesItem([c], item));
    if (needsItem && !listIncludesItem(inv, item) && !listIncludesItem(bank, item) && !seen.has(`need:${item}`)) {
      add({
        id: `need:${item}`,
        kind: 'inventory-item',
        name: itemName,
        location,
        action: 'Withdraw',
        aura: 'red',
        itemName: item,
        hint: consumed ? 'Get this item — it will be consumed' : 'Get this item before continuing',
      });
    }
  }

  return cards;
}

/** Legacy adapter for game overlay + hooks */
export function getClickTargets(step: QuestStep): ClickTarget[] {
  const targets: ClickTarget[] = [];
  const seen = new Set<string>();
  const location = step.location ?? step.markers?.area ?? undefined;

  const add = (t: ClickTarget) => {
    const key = `${t.type}:${t.label}`;
    if (seen.has(key)) return;
    seen.add(key);
    targets.push({ ...t, location });
  };

  if (step.npc) add({ type: 'npc', label: step.npc, action: 'Talk-to' });
  else if (step.markers?.npc) add({ type: 'npc', label: step.markers.npc, action: 'Talk-to' });

  if (step.object) add({ type: 'object', label: step.object, action: inferObjectAction(step.text) });
  else if (step.markers?.object) add({ type: 'object', label: step.markers.object, action: inferObjectAction(step.text) });

  const textSources = [step.text, step.areaWarning ?? ''].filter(Boolean);
  for (const text of textSources) {
    for (const pat of USE_PATTERNS) {
      const m = text.match(pat);
      if (m) {
        const item = cleanCaptured(m[1]);
        const on = cleanCaptured(m[2]);
        if (item.length > 2) {
          add({ type: 'use-item', label: item, itemName: item, targetName: on, action: on ? `Use on ${on}` : 'Use' });
          if (on.length > 2) add({ type: 'object', label: on, action: 'Use' });
        }
      }
    }
    const equipMatch = text.match(/\b(?:equip|wield) (?:the |your |a |an )?(.+?)[.,;!?\s]*$/i);
    if (equipMatch) {
      const item = cleanCaptured(equipMatch[1]);
      add({ type: 'equip-item', label: item, itemName: item, action: 'Equip' });
    }
  }

  if (location && !step.npc && !step.object) {
    add({ type: 'destination', label: location, action: 'Enter' });
  }

  return targets;
}

export function targetsNeedInventoryHighlight(targets: ClickTarget[]): boolean {
  return targets.some((t) =>
    t.type === 'use-item' || t.type === 'equip-item' || t.type === 'click-item' || t.type === 'bank-item',
  );
}

export function inventoryHighlightItems(targets: ClickTarget[]): string[] {
  return targets
    .filter((t) => t.type === 'use-item' || t.type === 'equip-item' || t.type === 'click-item' || t.type === 'bank-item')
    .map((t) => t.itemName ?? t.label);
}

export function cardsToHighlightTargets(cards: ClickTargetCard[]): ClickTarget[] {
  return cards.map((c) => ({
    type: c.kind === 'inventory-item' ? 'use-item' as const
      : c.kind === 'bank-item' ? 'bank-item' as const
      : c.kind === 'destination' ? 'destination' as const
      : c.kind,
    label: c.name,
    action: c.action,
    itemName: c.itemName,
    targetName: c.useOnTarget,
    location: c.location,
  }));
}
