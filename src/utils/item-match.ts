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
  if (h.includes(n) || n.includes(h)) return true;

  for (const alt of itemAlternatives(needleLabel)) {
    const a = normalizeItemKey(alt);
    if (h === a || h.includes(a) || a.includes(h)) return true;
    const hWords = h.split(' ');
    const aWords = a.split(' ');
    if (aWords.every((w) => hWords.some((hw) => hw === w || hw.includes(w) || w.includes(hw)))) {
      return true;
    }
  }
  return false;
}

export function listIncludesItem(list: string[], itemLabel: string): boolean {
  return list.some((entry) => itemLabelMatches(entry, itemLabel));
}
