import { useEffect, useRef } from 'react';
import type { QuestGuide, QuestProgress, ScreenReaderResult } from '../types/quest';

interface UseSmartDetectOptions {
  enabled: boolean;
  guide: QuestGuide | null;
  progress: QuestProgress | null;
  onProgressChange: (updates: Partial<QuestProgress>) => void;
  onScanResult?: (result: ScreenReaderResult) => void;
}

export function useSmartDetect({
  enabled,
  guide,
  progress,
  onProgressChange,
  onScanResult,
}: UseSmartDetectOptions) {
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    if (!enabled || !guide || !progress || !window.electronAPI?.screenReaderStart) {
      window.electronAPI?.screenReaderStop?.();
      return;
    }

    const steps = guide.steps;
    const currentIndex = Math.min(progress.currentStepIndex, steps.length - 1);
    const currentStep = steps[currentIndex];

    window.electronAPI.screenReaderStart({
      items: guide.metadata.items,
      currentStepText: currentStep?.text ?? '',
      stepKeywords: [],
    });

    const unsubscribe = window.electronAPI.onScreenReaderResult((result) => {
      onScanResult?.(result);
      const current = progressRef.current;
      if (!current || !guide) return;

      const collected = new Set(current.collectedItems ?? []);
      let changed = false;
      for (const item of result.detectedItems) {
        if (!collected.has(item)) {
          collected.add(item);
          changed = true;
        }
      }

      const updates: Partial<QuestProgress> = {};
      if (changed) {
        updates.collectedItems = Array.from(collected);
      }

      if (result.suggestStepComplete && guide.steps[current.currentStepIndex]) {
        const stepId = guide.steps[current.currentStepIndex].id;
        const completed = new Set(current.completedSteps);
        if (!completed.has(stepId)) {
          completed.add(stepId);
          updates.completedSteps = Array.from(completed);
          const nextIndex = Math.min(current.currentStepIndex + 1, guide.steps.length - 1);
          if (nextIndex > current.currentStepIndex) {
            updates.currentStepIndex = nextIndex;
          }
        }
      }

      if (Object.keys(updates).length > 0) {
        onProgressChange(updates);
      }
    });

    return () => {
      unsubscribe();
      window.electronAPI?.screenReaderStop?.();
    };
  }, [enabled, guide, progress?.currentStepIndex, onProgressChange, onScanResult]);
}
