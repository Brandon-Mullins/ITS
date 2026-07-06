import type { AppSettings, HighlightMode } from '../types/quest';

const MODE_LABELS: Record<HighlightMode, string> = {
  off: 'Off — no in-game overlay',
  'ui-only': 'UI only — small callouts (default)',
  'inventory-only': 'Inventory only — precise slots when detected',
  'experimental-world': 'Experimental — world markers (inaccurate)',
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

  return (
    <div className="highlight-settings-panel">
      <div className="highlight-settings-header">
        <span className="qh-section-label">In-game highlights (v0.6.4)</span>
      </div>
      <p className="highlight-settings-note">
        Bad highlights are worse than none. Default is safe UI-only callouts — no giant rectangles.
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
        Debug overlay — show RS3 bounds, inventory region, OCR boxes, draw log
      </label>

      <div className="highlight-calibration-row">
        <button type="button" className="highlight-calibrate-btn" onClick={onCalibrate} disabled={calibrating}>
          {calibrating ? 'Calibrating…' : 'Calibrate inventory'}
        </button>
        <span className={`calibration-status ${hasCalibration ? 'ok' : ''}`}>
          {hasCalibration ? '✓ Custom inventory region saved' : 'Using default inventory estimate'}
        </span>
      </div>

      {hasCalibration && settings.inventoryCalibration && (
        <p className="calibration-detail">
          Region: {Math.round(settings.inventoryCalibration.left * 100)}%,
          {' '}{Math.round(settings.inventoryCalibration.top * 100)}% ·
          {' '}{Math.round(settings.inventoryCalibration.width * 100)}%×{Math.round(settings.inventoryCalibration.height * 100)}%
        </p>
      )}
    </div>
  );
}
