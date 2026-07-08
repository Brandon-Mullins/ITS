import type { AppSettings } from '../types/quest';

interface TitleBarProps {
  settings: AppSettings;
  version?: string;
  onSettingsChange: (updates: Partial<AppSettings>) => void;
  onToggleAttach: () => void;
}

export default function TitleBar({
  settings,
  version,
  onSettingsChange,
  onToggleAttach,
}: TitleBarProps) {
  return (
    <header className="title-bar v2-title-bar">
      <div className="title-bar-drag">
        <span className="title-icon">⚔</span>
        <span className="title-text">RS3 Quest Helper V2</span>
        {version && <span className="title-version v2-version-badge">{version}</span>}
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
          className="control-btn"
          title={`UI mode: ${settings.uiMode ?? 'standard'} (click to cycle)`}
          onClick={() => {
            const modes = ['standard', 'newbie', 'veteran'] as const;
            const idx = modes.indexOf(settings.uiMode ?? 'standard');
            onSettingsChange({ uiMode: modes[(idx + 1) % modes.length] });
          }}
        >
          {settings.uiMode === 'veteran' ? '⚡' : settings.uiMode === 'newbie' ? '🌱' : '◎'}
        </button>
        <button
          type="button"
          className={`control-btn ${settings.accessibility?.highContrast ? 'active' : ''}`}
          title="Toggle high contrast"
          onClick={() =>
            onSettingsChange({
              accessibility: {
                ...settings.accessibility,
                largeText: settings.accessibility?.largeText ?? false,
                highContrast: !settings.accessibility?.highContrast,
              },
            })
          }
        >
          ◐
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
