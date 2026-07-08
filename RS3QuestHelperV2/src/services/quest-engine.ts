import type { QuestGuide, QuestStep, TravelHint } from '../types/quest';
import type { StructuredQuestDefinition } from '../types/quest-data';
import { CURATED_QUESTS, getCuratedQuest } from '../data/quests';
import { wikiPageUrl } from './wiki';

export type QuestGuideSource = 'curated' | 'wiki';

export interface QuestGuideWithSource extends QuestGuide {
  source: QuestGuideSource;
  questId?: string;
  rewards?: string[];
  unlocks?: string[];
  itemBrain?: StructuredQuestDefinition['itemBrain'];
}

function routesToTravelHints(step: StructuredQuestDefinition['steps'][0]): TravelHint[] {
  const routes = step.travelRoutes ?? [];
  if (routes.length > 0) {
    return [{
      location: step.location ?? 'Destination',
      methods: routes.map((r) => ({
        name: r.label,
        detail: r.description,
        members: r.membersOnly,
      })),
    }];
  }
  if (step.fastestRoutes.length === 0) return [];
  const location = step.location ?? 'Destination';
  const methods = step.fastestRoutes.map((route) => {
    const parts = route.split('→').map((p) => p.trim());
    if (parts.length >= 2) {
      return { name: parts[0], detail: parts.slice(1).join(' → ') };
    }
    return { name: route, detail: '' };
  });
  return [{ location, methods }];
}

export function curatedToGuide(def: StructuredQuestDefinition): QuestGuideWithSource {
  const steps: QuestStep[] = def.steps.map((s, i) => ({
    id: s.id,
    sectionTitle: s.location ?? `Step ${i + 1}`,
    text: s.instruction,
    order: i,
    objective: s.objective,
    travelHints: routesToTravelHints(s),
    travelRoutes: s.travelRoutes,
    fastestRoutes: s.fastestRoutes,
    stepItems: s.requiredItems,
    recommendedItems: s.recommendedItems,
    dialogueChoices: s.dialogueOptions,
    dialogueNeedsVerification: s.dialogueNeedsVerification,
    combatWarnings: s.combatWarnings ?? [],
    puzzleHints: s.puzzleHints,
    areaWarning: s.areaWarning,
    location: s.location,
    locationDetail: s.locationDetail,
    npc: s.npc,
    object: s.object,
    completionChecks: s.completionChecks,
    markers: s.markers,
    howToGetThere: s.howToGetThere,
    lostHelp: s.lostHelp,
    cantFindNpc: s.cantFindNpc,
    useOn: s.useOn,
    fairyRingCode: s.fairyRingCode,
    fairyRingNotes: s.fairyRingNotes,
    waitNote: s.waitNote,
  }));

  return {
    metadata: {
      name: def.name,
      pageName: def.pageName,
      wikiUrl: def.wikiUrl ?? wikiPageUrl(def.pageName),
      members: def.members,
      length: def.length,
      start: def.steps[0]?.instruction ?? '',
      requirements: def.requirements,
      skillRequirements: def.skillRequirements,
      items: def.requiredItems,
      recommended: def.recommendedItems,
      kills: def.enemies,
      isMiniquest: def.isMiniquest ?? false,
    },
    steps,
    fetchedAt: new Date().toISOString(),
    source: 'curated',
    questId: def.id,
    rewards: def.rewards,
    unlocks: def.unlocks,
    itemBrain: def.itemBrain,
  };
}

export function resolveQuestGuide(pageName: string): QuestGuideWithSource | null {
  const curated = getCuratedQuest(pageName);
  if (curated) return curatedToGuide(curated);
  return null;
}

export function isCuratedQuest(pageName: string): boolean {
  return getCuratedQuest(pageName) !== null;
}

export function listCuratedQuests(): StructuredQuestDefinition[] {
  return CURATED_QUESTS;
}

export function getCuratedQuestIds(): string[] {
  return CURATED_QUESTS.map((q) => q.id);
}
