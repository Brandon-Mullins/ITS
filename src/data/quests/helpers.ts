import { getTravelHints } from '../travel-hints';
import type {
  QuestCompletionChecks,
  QuestMarkers,
  StructuredQuestStep,
} from '../../types/quest-data';

interface StepOptions {
  location?: string;
  npc?: string;
  requiredItems?: string[];
  recommendedItems?: string[];
  dialogueOptions?: string[];
  fastestRoutes?: string[];
  combatWarnings?: string[];
  completionChecks?: QuestCompletionChecks;
  markers?: Partial<QuestMarkers>;
}

/** Build a structured step; auto-fills fastestRoutes from travel DB when omitted. */
export function questStep(id: string, instruction: string, opts: StepOptions = {}): StructuredQuestStep {
  const searchTexts = [instruction, opts.location, opts.npc].filter(Boolean) as string[];
  const hints = getTravelHints(instruction, searchTexts);
  const autoRoutes = hints.flatMap((h) =>
    h.methods.map((m) => `${m.name} → ${m.detail}`),
  );

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
    requiredItems: opts.requiredItems ?? [],
    recommendedItems: opts.recommendedItems,
    dialogueOptions: opts.dialogueOptions ?? [],
    fastestRoutes: opts.fastestRoutes ?? autoRoutes.slice(0, 4),
    combatWarnings: opts.combatWarnings,
    completionChecks,
    markers: {
      npc: opts.markers?.npc ?? opts.npc ?? null,
      object: opts.markers?.object ?? null,
      tile: opts.markers?.tile ?? null,
      area: opts.markers?.area ?? opts.location ?? null,
    },
  };
}
