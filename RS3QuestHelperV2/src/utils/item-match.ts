import { extractItemName } from './items';

/** Normalize for fuzzy item comparison */
export function normalizeItemKey(name: string): string {
  return extractItemName(name)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Split "A or B" style quest item labels into alternatives */
export function itemAlternatives(label: string): string[] {
  const base = extractItemName(label);
  if (/\bor\b/i.test(base)) {
    return base.split(/\bor\b/i).map((s) => s.trim()).filter(Boolean);
  }
  return [base];
}

/** Does a collected/detected entry satisfy a quest item label? */
export function itemLabelMatches(haystack: string, needleLabel: string): boolean {
  const h = normalizeItemKey(haystack);
  const n = normalizeItemKey(needleLabel);
  if (!h || !n) return false;
  if (h === n) return true;
  if (h.length >= 4 && n.length >= 4 && (h.includes(n) || n.includes(h))) return true;

  for (const alt of itemAlternatives(needleLabel)) {
    const a = normalizeItemKey(alt);
    if (h === a) return true;
    if (h.length >= 4 && a.length >= 4 && (h.includes(a) || a.includes(h))) return true;
    const hWords = h.split(' ');
    const aWords = a.split(' ').filter((w) => w.length >= 3);
    if (aWords.length >= 2 && aWords.every((w) => hWords.some((hw) => hw === w || (hw.length >= 4 && w.length >= 4 && (hw.includes(w) || w.includes(hw)))))) {
      return true;
    }
  }
  return false;
}

export function listIncludesItem(list: string[], itemLabel: string): boolean {
  return list.some((entry) => itemLabelMatches(entry, itemLabel));
}

/** Green = live scan or manual mark this session — NOT stale saved progress */
export function itemReadySource(
  itemLabel: string,
  bank: string[],
  detected: string[],
  manualMarks: string[] = [],
): 'inventory' | 'bank' | 'missing' {
  if (listIncludesItem(detected, itemLabel)) return 'inventory';
  if (listIncludesItem(manualMarks, itemLabel)) return 'inventory';
  if (listIncludesItem(bank, itemLabel)) return 'bank';
  return 'missing';
}

export function hasQuestItem(
  itemLabel: string,
  bank: string[],
  detected: string[] = [],
  manualMarks: string[] = [],
): boolean {
  return itemReadySource(itemLabel, bank, detected, manualMarks) === 'inventory';
}

/** Build list for click-target cards from live scan + manual marks */
export function effectiveCollectedItems(
  manualMarks: string[],
  detected: string[],
  questItems: string[],
): string[] {
  const out = new Set<string>();
  for (const m of manualMarks) out.add(m);
  for (const det of detected) {
    out.add(det);
    for (const qi of questItems) {
      if (itemLabelMatches(det, qi)) out.add(qi);
    }
  }
  for (const qi of questItems) {
    if (listIncludesItem(detected, qi) || listIncludesItem(manualMarks, qi)) out.add(qi);
  }
  return Array.from(out);
}
