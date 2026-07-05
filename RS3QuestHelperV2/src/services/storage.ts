import type { AppSettings, QuestGuide, QuestIndexEntry, QuestProgress } from '../types/quest';
import { resolveQuestGuide } from './quest-engine';
import { enhanceWikiGuide } from './guide-enhancer';

const INDEX_FILE = 'quest-index.json';
const GUIDE_PREFIX = 'guide-';
const PROGRESS_FILE = 'progress.json';
const SETTINGS_FILE = 'settings-v2.json';

function guideFilename(pageName: string): string {
  return `${GUIDE_PREFIX}${pageName.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
}

function isElectron(): boolean {
  return typeof window !== 'undefined' && !!window.electronAPI;
}

export async function loadQuestIndex(): Promise<QuestIndexEntry[]> {
  if (isElectron()) {
    const cached = await window.electronAPI.storageRead<QuestIndexEntry[]>(INDEX_FILE);
    if (cached && cached.length > 0) return cached;

    const bundled = await window.electronAPI.storageReadBundled<QuestIndexEntry[]>('quest-index.json');
    if (bundled && bundled.length > 0) return bundled;
  }

  // Browser/dev fallback — fetch from wiki
  const { fetchQuestIndex } = await import('./wiki');
  return fetchQuestIndex();
}

export async function saveQuestIndex(index: QuestIndexEntry[]): Promise<void> {
  if (isElectron()) {
    await window.electronAPI.storageWrite(INDEX_FILE, index);
  }
}

export async function loadQuestGuide(pageName: string): Promise<QuestGuide | null> {
  const curated = resolveQuestGuide(pageName);
  if (curated) return curated;

  if (isElectron()) {
    const cached = await window.electronAPI.storageRead<QuestGuide>(guideFilename(pageName));
    if (cached) {
      return cached.source === 'curated' ? cached : enhanceWikiGuide({ ...cached, source: 'wiki' });
    }
  }

  const { fetchQuestGuide } = await import('./wiki');
  const guide = await fetchQuestGuide(pageName);
  const enhanced = enhanceWikiGuide({ ...guide, source: 'wiki' });

  if (isElectron()) {
    await window.electronAPI.storageWrite(guideFilename(pageName), enhanced);
  }

  return enhanced;
}

export async function refreshQuestGuide(pageName: string): Promise<QuestGuide> {
  const curated = resolveQuestGuide(pageName);
  if (curated) return curated;

  const { fetchQuestGuide } = await import('./wiki');
  const guide = await fetchQuestGuide(pageName);
  const enhanced = enhanceWikiGuide({ ...guide, source: 'wiki' });

  if (isElectron()) {
    await window.electronAPI.storageWrite(guideFilename(pageName), enhanced);
  }

  return enhanced;
}

export async function loadAllProgress(): Promise<Record<string, QuestProgress>> {
  if (isElectron()) {
    return (await window.electronAPI.storageRead<Record<string, QuestProgress>>(PROGRESS_FILE)) ?? {};
  }
  try {
    const raw = localStorage.getItem(PROGRESS_FILE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function saveProgress(progress: QuestProgress): Promise<void> {
  const all = await loadAllProgress();
  all[progress.questPageName] = progress;

  if (isElectron()) {
    await window.electronAPI.storageWrite(PROGRESS_FILE, all);
  } else {
    localStorage.setItem(PROGRESS_FILE, JSON.stringify(all));
  }
}

export async function loadSettings(): Promise<AppSettings> {
  const defaults: AppSettings = {
    alwaysOnTop: true,
    opacity: 0.95,
    attachToGame: false,
    smartDetect: false,
    uiMode: 'standard',
    accessibility: { largeText: false, highContrast: false },
    demoMode: false,
    tutorialComplete: false,
    highlightMode: 'ui-only',
    debugOverlay: false,
    inventoryCalibration: null,
  };

  if (isElectron()) {
    const saved = await window.electronAPI.storageRead<AppSettings>(SETTINGS_FILE);
    return saved ?? defaults;
  }

  try {
    const raw = localStorage.getItem(SETTINGS_FILE);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  if (isElectron()) {
    await window.electronAPI.storageWrite(SETTINGS_FILE, settings);
    await window.electronAPI.toggleAlwaysOnTop(settings.alwaysOnTop);
    await window.electronAPI.setOpacity(settings.opacity);
  } else {
    localStorage.setItem(SETTINGS_FILE, JSON.stringify(settings));
  }
}

export function openWikiUrl(url: string): void {
  if (isElectron()) {
    window.electronAPI.openExternal(url);
  } else {
    window.open(url, '_blank');
  }
}
