/** Canonical RS3 world coordinates for quest NPCs (plane 0 unless noted) */

export interface NpcWorldCoord {
  name: string;
  aliases: string[];
  x: number;
  y: number;
  plane?: number;
  landmark: string;
}

export const NPC_WORLD_COORDS: NpcWorldCoord[] = [
  {
    name: 'Martin the Master Gardener',
    aliases: ['martin', 'master gardener', 'martin the master gardener'],
    x: 3080,
    y: 3257,
    plane: 0,
    landmark: 'North of the bank — allotment farming patches & market vegetable stalls',
  },
  {
    name: 'Fairy Godfather',
    aliases: ['fairy godfather', 'godfather'],
    x: 2451,
    y: 4434,
    plane: 0,
    landmark: 'Zanaris throne room — centre of the city',
  },
  {
    name: 'Fairy Queen',
    aliases: ['fairy queen', 'queen'],
    x: 2448,
    y: 4430,
    plane: 0,
    landmark: 'Zanaris — near the queen\'s cauldron',
  },
];

export function findNpcWorldCoord(name: string): NpcWorldCoord | null {
  const norm = name.toLowerCase().replace(/[^a-z0-9'\s]/g, '').trim();
  for (const npc of NPC_WORLD_COORDS) {
    if (npc.name.toLowerCase() === norm) return npc;
    for (const alias of npc.aliases) {
      if (norm.includes(alias) || alias.includes(norm)) return npc;
    }
  }
  return null;
}
