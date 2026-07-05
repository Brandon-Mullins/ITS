import type { AppSettings } from '../types/quest';

interface SettingsPanelProps {
  settings: AppSettings;
  version: string;
  onChange: (updates: Partial<AppSettings>) => void;
  onOpenLayoutTest: () => void;
}

export default function SettingsPanel({
  settings,
  version,
  onChange,
  onOpenLayoutTest,
}: SettingsPanelProps) {
  const setWindowSize = async (width: number, height: number) => {
    await window.electronAPI?.setWindowSize?.(width, height);
  };

  return (
    <div className="settings-panel">
      <h2 className="settings-title">Settings</h2>
      <p className="settings-version">Version: {version}</p>

      <section className="settings-section">
        <h3 className="settings-section-title">Layout</h3>

        <label className="settings-row">
          <input
            type="checkbox"
            checked={settings.layoutDebug ?? false}
            onChange={(e) => onChange({ layoutDebug: e.target.checked })}
          />
          <span>Layout debug outlines</span>
        </label>
        <p className="settings-hint">Shows colored borders around shell, nav, content, footer, and step rail.</p>

        <button type="button" className="settings-action-btn" onClick={onOpenLayoutTest}>
          Open Layout Test
        </button>
        <p className="settings-hint">Stress-test screen — must not clip above minimum window size.</p>
      </section>

      <section className="settings-section">
        <h3 className="settings-section-title">Window size</h3>
        <div className="settings-btn-row">
          <button type="button" className="settings-action-btn" onClick={() => setWindowSize(520, 700)}>
            Default (520×700)
          </button>
          <button type="button" className="settings-action-btn" onClick={() => setWindowSize(360, 520)}>
            Compact (360×520)
          </button>
          <button type="button" className="settings-action-btn" onClick={() => setWindowSize(420, 520)}>
            Minimum (420×520)
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h3 className="settings-section-title">Highlights</h3>
        <p className="settings-hint">
          {version}: No in-game rectangles. Text callouts + helper panel cards only.
        </p>
      </section>
    </div>
  );
}
