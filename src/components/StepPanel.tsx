import type { QuestStep } from '../types/quest';

interface StepPanelProps {
  step: QuestStep;
  stepNumber: number;
  totalSteps: number;
  isCompleted: boolean;
}

export default function StepPanel({
  step,
  stepNumber,
  totalSteps,
  isCompleted,
}: StepPanelProps) {
  const hints = step.travelHints ?? [];

  return (
    <div className={`step-panel compact ${isCompleted ? 'completed' : ''}`}>
      <div className="step-panel-header">
        <span className="step-label">Step {stepNumber}/{totalSteps}</span>
        {isCompleted && <span className="step-auto-done">✓ Done</span>}
      </div>
      <p className="step-text">{step.text}</p>

      {hints.length > 0 && (
        <div className="travel-hints">
          {hints.map((hint) => (
            <div key={hint.location} className="travel-hint-block">
              <span className="travel-heading">🗺 Fastest route to {hint.location}</span>
              <ol className="travel-methods">
                {hint.methods.map((m, i) => (
                  <li key={m.name} className={i === 0 ? 'travel-best' : ''}>
                    <strong>{m.name}</strong>
                    {m.members && <span className="badge badge-p2p travel-p2p">P2P</span>}
                    <span className="travel-detail"> — {m.detail}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
