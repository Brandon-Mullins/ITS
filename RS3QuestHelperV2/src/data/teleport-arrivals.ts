/** Where you land after using a teleport (world coords, plane 0) */

export interface TeleportArrival {
  methodId: string;
  x: number;
  y: number;
  plane?: number;
}

export const TELEPORT_ARRIVALS: TeleportArrival[] = [
  { methodId: 'draynor-lodestone', x: 3079, y: 3250 },
  { methodId: 'passage-abyss', x: 3078, y: 3249 },
  { methodId: 'amulet-glory-draynor', x: 3082, y: 3254 },
  { methodId: 'explorers-ring', x: 3054, y: 3265 },
  { methodId: 'fairy-ring-dkr', x: 3103, y: 3244 },
  { methodId: 'lumbridge-lodestone', x: 3233, y: 3222 },
];

export function getTeleportArrival(methodId: string): TeleportArrival | null {
  return TELEPORT_ARRIVALS.find((t) => t.methodId === methodId) ?? null;
}
