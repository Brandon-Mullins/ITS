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
  return (
    <div className={`step-panel compact ${isCompleted ? 'completed' : ''}`}>
      <div className="step-panel-header">
        <span className="step-label">Step {stepNumber}/{totalSteps}</span>
        {isCompleted && <span className="step-auto-done">✓ Done</span>}
      </div>
      <p className="step-text">{step.text}</p>
    </div>
  );
}
