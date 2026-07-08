import type { StepWarning } from '../utils/step-analysis';

const SEVERITY_CLASS: Record<StepWarning['severity'], string> = {
  danger: 'warn-danger',
  caution: 'warn-caution',
  info: 'warn-info',
};

const SEVERITY_ICON: Record<StepWarning['severity'], string> = {
  danger: '🛑',
  caution: '⚠',
  info: 'ℹ',
};

interface MistakeWarningsPanelProps {
  warnings: StepWarning[];
}

export default function MistakeWarningsPanel({ warnings }: MistakeWarningsPanelProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="mistake-warnings-panel">
      <div className="qh-section-label">Mistake prevention</div>
      <ul className="warning-list">
        {warnings.map((w) => (
          <li key={w.id} className={`warning-item ${SEVERITY_CLASS[w.severity]}`}>
            <span className="warning-icon">{SEVERITY_ICON[w.severity]}</span>
            <div className="warning-body">
              <span className="warning-title">{w.title}</span>
              <span className="warning-message">{w.message}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
