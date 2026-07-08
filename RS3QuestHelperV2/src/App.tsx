import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { AppSettings, QuestGuide, QuestIndexEntry, QuestProgress, ProgressUpdater } from './types/quest';
import type { PlayerQuestData } from './utils/quest-match';
import {
  loadQuestIndex,
  loadQuestGuide,
  loadAllProgress,
  saveProgress,
  loadSettings,
  saveSettings,
  refreshQuestGuide,
  saveQuestIndex,
} from './services/storage';
import { fetchQuestIndex } from './services/wiki';
import { fetchPlayerQuests } from './services/player';
import { initAdapters, DEMO_RSN } from './plugin-api';
import { useGameAttach } from './hooks/useGameAttach';
import TitleBar from './components/TitleBar';
import QuestSearch from './components/QuestSearch';
import QuestGuideView from './components/QuestGuideView';
import Sidebar, { getCuratedQuestList } from './components/Sidebar';
import GoalMode from './components/GoalMode';
import QuestEditor from './components/QuestEditor';
import WhyRs3Page from './components/WhyRs3Page';
import TutorialOverlay, { applyAccessibility } from './components/TutorialOverlay';
import WhatsNewBanner from './components/WhatsNewBanner';
import AttachModeHint from './components/AttachModeHint';
import SettingsPanel from './components/SettingsPanel';
import LayoutTestScreen from './components/LayoutTestScreen';
import './App.css';

export const V2_BUILD_ID = 'RS3QuestHelperV2';
export const V2_VERSION = 'v0.7.1-FAIRY-TALE-II-POLISH';

type AppView = 'search' | 'guide' | 'goals' | 'editor' | 'why' | 'settings' | 'layout-test';

const DEFAULT_SETTINGS: AppSettings = {
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
  layoutDebug: false,
  focusMode: true,
};

const CURRENT_SCHEMA_VERSION = 11;

