import type { ItemBrain, StructuredQuestDefinition } from '../types/quest-data';
import type { QuestGuide } from '../types/quest';
import { getCuratedQuest } from '../data/quests';

export interface ShoppingListItem {
  name: string;
  category: 'required' | 'recommended' | 'consumed' | 'ge-buyable';
  ironmanNote?: string;
  inInventory?: boolean;
  inBank?: boolean;
  status: 'ready' | 'bank' | 'missing' | 'ge';
}

export function getItemBrain(quest: StructuredQuestDefinition | null): ItemBrain {
  if (!quest) return {};
  return quest.itemBrain ?? {
    required: quest.requiredItems,
    recommended: quest.recommendedItems,
    geBuyable: quest.requiredItems,
  };
}

export function buildShoppingList(
  pageName: string,
  collectedItems: string[] = [],
  bankItems: string[] = [],
  needGeItems: string[] = [],
): ShoppingListItem[] {
  const quest = getCuratedQuest(pageName);
  if (!quest) return [];

  const brain = getItemBrain(quest);
  const items = new Map<string, ShoppingListItem>();

  const add = (names: string[] | undefined, category: ShoppingListItem['category']) => {
    for (const name of names ?? []) {
      if (items.has(name)) continue;
      const inInv = collectedItems.includes(name);
      const inBank = bankItems.includes(name);
      const needGe = needGeItems.includes(name);
      items.set(name, {
        name,
        category,
        ironmanNote: brain.ironmanNotes?.[name],
        inInventory: inInv,
        inBank,
        status: inInv ? 'ready' : inBank ? 'bank' : needGe ? 'ge' : 'missing',
      });
    }
  };

  add(brain.required ?? quest.requiredItems, 'required');
  add(brain.recommended ?? quest.recommendedItems, 'recommended');
  add(brain.geBuyable, 'ge-buyable');
  add(brain.consumed, 'consumed');

  return Array.from(items.values());
}

export function formatShoppingListText(items: ShoppingListItem[]): string {
  const lines = ['=== RS3 Quest Helper Shopping List ===', ''];
  const groups: Record<string, ShoppingListItem[]> = {
    required: [],
    recommended: [],
    'ge-buyable': [],
    consumed: [],
  };
  for (const item of items) {
    groups[item.category]?.push(item);
  }
  for (const [cat, list] of Object.entries(groups)) {
    if (list.length === 0) continue;
    lines.push(`[${cat.toUpperCase()}]`);
    for (const item of list) {
      const status = item.status === 'ready' ? '✓' : item.status === 'bank' ? '🏦' : '✗';
      lines.push(`  ${status} ${item.name}${item.ironmanNote ? ` (${item.ironmanNote})` : ''}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

export async function copyShoppingList(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function guideItemBrain(guide: QuestGuide): ItemBrain {
  if (guide.questId) {
    const curated = getCuratedQuest(guide.metadata.pageName);
    if (curated?.itemBrain) return curated.itemBrain;
  }
  return {
    required: guide.metadata.items,
    recommended: guide.metadata.recommended,
    geBuyable: guide.metadata.items,
  };
}
