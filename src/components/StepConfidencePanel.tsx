import type { ConfidenceSignal } from '../utils/step-analysis';

const STATUS_ICON: Record<ConfidenceSignal['status'], string> = {
  detected: '✓',
  waiting: '◌',
  missing: '✗',
  unknown: '—',
};

const STATUS_CLASS: Record<ConfidenceSignal['status'], string> = {
  detected: 'conf-detected',
  waiting: 'conf-waiting',
  missing: 'conf-missing',
  unknown: 'conf-unknown',
};

interface StepConfidencePanelProps {
  signals: ConfidenceSignal[];
  scanning?: boolean;
}

export default function StepConfidencePanel({ signals, scanning }: StepConfidencePanelProps) {
  return (
    <div className="step-confidence-panel">
      <div className="step-confidence-header">
        <span className="qh-section-label">Step confidence</span>
        {scanning && <span className="scan-pulse">Scanning…</span>}
      </div>
      <ul className="confidence-list">
        {signals.map((s) => (
          <li key={s.id} className={`confidence-item ${STATUS_CLASS[s.status]}`}>
            <span className="confidence-icon">{STATUS_ICON[s.status]}</span>
            <div className="confidence-body">
              <span className="confidence-label">{s.label}</span>
              {s.detail && <span className="confidence-detail">{s.detail}</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
