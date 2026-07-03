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

export interface QuestStep {
  id: string;
  sectionTitle: string;
  text: string;
  order: number;
}

export interface QuestGuide {
  metadata: QuestMetadata;
  steps: QuestStep[];
  fetchedAt: string;
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
  lastUpdated: string;
}

export interface AppSettings {
  alwaysOnTop: boolean;
  opacity: number;
  lastQuest?: string;
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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
