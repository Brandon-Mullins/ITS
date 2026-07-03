import type { AppSettings } from '../types/quest';

interface TitleBarProps {
  settings: AppSettings;
  onSettingsChange: (updates: Partial<AppSettings>) => void;
}

export default function TitleBar({ settings, onSettingsChange }: TitleBarProps) {
  const handleMinimize = () => {
    window.electronAPI?.minimize();
  };

  const handleClose = () => {
    window.electronAPI?.close();
  };

  return (
    <header className="title-bar">
      <div className="title-bar-drag">
        <span className="title-icon">⚔</span>
        <span className="title-text">RS3 Quest Helper</span>
      </div>
      <div className="title-bar-controls">
        <button
          type="button"
          className={`control-btn ${settings.alwaysOnTop ? 'active' : ''}`}
          title="Toggle always on top"
          onClick={() => onSettingsChange({ alwaysOnTop: !settings.alwaysOnTop })}
        >
          📌
        </button>
        <button type="button" className="control-btn" title="Minimize" onClick={handleMinimize}>
          ─
        </button>
        <button type="button" className="control-btn close" title="Close" onClick={handleClose}>
          ×
        </button>
      </div>
    </header>
  );
}
