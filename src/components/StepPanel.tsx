import type { QuestStep } from '../types/quest';

interface StepPanelProps {
  step: QuestStep;
  stepNumber: number;
  totalSteps: number;
  isCompleted: boolean;
  onToggleComplete: () => void;
}

export default function StepPanel({
  step,
  stepNumber,
  totalSteps,
  isCompleted,
  onToggleComplete,
}: StepPanelProps) {
  return (
    <div className={`step-panel ${isCompleted ? 'completed' : ''}`}>
      <div className="step-panel-header">
        <span className="step-label">Step {stepNumber} of {totalSteps}</span>
        <span className="step-section-tag">{step.sectionTitle}</span>
      </div>

      <p className="step-text">{step.text}</p>

      <label className="step-complete-toggle">
        <input type="checkbox" checked={isCompleted} onChange={onToggleComplete} />
        <span>Mark step complete</span>
      </label>
    </div>
  );
}
