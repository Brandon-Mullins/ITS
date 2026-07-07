import { itemLabelMatches, listIncludesItem } from './item-match';

/** Terms too generic for OCR — matching these alone causes false greens */
const OCR_STOP_WORDS = new Set([
  'the', 'and', 'for', 'you', 'your', 'from', 'with', 'have', 'that', 'this',
  'food', 'logs', 'log', 'rope', 'coin', 'coins', 'gold', 'key', 'keys',
  'bar', 'bars', 'vial', 'water', 'item', 'items', 'use', 'get', 'one', 'two',
  'red', 'blue', 'new', 'old', 'big', 'small', 'some', 'any', 'all',
]);

export function isReliableItemTerm(term: string): boolean {
  const t = term.toLowerCase().trim();
  if (t.length < 4) return false;
  if (OCR_STOP_WORDS.has(t)) return false;
  return true;
}

/**
 * Live inventory for quest rows — green ONLY from scan/chat/manual marks.
 * Never seeds from stale persisted collectedItems.
 */
export function syncLiveInventory(
  trackedItems: string[],
  detected: string[],
  chatAdded: string[],
  chatRemoved: string[],
  bankNow: string[],
  manualMarks: string[],
): string[] {
  const collected = new Set<string>();

  for (const m of manualMarks) {
    for (const qi of trackedItems) {
      if (itemLabelMatches(m, qi)) collected.add(qi);
    }
  }

  for (const raw of chatAdded) {
    for (const qi of trackedItems) {
      if (itemLabelMatches(raw, qi)) collected.add(qi);
    }
  }

  for (const qi of trackedItems) {
    if (listIncludesItem(detected, qi)) collected.add(qi);
  }

  for (const qi of trackedItems) {
    const inBank = listIncludesItem(bankNow, qi);
    const removedByChat = chatRemoved.some((r) => itemLabelMatches(r, qi));
    if (inBank || removedByChat) collected.delete(qi);
    else if (!listIncludesItem(detected, qi) && !listIncludesItem(manualMarks, qi)) {
      collected.delete(qi);
    }
  }

  return Array.from(collected);
}
