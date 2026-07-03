import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppSettings, QuestGuide, QuestIndexEntry, QuestProgress } from './types/quest';
import type { PlayerQuestData } from './utils/quest-match';
import packageJson from '../package.json';
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
import { initAdapters } from './plugin-api';
import { useGameAttach } from './hooks/useGameAttach';
import TitleBar from './components/TitleBar';
import QuestSearch from './components/QuestSearch';
import QuestGuideView from './components/QuestGuideView';
import Sidebar, { getCuratedQuestList } from './components/Sidebar';
import GoalMode from './components/GoalMode';
import QuestEditor from './components/QuestEditor';
import WhyRs3Page from './components/WhyRs3Page';
import TutorialOverlay, { applyAccessibility } from './components/TutorialOverlay';
import { DEMO_RSN } from './plugin-api';
import './App.css';

type AppView = 'search' | 'guide' | 'goals' | 'editor' | 'why';

const DEFAULT_SETTINGS: AppSettings = {
  alwaysOnTop: true,
  opacity: 0.95,
  attachToGame: false,
  smartDetect: false,
  uiMode: 'standard',
  accessibility: { largeText: false, highContrast: false },
  demoMode: false,
  tutorialComplete: false,
};

export default function App() {
  const [quests, setQuests] = useState<QuestIndexEntry[]>([]);
  const [selectedPageName, setSelectedPageName] = useState<string | null>(null);
  const [guide, setGuide] = useState<QuestGuide | null>(null);
  const [progress, setProgress] = useState<QuestProgress | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [playerData, setPlayerData] = useState<PlayerQuestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [guideLoading, setGuideLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<AppView>('search');

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
        setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });

        if (savedSettings.attachToGame && window.electronAPI?.gameAttach) {
          await window.electronAPI.gameAttach();
        }

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
    async (updates: Partial<QuestProgress>) => {
      if (!progress || !selectedPageName) return;
      const updated: QuestProgress = { ...progress, ...updates, lastUpdated: new Date().toISOString() };
      setProgress(updated);
      await saveProgress(updated);
    },
    [progress, selectedPageName],
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
        <TitleBar settings={settings} onSettingsChange={handleSettingsChange} onToggleAttach={toggleAttach} />
        <div className="content loading-state"><div className="spinner" /><p>Loading quest database…</p></div>
      </div>
    );
  }

  return (
    <div className={`overlay app-layout ${a11yClass}`}>
      <TitleBar settings={settings} onSettingsChange={handleSettingsChange} onToggleAttach={toggleAttach} />

      <div className="app-body">
        <Sidebar
          guide={guide}
          progress={progress}
          currentIndex={currentStepIndex}
          onSelectStep={(i) => updateProgress({ currentStepIndex: i })}
          curatedQuestNames={curatedList}
          view={view}
          onNavigate={setView}
        />

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
              uiMode={settings.uiMode}
              onBack={() => { setView('search'); setGuide(null); }}
              onRefresh={handleRefreshGuide}
              onProgressChange={updateProgress}
            />
          )}

          {view === 'goals' && (
            <GoalMode
              selectedGoal={settings.selectedGoal}
              onSelectGoal={(id) => handleSettingsChange({ selectedGoal: id })}
              onStartQuest={loadGuide}
              playerData={playerData}
              questIndex={sortedQuests}
            />
          )}

          {view === 'editor' && <QuestEditor />}
          {view === 'why' && <WhyRs3Page />}
        </div>
      </div>

      <footer className="footer">
        <span className={`footer-badge ${settings.attachToGame ? 'attached' : ''}`}>
          {settings.attachToGame ? '🔒 Attached' : 'Read-only overlay'}
        </span>
        <span className="footer-mode">{settings.uiMode ?? 'standard'}</span>
        <span className={`footer-note ${attachError ? 'status-error' : ''}`}>
          {footerStatus} · v{packageJson.version}
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
