/** Normalize quest names for curated ↔ wiki index matching */
export function normalizeQuestKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(quest\)/gi, '')
    .replace(/\(miniquest\)/gi, '')
    .replace(/^(a|an|the)\s+/i, '')
    .replace(/[^a-z0-9']/g, '')
    .trim();
}

export function questNamesMatch(a: string, b: string): boolean {
  const na = normalizeQuestKey(a);
  const nb = normalizeQuestKey(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  // "fairytaleiicurea queen" style partial
  const minLen = Math.min(na.length, nb.length);
  if (minLen >= 12) {
    return na.slice(0, 12) === nb.slice(0, 12);
  }
  return false;
}
