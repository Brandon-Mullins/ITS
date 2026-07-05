import { useEffect } from 'react';
import type { QuestProgress, QuestStep, ScreenReaderResult } from '../types/quest';
import {
  buildClickTargetCards,
  cardsToHighlightTargets,
  inventoryHighlightItems,
  targetsNeedInventoryHighlight,
} from '../utils/click-targets';
import { getDialogueNextIndex, getUseOnPairs } from '../utils/step-analysis';

interface UseGameHighlightsOptions {
  step: QuestStep | null;
  progress?: QuestProgress | null;
  scanResult?: ScreenReaderResult | null;
  enabled?: boolean;
}

/** Push click targets to Electron game overlay for blue aura highlights */
export function useGameHighlights({ step, progress, scanResult, enabled = true }: UseGameHighlightsOptions) {
  useEffect(() => {
    if (!enabled || !step || !progress || !window.electronAPI?.updateHighlights) {
      window.electronAPI?.clearHighlights?.();
      return;
    }

    const cards = buildClickTargetCards(step, progress);
    const targets = cardsToHighlightTargets(cards);
    const invItems = inventoryHighlightItems(targets);
    const useOnPairs = getUseOnPairs(cards);
    const dialogueIdx = getDialogueNextIndex(step.dialogueChoices ?? [], scanResult?.ocrSnippet ?? '');
    const dialogueNext = step.dialogueChoices?.[dialogueIdx];

    window.electronAPI.updateHighlights({
      targets: targets.map((t) => ({
        type: t.type,
        label: t.label,
        action: t.action,
        itemName: t.itemName,
        targetName: t.targetName,
      })),
      highlightInventory: targetsNeedInventoryHighlight(targets),
      inventoryItems: invItems,
      useOnPairs,
      dialogueNext,
    });

    return () => {
      window.electronAPI?.clearHighlights?.();
    };
  }, [step, progress, scanResult, enabled]);
}
