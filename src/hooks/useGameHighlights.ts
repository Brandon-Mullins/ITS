import { useEffect } from 'react';
import type { QuestStep } from '../types/quest';
import { getClickTargets, inventoryHighlightItems, targetsNeedInventoryHighlight } from '../utils/click-targets';

interface UseGameHighlightsOptions {
  step: QuestStep | null;
  enabled?: boolean;
}

/** Push click targets to Electron game overlay for blue aura highlights */
export function useGameHighlights({ step, enabled = true }: UseGameHighlightsOptions) {
  useEffect(() => {
    if (!enabled || !step || !window.electronAPI?.updateHighlights) {
      window.electronAPI?.clearHighlights?.();
      return;
    }

    const targets = getClickTargets(step);
    const invItems = inventoryHighlightItems(targets);

    window.electronAPI.updateHighlights({
      targets: targets.map((t) => ({
        type: t.type,
        label: t.label,
        action: t.action,
        itemName: t.itemName,
      })),
      highlightInventory: targetsNeedInventoryHighlight(targets),
      inventoryItems: invItems,
    });

    return () => {
      window.electronAPI?.clearHighlights?.();
    };
  }, [step, enabled]);
}
