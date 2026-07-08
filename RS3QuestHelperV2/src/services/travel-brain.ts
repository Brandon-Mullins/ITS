import type { QuestStep } from '../types/quest';
import type { TravelRoute } from '../types/quest-data';
import type {
  RankedTravelRoute,
  TravelBrainResult,
  VisualRouteStep,
} from '../data/travel/types';
import { resolveTravelLocation } from '../data/travel';
import { getTeleport } from '../data/travel/teleports';
import { findNpc } from '../data/travel/npcs';
import {
  buildPlayerTravelProfile,
  isUnlockMet,
  unlockLabel,
  type PlayerTravelProfile,
} from './player-travel';
import type { PlayerQuestData } from '../utils/quest-match';
import type { AppSettings } from '../types/quest';

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds} sec`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m} min ${s} sec` : `${m} min`;
}

function buildVisualSteps(
  methodIcon: string,
  methodName: string,
  walkDirection?: string,
  walkDescription?: string,
  npcName?: string,
  destination?: string,
): VisualRouteStep[] {
  const steps: VisualRouteStep[] = [
    { icon: methodIcon, label: methodName, detail: 'Teleport' },
  ];
  if (walkDirection || walkDescription) {
    steps.push({
      icon: '🏃',
      label: walkDirection ? `Run ${walkDirection.toLowerCase()}` : 'Run',
      detail: walkDescription,
    });
  }
  if (destination) {
    steps.push({ icon: '📍', label: destination });
  }
  if (npcName) {
    steps.push({ icon: '👤', label: npcName, detail: 'Talk or interact' });
  }
  return steps;
}

function rankLocationRoutes(
  locationRoutes: import('../data/travel/types').LocationRoute[],
  profile: PlayerTravelProfile,
  destination: { npc?: string; location: string; area?: string },
): RankedTravelRoute[] {
  const ranked: RankedTravelRoute[] = [];

  for (const route of locationRoutes) {
    const method = getTeleport(route.methodId);
    if (!method) continue;

    const requirements = method.requiredUnlocks.map((id) => ({
      text: unlockLabel(id),
      met: isUnlockMet(profile, id),
    }));

    const allMet = requirements.every((r) => r.met);
    const locked = !allMet;
    const missing = requirements.filter((r) => !r.met).map((r) => r.text);

    const totalSeconds = method.teleportSeconds + (route.walkSeconds ?? 0);
    const walkDesc = route.walkDescription ?? (route.walkDirection ? `Run ${route.walkDirection.toLowerCase()}` : undefined);

    let label = 'Route';
    const rt = route.routeType ?? 'alternative';
    if (rt === 'fastest') label = 'Fastest Route';
    else if (rt === 'cheapest') label = 'Alternative';
    else if (rt === 'ironman') label = 'Ironman Route';
    else if (rt === 'no-teleport') label = 'No Teleports';
    else label = 'Alternative';

    ranked.push({
      type: rt === 'alternative' ? 'alternative' : rt,
      label,
      methodId: route.methodId,
      methodName: method.name,
      methodIcon: method.icon,
      estimatedSeconds: totalSeconds,
      estimatedTime: formatTime(totalSeconds),
      walkDirection: route.walkDirection,
      walkDescription: walkDesc,
      description: walkDesc
        ? `${method.name} → ${walkDesc}`
        : method.name,
      requirements,
      locked,
      lockReason: locked ? `Need: ${missing.join(', ')}` : undefined,
      available: allMet,
      visualSteps: buildVisualSteps(
        method.icon,
        method.name,
        route.walkDirection,
        walkDesc,
        destination.npc,
        destination.area ?? destination.location,
      ),
    });
  }

  ranked.sort((a, b) => {
    if (a.available !== b.available) return a.available ? -1 : 1;
    return a.estimatedSeconds - b.estimatedSeconds;
  });

  return ranked;
}

