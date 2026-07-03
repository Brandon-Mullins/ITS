export interface QuestSkillRequirement {
  skill: string;
  level: number;
}

export interface QuestMetadata {
  name: string;
  pageName: string;
  wikiUrl: string;
  members: boolean;
  length: string;
  start: string;
  requirements: string[];
  skillRequirements: QuestSkillRequirement[];
  items: string[];
  recommended: string[];
  kills: string[];
  isMiniquest: boolean;
}

export interface TravelHint {
  location: string;
  methods: Array<{ name: string; detail: string; members?: boolean }>;
}

export interface QuestStep {
  id: string;
  sectionTitle: string;
  text: string;
  order: number;
  travelHints: TravelHint[];
  fastestRoutes?: string[];
  stepItems: string[];
  recommendedItems?: string[];
  dialogueChoices: string[];
  combatWarnings: string[];
  location?: string;
  npc?: string;
  completionChecks?: import('./quest-data').QuestCompletionChecks;
  markers?: import('./quest-data').QuestMarkers;
}

export interface QuestGuide {
  metadata: QuestMetadata;
  steps: QuestStep[];
  fetchedAt: string;
  source?: 'curated' | 'wiki';
  questId?: string;
  rewards?: string[];
  unlocks?: string[];
}

export interface QuestIndexEntry {
  name: string;
  pageName: string;
  members: boolean;
  length: string;
  isMiniquest: boolean;
}

export interface QuestProgress {
  questPageName: string;
  currentStepIndex: number;
  completedSteps: string[];
  collectedItems: string[];
  bankItems: string[];
  needGeItems: string[];
  lastUpdated: string;
}

export interface AppSettings {
  alwaysOnTop: boolean;
  opacity: number;
  attachToGame: boolean;
  smartDetect: boolean;
  lastQuest?: string;
  playerRsn?: string;
}

export interface GameWindowInfo {
  found: boolean;
  title: string;
  bounds: { x: number; y: number; width: number; height: number } | null;
  processId: number | null;
}

export interface ScreenReaderResult {
  timestamp: string;
  detectedItems: string[];
  bankItems: string[];
  needGeItems: string[];
  suggestStepComplete: boolean;
  ocrSnippet: string;
  bankOpen: boolean;
  bankScanned: boolean;
}

export interface ScreenReaderConfig {
  items: string[];
  currentStepText: string;
  stepKeywords: string[];
  completionChecks?: {
    chatContains?: string[];
    questJournalContains?: string[];
    inventoryContains?: string[];
    locationContains?: string[];
  };
}

export interface ElectronAPI {
  minimize: () => Promise<void>;
  close: () => Promise<void>;
  toggleAlwaysOnTop: (value: boolean) => Promise<boolean>;
  setOpacity: (opacity: number) => Promise<void>;
  openExternal: (url: string) => Promise<void>;
  storageRead: <T>(filename: string) => Promise<T | null>;
  storageWrite: (filename: string, data: unknown) => Promise<boolean>;
  storageReadBundled: <T>(filename: string) => Promise<T | null>;
  gameFind: () => Promise<GameWindowInfo>;
  gameAttach: () => Promise<{ attached: boolean; game?: GameWindowInfo }>;
  gameDetach: () => Promise<{ attached: boolean }>;
  gameStatus: () => Promise<{ attached: boolean; game: GameWindowInfo | null }>;
  screenReaderStart: (config: ScreenReaderConfig) => Promise<boolean>;
  screenReaderStop: () => Promise<boolean>;
  onScreenReaderResult: (callback: (result: ScreenReaderResult) => void) => () => void;
  fetchPlayerQuests: (rsn: string) => Promise<import('../utils/quest-match').PlayerQuestData>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
