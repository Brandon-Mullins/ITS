import { useState } from 'react';
import type { QuestGuide, QuestProgress, ScreenReaderResult } from '../types/quest';
import { openWikiUrl } from '../services/storage';
import { useSmartDetect } from '../hooks/useSmartDetect';
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

  return (
    <div className="quest-guide compact">
      <div className="guide-header compact">
        <button type="button" className="btn-ghost btn-sm" onClick={onBack}>←</button>
        <h2 className="guide-title-compact">{metadata.name}</h2>
        <button type="button" className="btn-ghost btn-sm" onClick={onRefresh}>↻</button>
      </div>

      {metadata.items.length > 0 && (
        <RequirementsPanel
          metadata={metadata}
          collectedItems={progress.collectedItems ?? []}
          bankItems={progress.bankItems ?? []}
          needGeItems={progress.needGeItems ?? []}
          scanning={!lastScan}
          bankOpen={lastScan?.bankOpen ?? false}
        />
      )}

      {steps.length > 0 ? (
        <>
          <StepPanel
            step={currentStep}
            stepNumber={currentIndex + 1}
            totalSteps={steps.length}
            isCompleted={progress.completedSteps.includes(currentStep.id)}
          />

          <div className="step-nav compact">
            <button type="button" className="btn-nav btn-sm" disabled={currentIndex === 0} onClick={() => goToStep(currentIndex - 1)}>←</button>
            <span className="scan-live">
              {lastScan?.bankOpen ? '🏦 Bank' : '👁 Auto'}
            </span>
            <button type="button" className="btn-nav btn-sm" disabled={currentIndex >= steps.length - 1} onClick={() => goToStep(currentIndex + 1)}>→</button>
          </div>
        </>
      ) : (
        <div className="no-steps">
          <button type="button" className="btn-primary btn-sm" onClick={() => openWikiUrl(metadata.wikiUrl)}>Wiki Guide</button>
        </div>
      )}
    </div>
  );
}
