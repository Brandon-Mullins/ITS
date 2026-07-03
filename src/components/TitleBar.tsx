import type { AppSettings } from '../types/quest';

interface TitleBarProps {
  settings: AppSettings;
  onSettingsChange: (updates: Partial<AppSettings>) => void;
  onToggleAttach: () => void;
}

export default function TitleBar({
  settings,
  onSettingsChange,
  onToggleAttach,
}: TitleBarProps) {
  return (
    <header className="title-bar">
      <div className="title-bar-drag">
        <span className="title-icon">⚔</span>
        <span className="title-text">RS3 Quest Helper</span>
      </div>
      <div className="title-bar-controls">
        <button
          type="button"
          className={`control-btn ${settings.attachToGame ? 'active' : ''}`}
          title={settings.attachToGame ? 'Detach from RS3' : 'Attach to RS3 window'}
          onClick={onToggleAttach}
        >
          {settings.attachToGame ? '🔒' : '🔗'}
        </button>
        <button
          type="button"
          className={`control-btn ${settings.alwaysOnTop ? 'active' : ''}`}
          title="Toggle always on top"
          onClick={() => onSettingsChange({ alwaysOnTop: !settings.alwaysOnTop })}
        >
          📌
        </button>
        <button
          type="button"
          className="control-btn"
          title="Minimize"
          onClick={() => window.electronAPI?.minimize()}
        >
          ─
        </button>
        <button
          type="button"
          className="control-btn close"
          title="Close"
          onClick={() => window.electronAPI?.close()}
        >
          ×
        </button>
      </div>
    </header>
  );
}
