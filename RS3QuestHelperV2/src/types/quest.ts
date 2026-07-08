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
  travelRoutes?: import('./quest-data').TravelRoute[];
  fastestRoutes?: string[];
  stepItems: string[];
  recommendedItems?: string[];
  dialogueChoices: string[];
  combatWarnings: string[];
  puzzleHints?: string[];
  areaWarning?: string;
  location?: string;
  npc?: string;
  object?: string;
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
  itemBrain?: import('./quest-data').ItemBrain;
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
  /** User tapped "I have this" — only manual marks persist across scans */
  manuallyMarkedItems?: string[];
  lastUpdated: string;
}

/** Partial progress patch, or a function that derives a patch from the latest state */
export type ProgressUpdater =
  | Partial<QuestProgress>
  | ((prev: QuestProgress) => Partial<QuestProgress>);

export interface AppSettings {
  alwaysOnTop: boolean;
  opacity: number;
  attachToGame: boolean;
  smartDetect: boolean;
  lastQuest?: string;
  playerRsn?: string;
  uiMode?: 'newbie' | 'veteran' | 'standard';
  accessibility?: { largeText: boolean; highContrast: boolean };
  demoMode?: boolean;
  tutorialComplete?: boolean;
  selectedGoal?: string;
  settingsSchemaVersion?: number;
  lastSeenVersion?: string;
  /** v0.6.4 — in-game highlight accuracy */
  highlightMode?: HighlightMode;
  debugOverlay?: boolean;
  inventoryCalibration?: InventoryCalibration | null;
  showHighlightSettings?: boolean;
  /** v0.6.5 — show layout debug outlines */
  layoutDebug?: boolean;
  /** v0.6.6 — hide sidebar during quest guide */
  focusMode?: boolean;
  /** v0.7.0 — manual goal quest status overrides (goalId → questId → status) */
  goalManualStatus?: Record<string, Record<string, 'locked' | 'ready' | 'started' | 'completed'>>;
}

export type HighlightMode = 'off' | 'ui-only' | 'inventory-only' | 'experimental-world';

export interface InventoryCalibration {
  left: number;
  top: number;
  width: number;
  height: number;
  cols?: number;
  rows?: number;
}

export interface InventorySlotHighlight {
  item: string;
  confidence: number;
  slotIndex: number;
  col: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OcrDebugBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
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
  inventoryScanned?: boolean;
  chatItemsAdded?: string[];
  chatItemsRemoved?: string[];
  inventorySlots?: InventorySlotHighlight[];
  ocrDebugBoxes?: OcrDebugBox[];
  gameBounds?: { x: number; y: number; width: number; height: number } | null;
}

export interface ScreenReaderConfig {
  items: string[];
  currentStepText: string;
  stepKeywords: string[];
  inventoryCalibration?: InventoryCalibration | null;
  completionChecks?: {
    chatContains?: string[];
    questJournalContains?: string[];
    inventoryContains?: string[];
    locationContains?: string[];
  };
}

export interface HighlightTargetPayload {
  type: string;
  label: string;
  action: string;
  itemName?: string;
  targetName?: string;
}

export interface HighlightConfig {
  mode: HighlightMode;
  debugOverlay: boolean;
  targets: HighlightTargetPayload[];
  inventoryItems: string[];
  useOnPairs?: Array<{ item: string; target: string }>;
  dialogueNext?: string;
  inventorySlots?: InventorySlotHighlight[];
  inventoryCalibration?: InventoryCalibration | null;
  ocrDebugBoxes?: OcrDebugBox[];
  navigation?: {
    npcName: string;
    compassLabel: string;
    compassAngle: number;
    landmark: string;
    minimapX: number;
    minimapY: number;
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
  updateHighlights: (config: HighlightConfig) => Promise<{ ok: boolean; debugLog?: string[]; reason?: string }>;
  clearHighlights: () => Promise<{ ok: boolean }>;
  startInventoryCalibration: () => Promise<InventoryCalibration | null>;
  cancelInventoryCalibration: () => Promise<{ ok: boolean }>;
  setWindowSize: (width: number, height: number) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
