import type { QuestStep } from '../types/quest';
import { extractItemName } from './items';

export type ClickTargetType = 'npc' | 'object' | 'use-item' | 'equip-item' | 'click-item';

export interface ClickTarget {
  type: ClickTargetType;
  label: string;
  action: string;
  itemName?: string;
  targetName?: string;
}

const USE_PATTERNS = [
  /\buse (?:the |your |a |an )?(.+?)(?:\s+on\s+(.+?))?[.,;!?\s]*$/i,
  /\buse (?:the |your |a |an )?(.+?)\s+on\s+(.+)/i,
];

const EQUIP_PATTERNS = [
  /\bequip (?:the |your |a |an )?(.+?)[.,;!?\s]*$/i,
  /\bwield (?:the |your |a |an )?(.+?)[.,;!?\s]*$/i,
];

function cleanCaptured(s: string): string {
  return extractItemName(s.replace(/\.$/, '').trim());
}

function inferFromText(text: string): ClickTarget[] {
  const targets: ClickTarget[] = [];
  const lower = text.toLowerCase();

  for (const pat of USE_PATTERNS) {
    const m = text.match(pat);
    if (m) {
      const item = cleanCaptured(m[1]);
      const on = m[2] ? cleanCaptured(m[2]) : undefined;
      if (item.length > 2) {
        targets.push({
          type: 'use-item',
          label: item,
          itemName: item,
          targetName: on,
          action: on ? `Use on ${on}` : 'Use',
        });
      }
    }
  }

  for (const pat of EQUIP_PATTERNS) {
    const m = text.match(pat);
    if (m) {
      const item = cleanCaptured(m[1]);
      if (item.length > 2) {
        targets.push({
          type: 'equip-item',
          label: item,
          itemName: item,
          action: 'Equip',
        });
      }
    }
  }

  if (lower.includes('talk to ') || lower.includes('speak to ') || lower.includes('speak with ')) {
    const m = text.match(/(?:talk|speak)\s+(?:to|with)\s+(.+?)(?:\.|,| in | at |$)/i);
    if (m) {
      const name = cleanCaptured(m[1]);
      if (name.length > 2 && !targets.some((t) => t.type === 'npc')) {
        targets.push({ type: 'npc', label: name, action: 'Talk-to' });
      }
    }
  }

  return targets;
}

/** Build click targets for blue highlight UI + game overlay */
export function getClickTargets(step: QuestStep): ClickTarget[] {
  const targets: ClickTarget[] = [];
  const seen = new Set<string>();

  const add = (t: ClickTarget) => {
    const key = `${t.type}:${t.label}`;
    if (seen.has(key)) return;
    seen.add(key);
    targets.push(t);
  };

  if (step.npc) {
    add({ type: 'npc', label: step.npc, action: 'Talk-to' });
  } else if (step.markers?.npc) {
    add({ type: 'npc', label: step.markers.npc, action: 'Talk-to' });
  }

  if (step.object) {
    add({ type: 'object', label: step.object, action: 'Click' });
  } else if (step.markers?.object) {
    add({ type: 'object', label: step.markers.object, action: 'Click' });
  }

  const textSources = [step.text, step.areaWarning ?? ''].filter(Boolean);
  for (const text of textSources) {
    for (const t of inferFromText(text)) {
      add(t);
    }
  }

  for (const item of step.stepItems ?? []) {
    const lower = `${step.text} ${step.areaWarning ?? ''}`.toLowerCase();
    const itemLower = extractItemName(item).toLowerCase();
    if (lower.includes(`use ${itemLower}`) || lower.includes(`use the ${itemLower}`)) {
      add({ type: 'use-item', label: extractItemName(item), itemName: item, action: 'Use' });
    }
    if (lower.includes('equip') && lower.includes(itemLower.split(' ')[0])) {
      add({ type: 'equip-item', label: extractItemName(item), itemName: item, action: 'Equip' });
    }
  }

  return targets;
}

export function targetsNeedInventoryHighlight(targets: ClickTarget[]): boolean {
  return targets.some((t) => t.type === 'use-item' || t.type === 'equip-item' || t.type === 'click-item');
}

export function inventoryHighlightItems(targets: ClickTarget[]): string[] {
  return targets
    .filter((t) => t.type === 'use-item' || t.type === 'equip-item' || t.type === 'click-item')
    .map((t) => t.itemName ?? t.label);
}
