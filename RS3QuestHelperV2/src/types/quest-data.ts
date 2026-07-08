import type { QuestSkillRequirement } from './quest';

export type RouteType = 'fastest' | 'cheapest' | 'ironman' | 'no-teleport';

export interface TravelRoute {
  type: RouteType;
  label: string;
  description: string;
  requiredUnlocks?: string[];
  membersOnly?: boolean;
}

/** OCR / API completion signals for a single step (no automation). */
export interface QuestCompletionChecks {
  chatContains?: string[];
  questJournalContains?: string[];
  inventoryContains?: string[];
  locationContains?: string[];
}

export interface QuestTileMarker {
  x: number;
  y: number;
  plane?: number;
}

export interface QuestMarkers {
  npc?: string | null;
  object?: string | null;
  tile?: QuestTileMarker | null;
  area?: string | null;
  minimapHint?: string;
  worldMapHint?: string;
}

/** Fallback help when player is lost on a step */
export interface StepLostHelp {
  summary: string;
  whereIsIt: string;
  nearestTeleport: string;
  directionToRun: string;
  whatItLooksLike: string;
  commonMistakes: string[];
  fallbackRoute: string;
}

/** Extra help finding a specific NPC */
export interface StepCantFindNpc {
  title: string;
  tips: string[];
  landmark: string;
  mapArea: string;
}

export interface StepHowToGetThere {
  location: string;
  fastestRoute: string;
  alternativeRoute?: string;
  ifLost: string;
}

export interface StepUseOn {
  item: string;
  target: string;
}

export interface ItemBrain {
  required?: string[];
  recommended?: string[];
  obtainableDuring?: string[];
  consumed?: string[];
  kept?: string[];
  geBuyable?: string[];
  ironmanNotes?: Record<string, string>;
}

export interface StructuredQuestStep {
  id: string;
  instruction: string;
  /** Short line shown at top: "Talk to Martin the Master Gardener" */
  objective?: string;
  location?: string;
  locationDetail?: string;
  npc?: string;
  object?: string;
  requiredItems: string[];
  recommendedItems?: string[];
  dialogueOptions: string[];
  /** True if dialogue text is best-known but not fully verified */
  dialogueNeedsVerification?: boolean;
  fastestRoutes: string[];
  travelRoutes?: TravelRoute[];
  combatWarnings?: string[];
  puzzleHints?: string[];
  areaWarning?: string;
  completionChecks: QuestCompletionChecks;
  markers: QuestMarkers;
  howToGetThere?: StepHowToGetThere;
  lostHelp?: StepLostHelp;
  cantFindNpc?: StepCantFindNpc;
  useOn?: StepUseOn;
  fairyRingCode?: string;
  fairyRingNotes?: string[];
  waitNote?: string;
}

export interface StructuredQuestDefinition {
  id: string;
  name: string;
  pageName: string;
  wikiUrl?: string;
  members: boolean;
  length: string;
  isMiniquest?: boolean;
  requirements: string[];
  skillRequirements: QuestSkillRequirement[];
  requiredItems: string[];
  recommendedItems: string[];
  enemies: string[];
  rewards: string[];
  unlocks: string[];
  itemBrain?: ItemBrain;
  steps: StructuredQuestStep[];
}
