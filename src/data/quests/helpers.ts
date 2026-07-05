import { getTravelHints } from '../travel-hints';
import type {
  QuestCompletionChecks,
  QuestMarkers,
  StructuredQuestStep,
  TravelRoute,
} from '../../types/quest-data';

interface StepOptions {
  location?: string;
  npc?: string;
  object?: string;
  requiredItems?: string[];
  recommendedItems?: string[];
  dialogueOptions?: string[];
  fastestRoutes?: string[];
  travelRoutes?: TravelRoute[];
  combatWarnings?: string[];
  puzzleHints?: string[];
  areaWarning?: string;
  completionChecks?: QuestCompletionChecks;
  markers?: Partial<QuestMarkers>;
}

export function questStep(id: string, instruction: string, opts: StepOptions = {}): StructuredQuestStep {
  const searchTexts = [instruction, opts.location, opts.npc].filter(Boolean) as string[];
  const hints = getTravelHints(instruction, searchTexts);
  const autoRoutes = hints.flatMap((h) =>
    h.methods.map((m) => `${m.name} → ${m.detail}`),
  );

  const travelRoutes: TravelRoute[] = opts.travelRoutes ?? autoRoutes.slice(0, 4).map((desc, i) => ({
    type: (['fastest', 'cheapest', 'ironman', 'no-teleport'] as const)[i] ?? 'fastest',
    label: ['Fastest', 'Alternative', 'Ironman', 'No teleport'][i] ?? 'Route',
    description: desc,
    requiredUnlocks: [],
  }));

  const completionChecks: QuestCompletionChecks = {
    chatContains: opts.completionChecks?.chatContains ?? [],
    questJournalContains: opts.completionChecks?.questJournalContains ?? [],
    inventoryContains: opts.completionChecks?.inventoryContains ?? [],
    locationContains: opts.completionChecks?.locationContains ?? [],
  };

  if (opts.npc && !completionChecks.chatContains?.includes(opts.npc)) {
    completionChecks.chatContains = [...(completionChecks.chatContains ?? []), opts.npc];
  }
  if (opts.location && !completionChecks.locationContains?.includes(opts.location)) {
    completionChecks.locationContains = [...(completionChecks.locationContains ?? []), opts.location];
  }

  return {
    id,
    instruction,
    location: opts.location,
    npc: opts.npc,
    object: opts.object,
    requiredItems: opts.requiredItems ?? [],
    recommendedItems: opts.recommendedItems,
    dialogueOptions: opts.dialogueOptions ?? [],
    fastestRoutes: opts.fastestRoutes ?? travelRoutes.map((r) => `${r.label}: ${r.description}`),
    travelRoutes,
    combatWarnings: opts.combatWarnings,
    puzzleHints: opts.puzzleHints,
    areaWarning: opts.areaWarning,
    completionChecks,
    markers: {
      npc: opts.markers?.npc ?? opts.npc ?? null,
      object: opts.markers?.object ?? opts.object ?? null,
      tile: opts.markers?.tile ?? null,
      area: opts.markers?.area ?? opts.location ?? null,
      minimapHint: opts.markers?.minimapHint ?? (opts.npc || opts.location ? 'highlight' : undefined),
      worldMapHint: opts.markers?.worldMapHint ?? (opts.location ? 'highlight' : undefined),
    },
  };
}
