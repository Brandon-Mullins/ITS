import { TRANSPORT_DB, type LocationTransport, type TravelMethod } from '../data/transport-db';

export interface TravelHint {
  location: string;
  methods: TravelMethod[];
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9'\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Extract [[wiki links]] from raw wikitext before markup is stripped */
export function extractWikiLinks(wikitext: string): string[] {
  const links: string[] = [];
  const regex = /\[\[(?:[^|\]#]+\|)?([^\]]+)\]\]/g;
  let match;
  while ((match = regex.exec(wikitext)) !== null) {
    links.push(match[1].trim());
  }
  return links;
}

function scoreMatch(text: string, alias: string): number {
  const norm = normalize(text);
  const normAlias = normalize(alias);
  if (norm === normAlias) return 100;
  if (norm.includes(normAlias)) return normAlias.length;
  // Word-boundary partial match
  const words = normAlias.split(' ');
  if (words.length >= 2 && words.every((w) => norm.includes(w))) return normAlias.length - 1;
  return 0;
}

function findLocationMatch(searchTexts: string[]): LocationTransport | null {
  let best: LocationTransport | null = null;
  let bestScore = 0;

  for (const entry of TRANSPORT_DB) {
    for (const alias of entry.aliases) {
      for (const text of searchTexts) {
        const score = scoreMatch(text, alias);
        if (score > bestScore) {
          bestScore = score;
          best = entry;
        }
      }
    }
  }

  // Require minimum match quality
  return bestScore >= 4 ? best : null;
}

export function getTravelHints(stepText: string, wikiLinks: string[] = []): TravelHint[] {
  const hints: TravelHint[] = [];
  const seen = new Set<string>();

  const searchTexts = [stepText, ...wikiLinks];

  const location = findLocationMatch(searchTexts);
  if (location && !seen.has(location.displayName)) {
    seen.add(location.displayName);
    hints.push({
      location: location.displayName,
      methods: location.methods.slice(0, 3),
    });
  }

  // Also try matching individual wiki links for secondary locations
  for (const link of wikiLinks) {
    const loc = findLocationMatch([link]);
    if (loc && !seen.has(loc.displayName)) {
      seen.add(loc.displayName);
      hints.push({
        location: loc.displayName,
        methods: loc.methods.slice(0, 3),
      });
    }
  }

  return hints.slice(0, 2);
}
