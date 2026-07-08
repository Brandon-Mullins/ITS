import { useEffect } from 'react';
import type { AppSettings, QuestProgress, QuestStep, ScreenReaderResult } from '../types/quest';
import {
  buildClickTargetCards,
  cardsToHighlightTargets,
  inventoryHighlightItems,
} from '../utils/click-targets';
import { getDialogueNextIndex, getUseOnPairs } from '../utils/step-analysis';
import { buildNpcNavigation, minimapMarkerPosition } from '../utils/npc-navigation';
import { resolveTravelBrain } from '../services/travel-brain';

interface UseGameHighlightsOptions {
  step: QuestStep | null;
  progress?: QuestProgress | null;
  scanResult?: ScreenReaderResult | null;
  settings?: AppSettings;
  enabled?: boolean;
  travelBrain?: ReturnType<typeof resolveTravelBrain> | null;
}

/** Push click targets to Electron game overlay — safe UI-only by default (v0.6.4) */
export function useGameHighlights({
  step,
  progress,
  scanResult,
  settings,
  enabled = true,
  travelBrain = null,
}: UseGameHighlightsOptions) {
  const mode = settings?.highlightMode ?? 'ui-only';
  const debugOverlay = settings?.debugOverlay ?? false;
  const calibration = settings?.inventoryCalibration ?? null;

  useEffect(() => {
    if (!enabled || !step || !progress || !window.electronAPI?.updateHighlights) {
      window.electronAPI?.clearHighlights?.();
      return;
    }

    if (mode === 'off') {
      window.electronAPI.clearHighlights();
      return;
    }

    const cards = buildClickTargetCards(step, progress);
    const targets = cardsToHighlightTargets(cards);
    const invItems = inventoryHighlightItems(targets);
    const useOnPairs = getUseOnPairs(cards);
    const dialogueIdx = getDialogueNextIndex(step.dialogueChoices ?? [], scanResult?.ocrSnippet ?? '');
    const dialogueNext = step.dialogueChoices?.[dialogueIdx];

    const npcNav = travelBrain ? buildNpcNavigation(step, travelBrain) : null;
    const minimap = npcNav ? minimapMarkerPosition(npcNav.compassAngle) : null;

    window.electronAPI.updateHighlights({
      mode,
      debugOverlay,
      targets: targets.map((t) => ({
        type: t.type,
        label: t.label,
        action: t.action,
        itemName: t.itemName,
        targetName: t.targetName,
      })),
      inventoryItems: invItems,
      useOnPairs,
      dialogueNext,
      inventorySlots: scanResult?.inventorySlots ?? [],
      inventoryCalibration: calibration,
      ocrDebugBoxes: scanResult?.ocrDebugBoxes ?? [],
      navigation: npcNav && minimap ? {
        npcName: npcNav.npcName,
        compassLabel: npcNav.compassLabel,
        compassAngle: npcNav.compassAngle,
        landmark: npcNav.landmark,
        minimapX: minimap.x,
        minimapY: minimap.y,
      } : undefined,
    });

    return () => {
      window.electronAPI?.clearHighlights?.();
    };
  }, [step, progress, scanResult, mode, debugOverlay, calibration, enabled, travelBrain]);
}
