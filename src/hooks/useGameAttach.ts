import { useCallback, useEffect, useState } from 'react';
import type { AppSettings, GameWindowInfo } from '../types/quest';

export function useGameAttach(settings: AppSettings, onSettingsChange: (u: Partial<AppSettings>) => void) {
  const [gameInfo, setGameInfo] = useState<GameWindowInfo | null>(null);
  const [attachError, setAttachError] = useState<string | null>(null);

  const refreshGameInfo = useCallback(async () => {
    if (!window.electronAPI?.gameFind) return;
    const info = await window.electronAPI.gameFind();
    setGameInfo(info);
    return info;
  }, []);

  const toggleAttach = useCallback(async () => {
    if (!window.electronAPI) return;
    setAttachError(null);

    if (settings.attachToGame) {
      await window.electronAPI.gameDetach();
      onSettingsChange({ attachToGame: false });
      return;
    }

    const info = await window.electronAPI.gameFind();
    if (!info.found) {
      setAttachError('RuneScape window not found. Open RS3 first, then try again.');
      return;
    }

    await window.electronAPI.gameAttach();
    onSettingsChange({ attachToGame: true });
    setGameInfo(info);
  }, [settings.attachToGame, onSettingsChange]);

  useEffect(() => {
    if (!settings.attachToGame) return;
    const interval = setInterval(refreshGameInfo, 2000);
    return () => clearInterval(interval);
  }, [settings.attachToGame, refreshGameInfo]);

  return { gameInfo, attachError, toggleAttach, refreshGameInfo };
}
