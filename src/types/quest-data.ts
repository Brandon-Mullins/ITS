import type { QuestSkillRequirement } from './quest';

/** OCR / API completion signals for a single step (no automation). */
export interface QuestCompletionChecks {
  chatContains?: string[];
  questJournalContains?: string[];
  inventoryContains?: string[];
  locationContains?: string[];
}

/** Map marker placeholders for native Jagex plugin API. */
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
}

/** Curated step — OSRS Quest Helper style. */
export interface StructuredQuestStep {
  id: string;
  instruction: string;
  location?: string;
  npc?: string;
  requiredItems: string[];
  recommendedItems?: string[];
  dialogueOptions: string[];
  fastestRoutes: string[];
  combatWarnings?: string[];
  completionChecks: QuestCompletionChecks;
  markers: QuestMarkers;
}

/** Hand-authored quest definition for the plugin contest prototype. */
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
  steps: StructuredQuestStep[];
}
