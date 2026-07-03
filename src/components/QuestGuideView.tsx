import type { QuestGuide, QuestProgress } from '../types/quest';
import { openWikiUrl } from '../services/storage';
import RequirementsPanel from './RequirementsPanel';
import StepPanel from './StepPanel';

interface QuestGuideViewProps {
  guide: QuestGuide | null;
  progress: QuestProgress | null;
  loading: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onProgressChange: (updates: Partial<QuestProgress>) => void;
}

export default function QuestGuideView({
  guide,
  progress,
  loading,
  onBack,
  onRefresh,
  onProgressChange,
}: QuestGuideViewProps) {
  if (loading || !guide || !progress) {
    return (
      <div className="guide-loading">
        <div className="spinner" />
        <p>Loading guide from Wiki…</p>
      </div>
    );
  }

  const { metadata, steps } = guide;
  const currentIndex = Math.min(progress.currentStepIndex, Math.max(0, steps.length - 1));
  const currentStep = steps[currentIndex];

  const toggleStepComplete = (stepId: string) => {
    const completed = new Set(progress.completedSteps);
    if (completed.has(stepId)) {
      completed.delete(stepId);
    } else {
      completed.add(stepId);
    }
    onProgressChange({ completedSteps: Array.from(completed) });
  };

  const goToStep = (index: number) => {
    const clamped = Math.max(0, Math.min(index, steps.length - 1));
    onProgressChange({ currentStepIndex: clamped });
  };

  return (
    <div className="quest-guide">
      <div className="guide-header">
        <button type="button" className="btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <div className="guide-title-block">
          <h2>{metadata.name}</h2>
          <div className="guide-badges">
            {metadata.isMiniquest && <span className="badge badge-mini">Miniquest</span>}
            {metadata.members ? (
              <span className="badge badge-p2p">Members</span>
            ) : (
              <span className="badge badge-f2p">F2P</span>
            )}
            <span className="badge badge-length">{metadata.length}</span>
          </div>
        </div>
        <div className="guide-actions">
          <button type="button" className="btn-ghost btn-sm" onClick={onRefresh} title="Refresh from Wiki">
            ↻
          </button>
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={() => openWikiUrl(metadata.wikiUrl)}
            title="Open on RuneScape Wiki"
          >
            Wiki ↗
          </button>
        </div>
      </div>

      <RequirementsPanel metadata={metadata} />

      {steps.length > 0 ? (
        <>
          <StepPanel
            step={currentStep}
            stepNumber={currentIndex + 1}
            totalSteps={steps.length}
            isCompleted={progress.completedSteps.includes(currentStep.id)}
            onToggleComplete={() => toggleStepComplete(currentStep.id)}
          />

          <div className="step-nav">
            <button
              type="button"
              className="btn-nav"
              disabled={currentIndex === 0}
              onClick={() => goToStep(currentIndex - 1)}
            >
              ← Previous
            </button>
            <span className="step-counter">
              {currentIndex + 1} / {steps.length}
            </span>
            <button
              type="button"
              className="btn-nav btn-primary"
              disabled={currentIndex >= steps.length - 1}
              onClick={() => goToStep(currentIndex + 1)}
            >
              Next →
            </button>
          </div>

          <details className="all-steps">
            <summary>All steps ({progress.completedSteps.length}/{steps.length} done)</summary>
            <ol className="step-checklist">
              {steps.map((step, i) => (
                <li key={step.id} className={progress.completedSteps.includes(step.id) ? 'done' : ''}>
                  <label>
                    <input
                      type="checkbox"
                      checked={progress.completedSteps.includes(step.id)}
                      onChange={() => toggleStepComplete(step.id)}
                    />
                    <button
                      type="button"
                      className={`step-link ${i === currentIndex ? 'current' : ''}`}
                      onClick={() => goToStep(i)}
                    >
                      <span className="step-section">{step.sectionTitle}</span>
                      <span className="step-preview">{step.text.slice(0, 80)}{step.text.length > 80 ? '…' : ''}</span>
                    </button>
                  </label>
                </li>
              ))}
            </ol>
          </details>
        </>
      ) : (
        <div className="no-steps">
          <p>No walkthrough steps found. Check the Wiki for the full guide.</p>
          <button type="button" className="btn-primary" onClick={() => openWikiUrl(metadata.wikiUrl)}>
            Open Wiki Guide
          </button>
        </div>
      )}

      <p className="wiki-source">
        Source: <button type="button" className="link-btn" onClick={() => openWikiUrl(metadata.wikiUrl)}>RuneScape Wiki</button>
        {guide.fetchedAt && (
          <span className="fetched-at"> · Updated {new Date(guide.fetchedAt).toLocaleDateString()}</span>
        )}
      </p>
    </div>
  );
}
