import type { QuestStep } from '../types/quest';
import type { TravelBrainResult } from '../data/travel/types';
import { findNpcWorldCoord } from '../data/npc-coords';
import { getTeleportArrival } from '../data/teleport-arrivals';
import { findNpc } from '../data/travel/npcs';

export interface NpcNavigationGuide {
  npcName: string;
  portraitIcon: string;
  area: string;
  landmark: string;
  compassLabel: string;
  compassAngle: number;
  walkDirection?: string;
  walkDescription?: string;
  estimatedWalk?: string;
  tilesAway?: number;
  worldX: number;
  worldY: number;
  plane: number;
}

const COMPASS_DIRS = [
  'North', 'North-east', 'East', 'South-east',
  'South', 'South-west', 'West', 'North-west',
];

function bearingDegrees(fromX: number, fromY: number, toX: number, toY: number): number {
  const dx = toX - fromX;
  const dy = toY - fromY;
  return (Math.atan2(dx, dy) * 180) / Math.PI;
}

function compassLabelFromDegrees(deg: number): string {
  const idx = Math.round(deg / 45) % 8;
  return COMPASS_DIRS[(idx + 8) % 8];
}

function tileDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.round(Math.sqrt(dx * dx + dy * dy));
}

/** Build GPS navigation for an NPC step — compass, walk, minimap overlay */
export function buildNpcNavigation(
  step: QuestStep,
  travel: TravelBrainResult,
): NpcNavigationGuide | null {
  const npcName = step.npc ?? step.markers?.npc;
  if (!npcName) return null;

  const tile = step.markers?.tile;
  const worldNpc = findNpcWorldCoord(npcName);
  const npcInfo = findNpc(npcName);

  const destX = tile?.x ?? worldNpc?.x;
  const destY = tile?.y ?? worldNpc?.y;
  if (destX == null || destY == null) return null;

  const plane = tile?.plane ?? worldNpc?.plane ?? 0;
  const route = travel.fastestAvailable;
  const arrival = route?.methodId ? getTeleportArrival(route.methodId) : null;

  const fromX = arrival?.x ?? destX;
  const fromY = arrival?.y ?? destY;
  const angle = bearingDegrees(fromX, fromY, destX, destY);
  const tiles = tileDistance(fromX, fromY, destX, destY);

  return {
    npcName,
    portraitIcon: npcInfo?.portraitIcon ?? '👤',
    area: npcInfo?.area ?? step.markers?.area ?? step.location ?? travel.destination.area ?? '',
    landmark: worldNpc?.landmark ?? npcInfo?.area ?? step.markers?.area ?? '',
    compassLabel: route?.walkDirection ?? compassLabelFromDegrees(angle),
    compassAngle: angle,
    walkDirection: route?.walkDirection,
    walkDescription: route?.walkDescription ?? `Run ${compassLabelFromDegrees(angle).toLowerCase()} to the market`,
    estimatedWalk: route?.estimatedTime ?? (tiles <= 15 ? `~${tiles} tiles` : undefined),
    tilesAway: npcInfo?.tilesAway ?? tiles,
    worldX: destX,
    worldY: destY,
    plane,
  };
}

/** Minimap dot position (% of game window) — RS3 minimap is top-right */
export function minimapMarkerPosition(bearingDeg: number): { x: number; y: number } {
  const rad = (bearingDeg * Math.PI) / 180;
  const r = 4.2;
  const cx = 88.5;
  const cy = 11.5;
  return {
    x: cx + Math.sin(rad) * r,
    y: cy - Math.cos(rad) * r,
  };
}
