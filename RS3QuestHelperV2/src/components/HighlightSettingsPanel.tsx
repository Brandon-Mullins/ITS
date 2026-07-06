import type { AppSettings, HighlightMode } from '../types/quest';

const MODE_LABELS: Record<HighlightMode, string> = {
  off: 'Off — no in-game overlay',
  'ui-only': 'UI only — small text callouts (default, NO rectangles)',
  'inventory-only': 'Inventory only — text callouts only (rectangles disabled)',
  'experimental-world': 'Experimental — may be inaccurate',
};

interface HighlightSettingsPanelProps {
  settings: AppSettings;
  onChange: (updates: Partial<AppSettings>) => void;
  onCalibrate: () => void;
  calibrating?: boolean;
}

export default function HighlightSettingsPanel({
  settings,
  onChange,
  onCalibrate,
  calibrating,
}: HighlightSettingsPanelProps) {
  const mode = settings.highlightMode ?? 'ui-only';
  const hasCalibration = Boolean(settings.inventoryCalibration);
  const isExperimental = mode === 'experimental-world';

  return (
    <div className="highlight-settings-panel">
      <div className="highlight-settings-header">
        <span className="qh-section-label">In-game highlights — {settings.highlightMode ?? 'ui-only'}</span>
      </div>

      {isExperimental && (
        <div className="experimental-warning-banner" role="alert">
          Experimental highlights may be inaccurate.
        </div>
      )}

      <p className="highlight-settings-note">
        <strong>v0.6.4-HIGHLIGHT-FIX:</strong> No inventory, world, or minimap rectangles. Only small top text callouts + helper panel cards.
      </p>

      <label className="highlight-setting-row">
        <span>Accuracy mode</span>
        <select
          value={mode}
          onChange={(e) => onChange({ highlightMode: e.target.value as HighlightMode })}
        >
          {(Object.keys(MODE_LABELS) as HighlightMode[]).map((m) => (
            <option key={m} value={m}>{MODE_LABELS[m]}</option>
          ))}
        </select>
      </label>

      <label className="highlight-setting-check">
        <input
          type="checkbox"
          checked={settings.debugOverlay ?? false}
          onChange={(e) => onChange({ debugOverlay: e.target.checked })}
        />
        Debug overlay — thin dashed debug lines only (not blue highlights)
      </label>

      <div className="highlight-calibration-row">
        <button type="button" className="highlight-calibrate-btn" onClick={onCalibrate} disabled={calibrating}>
          {calibrating ? 'Calibrating…' : 'Calibrate inventory'}
        </button>
        <span className={`calibration-status ${hasCalibration ? 'ok' : ''}`}>
          {hasCalibration ? '✓ Custom region saved' : 'Default estimate'}
        </span>
      </div>
    </div>
  );
}
