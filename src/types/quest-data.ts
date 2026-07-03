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
  location?: string;
  npc?: string;
  object?: string;
  requiredItems: string[];
  recommendedItems?: string[];
  dialogueOptions: string[];
  fastestRoutes: string[];
  travelRoutes?: TravelRoute[];
  combatWarnings?: string[];
  puzzleHints?: string[];
  areaWarning?: string;
  completionChecks: QuestCompletionChecks;
  markers: QuestMarkers;
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
