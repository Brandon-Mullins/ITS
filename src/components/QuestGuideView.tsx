import { useState } from 'react';
import type { QuestGuide, QuestProgress, ScreenReaderResult } from '../types/quest';
import { openWikiUrl } from '../services/storage';
import { useSmartDetect } from '../hooks/useSmartDetect';
import StepPanel from './StepPanel';

interface QuestGuideViewProps {
  guide: QuestGuide | null;
  progress: QuestProgress | null;
  loading: boolean;
  questStatus?: string | null;
  uiMode?: 'newbie' | 'veteran' | 'standard';
  onBack: () => void;
  onRefresh: () => void;
  onProgressChange: (updates: Partial<QuestProgress>) => void;
}

export default function QuestGuideView({
  guide,
  progress,
  loading,
  questStatus,
  uiMode = 'standard',
  onBack,
  onRefresh,
  onProgressChange,
}: QuestGuideViewProps) {
  const [lastScan, setLastScan] = useState<ScreenReaderResult | null>(null);

  useSmartDetect({
    enabled: true,
    guide,
    progress,
    onProgressChange,
    onScanResult: setLastScan,
  });

  if (loading || !guide || !progress) {
    return (
      <div className="guide-loading">
        <div className="spinner" />
        <p>Loading guide…</p>
      </div>
    );
  }

  const { metadata, steps } = guide;
  const currentIndex = Math.min(progress.currentStepIndex, Math.max(0, steps.length - 1));
  const currentStep = steps[currentIndex];

  const goToStep = (index: number) => {
    onProgressChange({ currentStepIndex: Math.max(0, Math.min(index, steps.length - 1)) });
  };

  const markStepDone = () => {
    const stepId = currentStep.id;
    const completed = new Set(progress.completedSteps);
    completed.add(stepId);
    const nextIndex = Math.min(currentIndex + 1, steps.length - 1);
    onProgressChange({
      completedSteps: Array.from(completed),
      currentStepIndex: nextIndex > currentIndex ? nextIndex : currentIndex,
    });
  };

  return (
    <div className="quest-guide compact">
      <div className="guide-header compact">
        <button type="button" className="btn-ghost btn-sm" onClick={onBack}>←</button>
        <div className="guide-title-block">
          <h2 className="guide-title-compact">{metadata.name}</h2>
          <div className="guide-badges compact-badges">
            {guide.source === 'curated' && (
              <span className="badge badge-curated">Official guide</span>
            )}
            {questStatus && (
              <span className={`status-pill pill-${questStatus}`}>{questStatus}</span>
            )}
          </div>
        </div>
        <button type="button" className="btn-ghost btn-sm" onClick={onRefresh}>↻</button>
      </div>

      {(metadata.requirements.length > 0 || metadata.skillRequirements.length > 0) && (
        <details className="quest-reqs compact-reqs">
          <summary>Requirements</summary>
          {metadata.skillRequirements.length > 0 && (
            <ul className="req-list">
              {metadata.skillRequirements.map((r) => (
                <li key={r.skill}>{r.skill} {r.level}</li>
              ))}
            </ul>
          )}
          {metadata.requirements.length > 0 && (
            <ul className="req-list">
              {metadata.requirements.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
        </details>
      )}

      {steps.length > 0 ? (
        <>
          <StepPanel
            step={currentStep}
            stepNumber={currentIndex + 1}
            totalSteps={steps.length}
            isCompleted={progress.completedSteps.includes(currentStep.id)}
            metadata={metadata}
            pageName={metadata.pageName}
            collectedItems={progress.collectedItems ?? []}
            bankItems={progress.bankItems ?? []}
            needGeItems={progress.needGeItems ?? []}
            bankOpen={lastScan?.bankOpen ?? false}
            questStatus={questStatus}
            uiMode={uiMode}
          />

          <div className="step-nav compact">
            <button
              type="button"
              className="btn-nav btn-sm"
              disabled={currentIndex === 0}
              onClick={() => goToStep(currentIndex - 1)}
            >
              ←
            </button>
            <button type="button" className="btn-done btn-sm" onClick={markStepDone}>
              Done
            </button>
            <span className="scan-live">
              {lastScan?.bankOpen ? '🏦 Bank' : '👁 Auto'}
            </span>
            <button
              type="button"
              className="btn-nav btn-sm"
              disabled={currentIndex >= steps.length - 1}
              onClick={() => goToStep(currentIndex + 1)}
            >
              →
            </button>
          </div>

          <details className="all-steps compact-steps">
            <summary>All steps ({steps.length})</summary>
            <ul className="step-checklist">
              {steps.map((step, i) => (
                <li key={step.id} className={progress.completedSteps.includes(step.id) ? 'done' : ''}>
                  <button
                    type="button"
                    className={`step-link ${i === currentIndex ? 'current' : ''}`}
                    onClick={() => goToStep(i)}
                  >
                    <span className="step-section">{step.sectionTitle}</span>
                    <span className="step-preview">{step.text.slice(0, 60)}…</span>
                  </button>
                </li>
              ))}
            </ul>
          </details>
        </>
      ) : (
        <div className="no-steps">
          <button type="button" className="btn-primary btn-sm" onClick={() => openWikiUrl(metadata.wikiUrl)}>
            Wiki Guide
          </button>
        </div>
      )}
    </div>
  );
}
