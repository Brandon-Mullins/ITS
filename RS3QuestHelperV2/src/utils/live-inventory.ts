import { itemLabelMatches, listIncludesItem } from './item-match';

/** Live inventory list for quest item rows — green only when actually in inventory */
export function syncLiveInventory(
  trackedItems: string[],
  persisted: string[],
  detected: string[],
  chatAdded: string[],
  chatRemoved: string[],
  bankNow: string[],
): string[] {
  const collected = new Set(persisted);

  for (const raw of chatAdded) {
    for (const qi of trackedItems) {
      if (itemLabelMatches(raw, qi)) collected.add(qi);
    }
  }

  for (const raw of chatRemoved) {
    for (const entry of [...collected]) {
      if (itemLabelMatches(entry, raw) || trackedItems.some((qi) => itemLabelMatches(qi, raw) && itemLabelMatches(entry, qi))) {
        collected.delete(entry);
      }
    }
  }

  for (const qi of trackedItems) {
    const inDetected = listIncludesItem(detected, qi);
    const inBank = listIncludesItem(bankNow, qi);
    const removedByChat = chatRemoved.some((r) => itemLabelMatches(r, qi));

    if (inDetected) {
      collected.add(qi);
    } else if (inBank || removedByChat) {
      collected.delete(qi);
    }
  }

  return Array.from(collected);
}
