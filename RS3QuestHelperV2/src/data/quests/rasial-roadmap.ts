import type { StructuredQuestDefinition } from '../../types/quest-data';
import type { RasialQuestEntry } from '../goals/rasialUnlock';
import { RASIAL_QUESTS } from '../goals/rasialUnlock';
import { questStep } from './helpers';

function routeFromText(label: string, description: string) {
  return [{
    type: 'fastest' as const,
    label,
    description,
    requiredUnlocks: [],
  }];
}

function entryToGuide(entry: RasialQuestEntry): StructuredQuestDefinition {
  const routes = routeFromText('Fastest', entry.fastestRoute);
  const altRoutes = (entry.alternatives ?? []).map((alt, i) => ({
    type: 'cheapest' as const,
    label: `Alternative ${i + 1}`,
    description: alt,
    requiredUnlocks: [],
  }));

  const reqList = entry.prerequisites
    .map((id) => RASIAL_QUESTS.find((q) => q.id === id)?.name)
    .filter(Boolean) as string[];

  return {
    id: entry.id,
    name: entry.name,
    pageName: entry.pageName,
    members: true,
    length: entry.estimatedTime,
    isMiniquest: entry.type === 'miniquest',
    requirements: [
      ...reqList.map((r) => `Completion of ${r}`),
      ...entry.requiredSkills.map((s) => `${s.skill} level ${s.level}`),
    ],
    skillRequirements: entry.requiredSkills,
    requiredItems: entry.requiredItems,
    recommendedItems: entry.recommendedItems,
    enemies: entry.combatNotes ? [entry.combatNotes] : [],
    rewards: entry.unlocks,
    unlocks: entry.unlocks,
    itemBrain: {
      required: entry.requiredItems,
      recommended: entry.recommendedItems,
      geBuyable: entry.recommendedItems,
    },
    steps: [
      questStep(`${entry.id}-start`, `Start here: ${entry.startNpc ? `Talk to ${entry.startNpc}` : 'Begin the quest'} at ${entry.startLocation}.`, {
        location: entry.startLocation,
        npc: entry.startNpc,
        fastestRoutes: [entry.fastestRoute, ...(entry.alternatives ?? [])],
        travelRoutes: [...routes, ...altRoutes],
        requiredItems: entry.requiredItems,
        recommendedItems: entry.recommendedItems,
        combatWarnings: entry.combatNotes ? [entry.combatNotes] : undefined,
        areaWarning: entry.needsGuidePolish ? 'Needs full guide polish — follow wiki for detailed steps.' : undefined,
        completionChecks: {
          chatContains: entry.startNpc ? [entry.startNpc] : [],
          locationContains: [entry.startLocation.split('/')[0].trim()],
        },
        markers: {
          npc: entry.startNpc ?? null,
          area: entry.startLocation,
        },
      }),
      questStep(
        `${entry.id}-route`,
        `Fastest route: ${entry.fastestRoute}${entry.alternatives?.length ? `. Alternatives: ${entry.alternatives.join('; ')}` : ''}.`,
        {
          location: entry.startLocation,
          fastestRoutes: [entry.fastestRoute],
          travelRoutes: [...routes, ...altRoutes],
        },
      ),
      questStep(
        `${entry.id}-body`,
        `Complete ${entry.name}. Why this matters: ${entry.whyRequired} Full step-by-step script is being polished — use the wiki link for now.`,
        {
          location: entry.startLocation,
          combatWarnings: entry.combatNotes ? [entry.combatNotes] : undefined,
          puzzleHints: entry.needsGuidePolish ? ['Needs full guide polish badge — wiki has full steps'] : undefined,
        },
      ),
    ],
  };
}

/** Quest IDs with full polished guides — skip 3-step rasial placeholders for these */
const POLISHED_GUIDE_IDS = new Set([
  'fairy-tale-ii',
  'fairy-tale-2',
  'meet-naressa',
  'twilight-of-the-gods',
  'aftermath',
  'elemental-workshop-2',
  'elemental-workshop-3',
  'elemental-workshop-4',
]);

export const RASIAL_ROADMAP_QUESTS: StructuredQuestDefinition[] = RASIAL_QUESTS
  .filter((entry) => !POLISHED_GUIDE_IDS.has(entry.id))
  .map(entryToGuide);

export function getRasialRoadmapQuest(pageNameOrId: string): StructuredQuestDefinition | null {
  const key = pageNameOrId.toLowerCase().trim();
  return (
    RASIAL_ROADMAP_QUESTS.find(
      (q) =>
        q.id === key ||
        q.pageName.toLowerCase() === key ||
        q.name.toLowerCase() === key,
    ) ?? null
  );
}
