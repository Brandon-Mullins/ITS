import { getTravelHints } from '../travel-hints';
import type {
  QuestCompletionChecks,
  QuestMarkers,
  StepCantFindNpc,
  StepHowToGetThere,
  StepLostHelp,
  StepUseOn,
  StructuredQuestStep,
  TravelRoute,
} from '../../types/quest-data';

interface StepOptions {
  objective?: string;
  location?: string;
  locationDetail?: string;
  npc?: string;
  object?: string;
  requiredItems?: string[];
  recommendedItems?: string[];
  dialogueOptions?: string[];
  dialogueNeedsVerification?: boolean;
  fastestRoutes?: string[];
  travelRoutes?: TravelRoute[];
  combatWarnings?: string[];
  puzzleHints?: string[];
  areaWarning?: string;
  completionChecks?: QuestCompletionChecks;
  markers?: Partial<QuestMarkers>;
  howToGetThere?: StepHowToGetThere;
  lostHelp?: StepLostHelp;
  cantFindNpc?: StepCantFindNpc;
  useOn?: StepUseOn;
  fairyRingCode?: string;
  fairyRingNotes?: string[];
  waitNote?: string;
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
    objective: opts.objective ?? instruction,
    location: opts.location,
    locationDetail: opts.locationDetail,
    npc: opts.npc,
    object: opts.object,
    requiredItems: opts.requiredItems ?? [],
    recommendedItems: opts.recommendedItems,
    dialogueOptions: opts.dialogueOptions ?? [],
    dialogueNeedsVerification: opts.dialogueNeedsVerification,
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
    howToGetThere: opts.howToGetThere,
    lostHelp: opts.lostHelp,
    cantFindNpc: opts.cantFindNpc,
    useOn: opts.useOn,
    fairyRingCode: opts.fairyRingCode,
    fairyRingNotes: opts.fairyRingNotes,
    waitNote: opts.waitNote,
  };
}

/** Reusable Martin "can't find NPC" help */
export const MARTIN_CANT_FIND: StepCantFindNpc = {
  title: "Can't find Martin?",
  tips: [
    'Martin is in Draynor Village market near the farming patch and vegetable stalls.',
    'If he is not visible, rotate your camera and check around the market/farming patch.',
    'Look for the farming icon on the minimap — Martin stands beside the allotment patches.',
    'From Draynor bank, run north-west toward the stalls (not toward the manor).',
  ],
  landmark: 'Allotment farming patches & market vegetable stalls',
  mapArea: 'Draynor Village market / farming patch',
};

export const MARTIN_LOST: StepLostHelp = {
  summary: 'You are looking for Martin the Master Gardener in Draynor Village market.',
  whereIsIt: 'Draynor Village market, north of the bank, beside the farming allotment patches.',
  nearestTeleport: 'Draynor lodestone',
  directionToRun: 'From Draynor lodestone, run north-west into the market area near the farming patch and stalls.',
  whatItLooksLike: 'Open market area with vegetable stalls, farming patches, and gardeners. Martin wears gardener clothes.',
  commonMistakes: [
    'Searching near Draynor Manor (wrong — Martin is in the village market).',
    'Standing at the bank and not running north-west into the market.',
    'Camera facing wrong direction — rotate and look for farming patch icons.',
  ],
  fallbackRoute: 'Open world map → Draynor Village. Martin is near the central market/farming patch. From bank, go north-west toward stalls.',
};

export const MARTIN_HOW_TO: StepHowToGetThere = {
  location: 'Draynor Village market, near the farming patch and market stalls.',
  fastestRoute: 'Draynor lodestone → run north-west into the market.',
  alternativeRoute: 'Amulet of glory → Draynor Village → run north into the market.',
  ifLost: 'Open world map and search Draynor Village. Martin is near the market/farming patch area, north of the bank.',
};