function routesFromLegacy(step: QuestStep, profile: PlayerTravelProfile, destination: TravelBrainResult['destination']): RankedTravelRoute[] {
  const legacy = step.travelRoutes ?? [];
  return legacy.map((r: TravelRoute) => {
    const reqs = (r.requiredUnlocks ?? []).map((text) => ({
      text,
      met: profile.ironmanMode ? r.type === 'ironman' || r.type === 'no-teleport' : true,
    }));
    const locked = reqs.some((req) => !req.met);
    const seconds = r.type === 'no-teleport' ? 90 : r.type === 'fastest' ? 14 : 20;

    return {
      type: r.type,
      label: r.label,
      methodName: r.label,
      methodIcon: r.type === 'fastest' ? '⚡' : r.type === 'ironman' ? '🛡' : r.type === 'no-teleport' ? '🚶' : '💎',
      estimatedSeconds: seconds,
      estimatedTime: formatTime(seconds),
      description: r.description,
      requirements: reqs,
      locked,
      lockReason: locked ? reqs.filter((x) => !x.met).map((x) => x.text).join(', ') : undefined,
      available: !locked,
      visualSteps: buildVisualSteps(
        '⚡',
        r.label,
        undefined,
        r.description,
        destination.npc,
        destination.location,
      ),
    };
  }).sort((a, b) => {
    if (a.available !== b.available) return a.available ? -1 : 1;
    return a.estimatedSeconds - b.estimatedSeconds;
  });
}

function buildNewbieInstructions(
  route: RankedTravelRoute | null,
  destination: TravelBrainResult['destination'],
): string[] {
  if (!route) return [`Go to ${destination.location}.`];
  const lines: string[] = [];
  if (route.methodName.toLowerCase().includes('lodestone')) {
    lines.push(`Teleport to ${route.methodName}.`);
  } else if (route.methodIcon === '🚶') {
    lines.push(`Walk from ${route.methodName}.`);
  } else {
    lines.push(`Use ${route.methodName}.`);
  }
  if (route.walkDirection) {
    lines.push(`Run ${route.walkDirection.toLowerCase()} until you reach ${destination.area ?? destination.location}.`);
  } else if (route.walkDescription) {
    lines.push(route.walkDescription);
  }
  if (destination.npc) {
    lines.push(`${destination.npc} stands in ${destination.area ?? destination.location}.`);
  }
  return lines;
}

export function resolveTravelBrain(
  step: QuestStep,
  playerData: PlayerQuestData | null,
  settings?: AppSettings,
): TravelBrainResult {
  const profile = buildPlayerTravelProfile(playerData, settings);
  const searchTexts = [step.text, step.location, step.npc, step.object].filter(Boolean) as string[];
  const location = resolveTravelLocation(searchTexts);
  const npcInfo = step.npc ? findNpc(step.npc) : null;

  const destination = {
    npc: step.npc,
    location: location?.displayName ?? step.location ?? 'Destination',
    area: npcInfo?.area ?? location?.areaDescription ?? step.location,
  };

  let rankedRoutes: RankedTravelRoute[] = [];

  if (location) {
    rankedRoutes = rankLocationRoutes(location.routes, profile, destination);
  }

  if (rankedRoutes.length === 0) {
    rankedRoutes = routesFromLegacy(step, profile, destination);
  }

  const available = rankedRoutes.filter((r) => r.available);
  const fastestAvailable = available[0] ?? rankedRoutes[0] ?? null;
  const alternatives = rankedRoutes.filter(
    (r) => r !== fastestAvailable && (r.type === 'cheapest' || r.type === 'alternative'),
  );
  const ironmanRoute = rankedRoutes.find((r) => r.type === 'ironman') ?? null;
  const noTeleportRoute = rankedRoutes.find((r) => r.type === 'no-teleport') ?? null;

  return {
    destination,
    fastestAvailable,
    rankedRoutes,
    alternatives,
    ironmanRoute,
    noTeleportRoute,
    newbieInstructions: buildNewbieInstructions(fastestAvailable, destination),
    locationId: location?.id ?? null,
  };
}
