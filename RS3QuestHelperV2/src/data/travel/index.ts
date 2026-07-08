import type { LocationTravelData } from './types';
import { DRAYNOR } from './draynor';
import { VARROCK, GRAND_EXCHANGE } from './varrock';
import { ZANARIS, FAIRY_RINGS } from './zanaris';
import { SENNTISTEN } from './senntisten';
import { PRIFDDINAS, ELEMENTAL_WORKSHOP } from './prifddinas';
import { TRAVEL_HINTS_DB } from '../travel-hints';

/** All structured location travel databases */
export const TRAVEL_LOCATIONS: LocationTravelData[] = [
  DRAYNOR,
  VARROCK,
  GRAND_EXCHANGE,
  ZANARIS,
  FAIRY_RINGS,
  SENNTISTEN,
  PRIFDDINAS,
  ELEMENTAL_WORKSHOP,
];

const LOCATIONS_BY_ID = new Map(TRAVEL_LOCATIONS.map((l) => [l.id, l]));

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9'\s·]/g, ' ').replace(/\s+/g, ' ').trim();
}

function scoreMatch(text: string, alias: string): number {
  const norm = normalize(text);
  const normAlias = normalize(alias);
  if (norm === normAlias) return 100;
  if (norm.includes(normAlias)) return normAlias.length;
  const words = normAlias.split(' ').filter((w) => w.length > 2);
  if (words.length >= 2 && words.every((w) => norm.includes(w))) return normAlias.length - 1;
  return 0;
}

/** Resolve a quest step location/NPC/text to a travel database location */
export function resolveTravelLocation(searchTexts: string[]): LocationTravelData | null {
  let best: LocationTravelData | null = null;
  let bestScore = 0;

  for (const loc of TRAVEL_LOCATIONS) {
    for (const alias of loc.aliases) {
      for (const text of searchTexts) {
        const score = scoreMatch(text, alias);
        if (score > bestScore) {
          bestScore = score;
          best = loc;
        }
      }
    }
  }

  if (bestScore >= 4) return best;

  // Fallback to legacy travel-hints DB for wiki quests
  for (const entry of TRAVEL_HINTS_DB) {
    for (const alias of entry.aliases) {
      for (const text of searchTexts) {
        const score = scoreMatch(text, alias);
        if (score > bestScore) {
          bestScore = score;
          const existing = TRAVEL_LOCATIONS.find((l) => l.displayName === entry.displayName);
          if (existing) best = existing;
        }
      }
    }
  }

  return bestScore >= 4 ? best : null;
}

export function getLocationById(id: string): LocationTravelData | undefined {
  return LOCATIONS_BY_ID.get(id);
}

export { DRAYNOR, VARROCK, GRAND_EXCHANGE, ZANARIS, FAIRY_RINGS, SENNTISTEN, PRIFDDINAS, ELEMENTAL_WORKSHOP };
