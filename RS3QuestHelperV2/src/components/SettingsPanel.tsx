import type { AppSettings } from '../types/quest';
import HighlightSettingsPanel from './HighlightSettingsPanel';

interface SettingsPanelProps {
  settings: AppSettings;
  version: string;
  onChange: (updates: Partial<AppSettings>) => void;
  onOpenLayoutTest: () => void;
  onCalibrateInventory?: () => void;
  calibrating?: boolean;
}

export default function SettingsPanel({
  settings,
  version,
  onChange,
  onOpenLayoutTest,
  onCalibrateInventory,
  calibrating,
}: SettingsPanelProps) {
  const setWindowSize = async (width: number, height: number) => {
    await window.electronAPI?.setWindowSize?.(width, height);
  };

  return (
    <div className="settings-panel">
      <h2 className="settings-title">Settings</h2>
      <p className="settings-version">Version: {version}</p>

      <section className="settings-section">
        <h3 className="settings-section-title">Questing</h3>
        <label className="settings-row">
          <input
            type="checkbox"
            checked={settings.focusMode ?? true}
            onChange={(e) => onChange({ focusMode: e.target.checked })}
          />
          <span>Focus mode — hide sidebar while questing</span>
        </label>
        <p className="settings-hint">Hides nav when a guide is open so the GPS view uses full width.</p>
      </section>

      <section className="settings-section">
        <h3 className="settings-section-title">In-game highlights (Advanced)</h3>
        {onCalibrateInventory && (
          <HighlightSettingsPanel
            settings={settings}
            onChange={onChange}
            onCalibrate={onCalibrateInventory}
            calibrating={calibrating}
          />
        )}
      </section>

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
        <button type="button" className="settings-action-btn" onClick={onOpenLayoutTest}>
          Open Layout Test
        </button>
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
    </div>
  );
}