export default function App() {
  const [quests, setQuests] = useState<QuestIndexEntry[]>([]);
  const [selectedPageName, setSelectedPageName] = useState<string | null>(null);
  const [guide, setGuide] = useState<QuestGuide | null>(null);
  const [progress, setProgress] = useState<QuestProgress | null>(null);
  const progressRef = useRef<QuestProgress | null>(null);
  progressRef.current = progress;
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [playerData, setPlayerData] = useState<PlayerQuestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [guideLoading, setGuideLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<AppView>('search');
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  const handleSettingsChange = useCallback(async (updates: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      saveSettings(next);
      return next;
    });
  }, []);

  const { gameInfo, attachError, toggleAttach } = useGameAttach(settings, handleSettingsChange);

  useEffect(() => {
    initAdapters(settings.demoMode ? 'mock' : 'ocr');
  }, [settings.demoMode]);

  useEffect(() => {
    async function init() {
      try {
        const [index, savedSettings] = await Promise.all([loadQuestIndex(), loadSettings()]);
        setQuests(index);
        const merged: AppSettings = { ...DEFAULT_SETTINGS, ...savedSettings };
        const appVersion = V2_VERSION;

        if ((merged.settingsSchemaVersion ?? 0) < CURRENT_SCHEMA_VERSION) {
          merged.settingsSchemaVersion = CURRENT_SCHEMA_VERSION;
          merged.attachToGame = false;
          merged.tutorialComplete = false;
          merged.highlightMode = merged.highlightMode ?? 'ui-only';
          merged.debugOverlay = merged.debugOverlay ?? false;
        }

        if (merged.lastSeenVersion !== appVersion) {
          merged.lastSeenVersion = appVersion;
          merged.attachToGame = false;
          await saveSettings(merged);
          setShowWhatsNew(true);
        } else if ((savedSettings.settingsSchemaVersion ?? 0) < CURRENT_SCHEMA_VERSION) {
          await saveSettings(merged);
          setShowWhatsNew(true);
        }

        setSettings(merged);

        if (savedSettings.playerRsn) {
          fetchPlayerQuests(savedSettings.playerRsn).then(setPlayerData).catch(() => {});
        }

        if (savedSettings.lastQuest) {
          setSelectedPageName(savedSettings.lastQuest);
          setView('guide');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load quest data');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const loadGuide = useCallback(async (pageName: string) => {
    setGuideLoading(true);
    setError(null);
    try {
      const [loadedGuide, allProgress] = await Promise.all([
        loadQuestGuide(pageName),
        loadAllProgress(),
      ]);
      setGuide(loadedGuide);
      setProgress(
        allProgress[pageName] ?? {
          questPageName: pageName,
          currentStepIndex: 0,
          completedSteps: [],
          collectedItems: [],
          bankItems: [],
          needGeItems: [],
          manuallyMarkedItems: [],
          lastUpdated: new Date().toISOString(),
        },
      );
      setSelectedPageName(pageName);
      setView('guide');
      handleSettingsChange({ lastQuest: pageName });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load quest guide');
    } finally {
      setGuideLoading(false);
    }
  }, [handleSettingsChange]);

  useEffect(() => {
    if (selectedPageName && view === 'guide' && !guide && !guideLoading) {
      loadGuide(selectedPageName);
    }
  }, [selectedPageName, view, guide, guideLoading, loadGuide]);

  const handleRefreshIndex = useCallback(async () => {
    setLoading(true);
    try {
      const index = await fetchQuestIndex();
      await saveQuestIndex(index);
      setQuests(index);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to refresh quest list');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefreshGuide = useCallback(async () => {
    if (!selectedPageName) return;
    setGuideLoading(true);
    try {
      const refreshed = await refreshQuestGuide(selectedPageName);
      setGuide(refreshed);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to refresh guide');
    } finally {
      setGuideLoading(false);
    }
  }, [selectedPageName]);

  const updateProgress = useCallback(
    async (updates: ProgressUpdater) => {
      if (!selectedPageName) return;
      const prev = progressRef.current;
      if (!prev) return;
      const partial = typeof updates === 'function' ? updates(prev) : updates;
      if (Object.keys(partial).length === 0) return;
      const updated: QuestProgress = {
        ...prev,
        ...partial,
        lastUpdated: new Date().toISOString(),
      };
      progressRef.current = updated;
      setProgress(updated);
      await saveProgress(updated);
    },
    [selectedPageName],
  );

  const sortedQuests = useMemo(
    () => [...quests].sort((a, b) => a.name.localeCompare(b.name)),
    [quests],
  );

  const curatedList = useMemo(() => getCuratedQuestList(), []);
  const a11yClass = applyAccessibility(settings);
  const currentStepIndex = progress?.currentStepIndex ?? 0;

  const tryDemo = () => {
    handleSettingsChange({ demoMode: true, playerRsn: DEMO_RSN, tutorialComplete: true });
    fetchPlayerQuests(DEMO_RSN).then(setPlayerData);
    setView('goals');
  };

  const [calibrating, setCalibrating] = useState(false);

  const handleCalibrateInventory = useCallback(async () => {
    if (!window.electronAPI?.startInventoryCalibration) return;
    setCalibrating(true);
    try {
      const cal = await window.electronAPI.startInventoryCalibration();
      if (cal) handleSettingsChange({ inventoryCalibration: cal });
    } finally {
      setCalibrating(false);
    }
  }, [handleSettingsChange]);

  const footerStatus = attachError
    ? attachError
    : settings.demoMode
      ? 'Demo mode · DemoPlayer'
      : settings.attachToGame && gameInfo?.title
        ? `Locked to: ${gameInfo.title}`
        : 'No automation · Guidance only';

  if (loading) {
    return (
      <div className={`overlay ${a11yClass}`}>
        <TitleBar settings={settings} version={V2_VERSION} onSettingsChange={handleSettingsChange} onToggleAttach={toggleAttach} />
        <div className="content loading-state"><div className="spinner" /><p>Loading V2 {V2_VERSION}…</p></div>
      </div>
    );
  }

  const isAttached = settings.attachToGame;
  const isFocusMode = (settings.focusMode ?? true) && view === 'guide';

  return (
    <div className={`overlay v2-app app-layout ${a11yClass} ${isAttached ? 'attach-mode' : 'browse-mode'} ${isFocusMode ? 'focus-mode' : ''} ${settings.layoutDebug ? 'layout-debug' : ''}`}>
      <div className="v2-verify-banner" role="status">
        ✓ RS3 Quest Helper V2 — {V2_VERSION}
      </div>
      <TitleBar settings={settings} version={V2_VERSION} onSettingsChange={handleSettingsChange} onToggleAttach={toggleAttach} />

      {showWhatsNew && !isAttached && (
        <WhatsNewBanner
          version={V2_VERSION}
          onDismiss={() => setShowWhatsNew(false)}
          onOpenGoals={() => { setView('goals'); setShowWhatsNew(false); }}
        />
      )}

      {isAttached && <AttachModeHint onDetach={toggleAttach} />}

      <div className="app-shell">
        {!isAttached && !isFocusMode && (
          <Sidebar
            guide={guide}
            progress={progress}
            currentIndex={currentStepIndex}
            onSelectStep={(i) => updateProgress({ currentStepIndex: i })}
            curatedQuestNames={curatedList}
            view={view === 'layout-test' ? 'settings' : view}
            onNavigate={(v) => setView(v)}
          />
        )}

        <div className="main-panel">
          {error && (
            <div className="error-banner">{error}<button type="button" onClick={() => setError(null)}>×</button></div>
          )}

          {view === 'search' && (
            <QuestSearch
              quests={sortedQuests}
              playerRsn={settings.playerRsn}
              onPlayerRsnChange={(rsn) => handleSettingsChange({ playerRsn: rsn })}
              onPlayerData={setPlayerData}
              onSelect={(pageName) => loadGuide(pageName)}
              onRefreshIndex={handleRefreshIndex}
            />
          )}

          {view === 'guide' && (
            <QuestGuideView
              guide={guide}
              progress={progress}
              loading={guideLoading}
              playerData={playerData}
              uiMode={settings.uiMode}
              isAttached={isAttached}
              gameInfo={gameInfo}
              highlightSettings={settings}
              onHighlightSettingsChange={handleSettingsChange}
              onBack={() => { setView('search'); setGuide(null); }}
              onRefresh={handleRefreshGuide}
              onProgressChange={updateProgress}
              onDetach={toggleAttach}
            />
          )}

          {view === 'goals' && (
            <GoalMode
              selectedGoal={settings.selectedGoal}
              onSelectGoal={(id) => handleSettingsChange({ selectedGoal: id })}
              onStartQuest={loadGuide}
              playerData={playerData}
              questIndex={sortedQuests}
              goalManualStatus={settings.goalManualStatus}
              onGoalManualStatusChange={(goalManualStatus) => handleSettingsChange({ goalManualStatus })}
            />
          )}

          {view === 'editor' && <QuestEditor />}
          {view === 'why' && <WhyRs3Page />}

          {view === 'settings' && (
            <SettingsPanel
              settings={settings}
              version={V2_VERSION}
              onChange={handleSettingsChange}
              onOpenLayoutTest={() => setView('layout-test')}
              onCalibrateInventory={handleCalibrateInventory}
              calibrating={calibrating}
            />
          )}

          {view === 'layout-test' && (
            <LayoutTestScreen onBack={() => setView('settings')} />
          )}
        </div>
      </div>

      <footer className="footer">
        <span className={`footer-badge ${settings.attachToGame ? 'attached' : ''}`}>
          {settings.attachToGame ? '🔒 Attached' : 'Read-only overlay'}
        </span>
        <span className="footer-mode">{settings.uiMode ?? 'standard'}</span>
        <span className={`footer-note ${attachError ? 'status-error' : ''}`}>
          {footerStatus} · {V2_VERSION}
        </span>
      </footer>

      {!settings.tutorialComplete && (
        <TutorialOverlay
          onComplete={() => handleSettingsChange({ tutorialComplete: true })}
          onTryDemo={tryDemo}
        />
      )}
    </div>
  );
}
