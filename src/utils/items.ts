/** Extract display name from wiki item string like "Empty pot (can be obtained during quest)" */
export function extractItemName(label: string): string {
  return label.replace(/\([^)]*\)/g, '').trim();
}

export function itemWikiUrl(itemLabel: string): string {
  const name = extractItemName(itemLabel);
  return `https://runescape.wiki/w/${encodeURIComponent(name.replace(/ /g, '_'))}`;
}

export function itemGeSearchUrl(itemLabel: string): string {
  const name = extractItemName(itemLabel);
  // Wiki item pages include Grand Exchange prices
  return `https://runescape.wiki/w/${encodeURIComponent(name.replace(/ /g, '_'))}#Grand_Exchange`;
}
