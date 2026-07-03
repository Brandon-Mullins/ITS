import type { QuestGuide, QuestStep } from '../types/quest';
import type { TravelRoute } from '../types/quest-data';
import { getTravelHints } from '../data/travel-hints';

const ROUTE_LABELS: TravelRoute['type'][] = ['fastest', 'cheapest', 'ironman', 'no-teleport'];
const ROUTE_NAMES = ['Fastest', 'Alternative', 'Ironman', 'No teleport'];

/** Add travel routes to wiki-parsed steps that lack them */
export function enhanceWikiGuide(guide: QuestGuide): QuestGuide {
  const steps: QuestStep[] = guide.steps.map((step) => {
    if (step.travelRoutes && step.travelRoutes.length > 0) return step;

    const hints = getTravelHints(step.text, [step.location ?? '', step.npc ?? ''].filter(Boolean));
    const methods = hints.flatMap((h) => h.methods).slice(0, 4);

    const travelRoutes: TravelRoute[] = methods.map((m, i) => ({
      type: ROUTE_LABELS[i] ?? 'fastest',
      label: ROUTE_NAMES[i] ?? m.name,
      description: `${m.name} → ${m.detail}`,
      requiredUnlocks: m.members ? ['Members'] : [],
      membersOnly: m.members,
    }));

    const fastestRoutes = travelRoutes.map((r) => `${r.label}: ${r.description}`);

    return {
      ...step,
      travelRoutes: travelRoutes.length > 0 ? travelRoutes : undefined,
      fastestRoutes: step.fastestRoutes ?? fastestRoutes,
      travelHints: hints.length > 0 ? hints : step.travelHints,
    };
  });

  return { ...guide, steps };
}
