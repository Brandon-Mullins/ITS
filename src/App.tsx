import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppSettings, QuestGuide, QuestIndexEntry, QuestProgress } from './types/quest';
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
import { useGameAttach } from './hooks/useGameAttach';
import TitleBar from './components/TitleBar';
import QuestSearch from './components/QuestSearch';
import QuestGuideView from './components/QuestGuideView';
import './App.css';

export default function App() {
  const [quests, setQuests] = useState<QuestIndexEntry[]>([]);
  const [selectedPageName, setSelectedPageName] = useState<string | null>(null);
  const [guide, setGuide] = useState<QuestGuide | null>(null);
  const [progress, setProgress] = useState<QuestProgress | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    alwaysOnTop: true,
    opacity: 0.95,
    attachToGame: false,
    smartDetect: false,
  });
  const [loading, setLoading] = useState(true);
  const [guideLoading, setGuideLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'search' | 'guide'>('search');

  const handleSettingsChange = useCallback(async (updates: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      saveSettings(next);
      return next;
    });
  }, []);

  const { gameInfo, attachError, toggleAttach } = useGameAttach(settings, handleSettingsChange);

  useEffect(() => {
    async function init() {
      try {
        const [index, savedSettings] = await Promise.all([loadQuestIndex(), loadSettings()]);
        setQuests(index);
        setSettings(savedSettings);

        if (savedSettings.attachToGame && window.electronAPI?.gameAttach) {
          await window.electronAPI.gameAttach();
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
    setError(null);
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
      const updated: QuestProgress = {
        ...progress,
        ...updates,
        lastUpdated: new Date().toISOString(),
      };
      setProgress(updated);
      await saveProgress(updated);
    },
    [progress, selectedPageName],
  );

  const sortedQuests = useMemo(
    () => [...quests].sort((a, b) => a.name.localeCompare(b.name)),
    [quests],
  );

  const footerStatus = attachError
    ? attachError
    : settings.attachToGame && gameInfo?.title
      ? `Locked to: ${gameInfo.title}`
      : settings.smartDetect
        ? 'Smart detect on · screen read only'
        : 'No automation · Wiki-powered';

  if (loading) {
    return (
      <div className="overlay">
        <TitleBar
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onToggleAttach={toggleAttach}
        />
        <div className="content loading-state">
          <div className="spinner" />
          <p>Loading quest database…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay">
        <TitleBar
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onToggleAttach={toggleAttach}
        />
      <div className="content">
        {error && (
          <div className="error-banner">
            {error}
            <button type="button" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {view === 'search' ? (
          <QuestSearch
            quests={sortedQuests}
            playerRsn={settings.playerRsn}
            onPlayerRsnChange={(rsn) => handleSettingsChange({ playerRsn: rsn })}
            onSelect={(pageName) => loadGuide(pageName)}
            onRefreshIndex={handleRefreshIndex}
          />
        ) : (
          <QuestGuideView
            guide={guide}
            progress={progress}
            loading={guideLoading}
            onBack={() => {
              setView('search');
              setGuide(null);
            }}
            onRefresh={handleRefreshGuide}
            onProgressChange={updateProgress}
          />
        )}
      </div>
      <footer className="footer">
        <span className={`footer-badge ${settings.attachToGame ? 'attached' : ''}`}>
          {settings.attachToGame ? '🔒 Attached' : 'Read-only overlay'}
        </span>
        <span className={`footer-note ${attachError ? 'status-error' : ''}`}>
          {footerStatus} · v{packageJson.version}
        </span>
      </footer>
    </div>
  );
}
