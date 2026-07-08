import type { NpcTravelInfo } from './types';

export const NPC_DB: NpcTravelInfo[] = [
  {
    name: 'Martin the Master Gardener',
    aliases: ['martin', 'master gardener', 'martin the master gardener'],
    location: 'Draynor Village',
    area: 'Draynor Village Market — north of the bank, by the allotment farming patches',
    examine: 'He looks after the farming patch.',
    wikiPage: 'Martin the Master Gardener',
    portraitIcon: '👨‍🌾',
    compassDirection: 'North-west',
    tilesAway: 8,
  },
  {
    name: 'Fairy Godfather',
    aliases: ['fairy godfather', 'godfather'],
    location: 'Zanaris',
    area: 'Zanaris throne room',
    examine: 'The ruler of the fairies.',
    wikiPage: 'Fairy Godfather',
    portraitIcon: '🧚',
    compassDirection: 'Centre',
    tilesAway: 0,
  },
  {
    name: 'Naressa',
    aliases: ['naressa', 'meet naressa'],
    location: 'Senntisten',
    area: 'Senntisten Cathedral',
    examine: 'An archaeologist studying the cathedral.',
    wikiPage: 'Naressa',
    portraitIcon: '👩‍🔬',
    compassDirection: 'East',
    tilesAway: 28,
  },
  {
    name: 'Azzanadra',
    aliases: ['azzanadra'],
    location: 'Senntisten',
    area: 'Senntisten Cathedral',
    examine: 'A powerful Mahjarrat.',
    wikiPage: 'Azzanadra',
    portraitIcon: '🧙',
    compassDirection: 'North',
    tilesAway: 35,
  },
];

export function findNpc(name: string): NpcTravelInfo | null {
  const norm = name.toLowerCase().replace(/[^a-z0-9'\s]/g, '').trim();
  for (const npc of NPC_DB) {
    if (npc.name.toLowerCase() === norm) return npc;
    for (const alias of npc.aliases) {
      if (norm.includes(alias) || alias.includes(norm)) return npc;
    }
  }
  return null;
}
