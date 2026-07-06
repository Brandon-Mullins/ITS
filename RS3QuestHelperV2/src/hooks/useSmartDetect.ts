import { useEffect, useRef } from 'react';
import type { QuestGuide, QuestProgress, ScreenReaderResult, ProgressUpdater } from '../types/quest';
import { itemLabelMatches } from '../utils/item-match';

function stepKeywordsFromStep(step: QuestGuide['steps'][0]): string[] {
  const checks = step.completionChecks;
  const keywords = new Set<string>();
  for (const phrase of checks?.chatContains ?? []) {
    for (const word of phrase.toLowerCase().split(/\s+/)) {
      if (word.length >= 4) keywords.add(word);
    }
  }
  for (const phrase of checks?.locationContains ?? []) {
    for (const word of phrase.toLowerCase().split(/\s+/)) {
      if (word.length >= 4) keywords.add(word);
    }
  }
  if (step.npc) {
    for (const word of step.npc.toLowerCase().split(/\s+/)) {
      if (word.length >= 4) keywords.add(word);
    }
  }
  return keywords.size > 0 ? Array.from(keywords) : [];
}

interface UseSmartDetectOptions {
  enabled: boolean;
  guide: QuestGuide | null;
  progress: QuestProgress | null;
  inventoryCalibration?: import('../types/quest').InventoryCalibration | null;
  onProgressChange: (updates: ProgressUpdater) => void;
  onScanResult?: (result: ScreenReaderResult) => void;
}

export function useSmartDetect({
  enabled,
  guide,
  progress,
  inventoryCalibration,
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
      items: [...new Set([
        ...guide.metadata.items,
        ...guide.metadata.recommended,
        ...(currentStep?.stepItems ?? []),
        ...(currentStep?.recommendedItems ?? []),
      ])],
      currentStepText: currentStep?.text ?? '',
      stepKeywords: currentStep ? stepKeywordsFromStep(currentStep) : [],
      completionChecks: currentStep?.completionChecks,
      inventoryCalibration: inventoryCalibration ?? null,
    });

    const unsubscribe = window.electronAPI.onScreenReaderResult((result) => {
      onScanResult?.(result);
      const current = progressRef.current;
      if (!current || !guide) return;

      onProgressChange((latest) => {
        const updates: Partial<QuestProgress> = {};
        let changed = false;

        const collected = new Set(latest.collectedItems ?? []);
        const toAdd = [
          ...result.detectedItems,
          ...(result.inventorySlots ?? []).map((s) => s.item),
        ];
        for (const item of toAdd) {
          const already = [...collected].some((c) => itemLabelMatches(c, item));
          if (!already) {
            collected.add(item);
            changed = true;
          }
        }
        if (changed) updates.collectedItems = Array.from(collected);

        const bank = new Set(latest.bankItems ?? []);
        for (const item of result.bankItems) {
          bank.add(item);
        }
        if (result.bankItems.length > 0) {
          updates.bankItems = Array.from(bank);
        }

        const needGe = new Set(result.needGeItems);
        for (const item of [...needGe]) {
          if (collected.has(item) || bank.has(item)) needGe.delete(item);
        }
        if (needGe.size > 0 || (latest.needGeItems ?? []).length > 0) {
          updates.needGeItems = Array.from(needGe);
        }

        if (result.suggestStepComplete && guide.steps[latest.currentStepIndex]) {
          const stepId = guide.steps[latest.currentStepIndex].id;
          const completed = new Set(latest.completedSteps);
          if (!completed.has(stepId)) {
            completed.add(stepId);
            updates.completedSteps = Array.from(completed);
            const nextIndex = Math.min(latest.currentStepIndex + 1, guide.steps.length - 1);
            if (nextIndex > latest.currentStepIndex) {
              updates.currentStepIndex = nextIndex;
            }
          }
        }

        return updates;
      });
    });

    return () => {
      unsubscribe();
      window.electronAPI?.screenReaderStop?.();
    };
  }, [enabled, guide, progress?.currentStepIndex, inventoryCalibration, onProgressChange, onScanResult]);
}
