import { useMemo, useState, useEffect } from 'react';
import type { QuestGuide, QuestProgress, ScreenReaderResult, AppSettings, ProgressUpdater, GameWindowInfo } from '../types/quest';
import type { PlayerQuestData } from '../utils/quest-match';
import { openWikiUrl } from '../services/storage';
import { useSmartDetect } from '../hooks/useSmartDetect';
import { resolveTravelBrain } from '../services/travel-brain';
import GpsTeleportPanel from './GpsTeleportPanel';
import GpsNpcGuide from './GpsNpcGuide';
import DialogueHelper from './DialogueHelper';
import MistakeWarningsPanel from './MistakeWarningsPanel';
import StepDebugPanel from './StepDebugPanel';
import MarkerPlaceholders from './MarkerPlaceholders';
import ItemShoppingList from './ItemShoppingList';
import UseOnHelper from './UseOnHelper';
import {
  GpsMissingItems,
  GpsHeroClickTarget,
  GpsConfidenceBadge,
  GpsTips,
  GpsAdvancedSection,
  buildStepTips,
} from './QuestGpsCards';
import { buildClickTargetCards, inventoryHighlightItems, getClickTargets } from '../utils/click-targets';
import { effectiveCollectedItems, itemLabelMatches } from '../utils/item-match';
import {
  buildConfidenceSignals,
  buildStepWarnings,
  buildStepDebugInfo,
  getUseOnPairs,
  getDialogueNextIndex,
} from '../utils/step-analysis';
import { useGameHighlights } from '../hooks/useGameHighlights';
import { buildNpcNavigation } from '../utils/npc-navigation';

interface QuestHelperPanelProps {
  guide: QuestGuide;
  progress: QuestProgress;
  playerData?: PlayerQuestData | null;
  uiMode?: 'newbie' | 'veteran' | 'standard';
  onBack: () => void;
  onRefresh: () => void;
  onProgressChange: (updates: ProgressUpdater) => void;
  onDetach?: () => void;
  isAttached?: boolean;
  scanResult?: ScreenReaderResult | null;
  scanning?: boolean;
  gameInfo?: GameWindowInfo | null;
  debugOpen?: boolean;
  onDebugToggle?: () => void;
  highlightSettings?: AppSettings;
}

export default function QuestHelperPanel({
  guide,
  progress,
  playerData = null,
  onBack,
  onProgressChange,
  onDetach,
  isAttached,
  scanResult = null,
  scanning = false,
  gameInfo = null,
  debugOpen = false,
  onDebugToggle,
  highlightSettings,
}: QuestHelperPanelProps) {
  const { metadata, steps } = guide;
  const currentIndex = Math.min(progress.currentStepIndex, Math.max(0, steps.length - 1));
  const step = steps[currentIndex];
  const stepItems = (step.stepItems?.length ?? 0) > 0 ? step.stepItems : metadata.items;
  const manualMarks = progress.manuallyMarkedItems ?? [];
  const bank = progress.bankItems ?? [];
  const ge = progress.needGeItems ?? [];
  const detected = useMemo(() => {
    const fromScan = scanResult?.detectedItems ?? [];
    const fromSlots = (scanResult?.inventorySlots ?? []).map((s) => s.item);
    const merged = [...fromScan];
    for (const slotItem of fromSlots) {
      if (!merged.some((e) => itemLabelMatches(e, slotItem))) merged.push(slotItem);
    }
    return merged;
  }, [scanResult]);

  const isStepComplete = progress.completedSteps.includes(step.id);

  const effectiveInv = useMemo(
    () => effectiveCollectedItems(manualMarks, detected, stepItems),
    [manualMarks, detected, stepItems],
  );

  const effectiveProgress = useMemo(
    () => ({ ...progress, collectedItems: effectiveInv }),
    [progress, effectiveInv],
  );

  const markItemObtained = (item: string) => {
    onProgressChange((prev) => {
      const current = prev.manuallyMarkedItems ?? [];
      if (current.some((e) => itemLabelMatches(e, item))) return {};
      return { manuallyMarkedItems: [...current, item] };
    });
  };

  const travelBrain = useMemo(
    () => resolveTravelBrain(step, playerData, highlightSettings),
    [step, playerData, highlightSettings],
  );

  const npcNav = useMemo(
    () => buildNpcNavigation(step, travelBrain),
    [step, travelBrain],
  );

  const goTo = (i: number) => onProgressChange({ currentStepIndex: i });

  const markDone = () => {
    const completed = new Set(progress.completedSteps);
    completed.add(step.id);
    const next = Math.min(currentIndex + 1, steps.length - 1);
    onProgressChange({
      completedSteps: Array.from(completed),
      currentStepIndex: next > currentIndex ? next : currentIndex,
    });
  };

  const gameDetected = Boolean(
    isAttached || (gameInfo?.found && gameInfo.bounds) || scanResult?.gameBounds,
  );

  const clickCards = buildClickTargetCards(step, effectiveProgress, guide.itemBrain);
  const clickTargetItems = inventoryHighlightItems(getClickTargets(step));
  const useOnPairs = getUseOnPairs(clickCards);
  const confidence = buildConfidenceSignals(step, effectiveProgress, scanResult);
  const warnings = buildStepWarnings(step, guide, effectiveProgress, clickCards);
  const debugInfo = buildStepDebugInfo(guide, progress, scanResult);
  const dialogueNext = getDialogueNextIndex(step.dialogueChoices ?? [], scanResult?.ocrSnippet ?? '');
  const tips = buildStepTips(guide.itemBrain, stepItems, bank, detected, manualMarks);

  const confComplete = confidence.filter((s) => s.status === 'detected').length;
  const confAllGood = confidence.every((s) => s.status === 'detected' || s.status === 'unknown');

  return (
    <div className="qh-panel qh-gps-panel">
      <header className="qh-header qh-gps-header">
        <button type="button" className="qh-icon-btn" onClick={onBack} title="Back">←</button>
        <div className="qh-header-text">
          <h1 className="qh-quest-name">{metadata.name}</h1>
          <span className="qh-gps-step">Step {currentIndex + 1} of {steps.length}</span>
        </div>
        <button type="button" className="qh-icon-btn" onClick={() => openWikiUrl(metadata.wikiUrl)} title="Wiki">📖</button>
      </header>

      {isAttached && onDetach && (
        <div className="qh-detach-bar">
          <span>Locked to RS3 — hides when game loses focus</span>
          <button type="button" className="qh-detach-btn" onClick={onDetach}>Detach</button>
        </div>
      )}

      <div className="qh-body qh-gps-body">
        <nav className="qh-step-rail" aria-label="Steps">
          {steps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`qh-step-dot ${i === currentIndex ? 'active' : ''} ${progress.completedSteps.includes(s.id) ? 'done' : ''}`}
              onClick={() => goTo(i)}
              title={`Step ${i + 1}`}
            >
              <span className="qh-step-num">{i + 1}</span>
            </button>
          ))}
        </nav>

        <div className="qh-main qh-gps-main">
          {isStepComplete ? (
            <div className="gps-step-complete">
              <div className="gps-complete-badge">Completed ✓</div>
              <p className="gps-complete-hint">Press Next for the next step.</p>
            </div>
          ) : (
            <>
              <GpsMissingItems
                items={stepItems}
                manualMarks={manualMarks}
                bank={bank}
                detected={detected}
                scanning={scanning}
                onMarkItem={markItemObtained}
              />
              {!isAttached && !gameDetected && (
                <div className="gps-scan-warn">
                  RS3 window not detected — open RuneScape, then tap 🔗 Attach in the title bar.
                </div>
              )}
              {isAttached && scanResult && !scanResult.inventoryScanned && (
                <div className="gps-scan-warn gps-scan-pending">
                  Scanning inventory… keep RS3 visible on screen.
                </div>
              )}
              <GpsTeleportPanel travel={travelBrain} />
              {npcNav && <GpsNpcGuide guide={npcNav} />}
              <GpsHeroClickTarget cards={clickCards} />
              {useOnPairs.length > 0 && <UseOnHelper pairs={useOnPairs} />}
              <GpsConfidenceBadge
                allGood={confAllGood}
                completeCount={confComplete}
                totalCount={confidence.length}
                scanning={scanning}
              />
              <MistakeWarningsPanel warnings={warnings} />
              <GpsTips tips={tips} />

              <GpsAdvancedSection>
                <p className="qh-instruction-text">{step.text}</p>
                {onDebugToggle && (
                  <StepDebugPanel debug={debugInfo} open={debugOpen} onToggle={onDebugToggle} />
                )}
                <MarkerPlaceholders step={step} />
                <ItemShoppingList
                  pageName={metadata.pageName}
                  collectedItems={effectiveInv}
                  bankItems={bank}
                  needGeItems={ge}
                  clickTargetItems={clickTargetItems}
                />
                {(step.puzzleHints?.length ?? 0) > 0 && (
                  <ul className="qh-puzzle-list">
                    {step.puzzleHints!.map((p) => <li key={p}>🧩 {p}</li>)}
                  </ul>
                )}
                {(step.combatWarnings?.length ?? 0) > 0 && (
                  <ul className="qh-combat-list">
                    {step.combatWarnings.map((w) => <li key={w}>⚔ {w}</li>)}
                  </ul>
                )}
              </GpsAdvancedSection>
            </>
          )}
        </div>
      </div>

      {(step.dialogueChoices?.length ?? 0) > 0 && !isStepComplete && (
        <div className="qh-gps-dock">
          <DialogueHelper choices={step.dialogueChoices} nextIndex={dialogueNext} />
        </div>
      )}

      <footer className="qh-footer">
        <button type="button" className="qh-nav-btn" disabled={currentIndex === 0} onClick={() => goTo(currentIndex - 1)}>← Prev</button>
        <button type="button" className="qh-done-btn" onClick={markDone}>Done ✓</button>
        <button type="button" className="qh-nav-btn" disabled={currentIndex >= steps.length - 1} onClick={() => goTo(currentIndex + 1)}>Next →</button>
      </footer>
    </div>
  );
}

export function QuestHelperPanelWithDetect(props: QuestHelperPanelProps & {
  onHighlightSettingsChange?: (updates: Partial<AppSettings>) => void;
  onCalibrateInventory?: () => void;
  calibrating?: boolean;
  gameInfo?: GameWindowInfo | null;
}) {
  const [scanResult, setScanResult] = useState<ScreenReaderResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);

  const calibration = props.highlightSettings?.inventoryCalibration ?? null;

  useSmartDetect({
    enabled: true,
    guide: props.guide,
    progress: props.progress,
    inventoryCalibration: calibration,
    onProgressChange: props.onProgressChange,
    onScanResult: (result) => {
      setScanning(true);
      setScanResult(result);
      setTimeout(() => setScanning(false), 300);
    },
  });

  const currentIndex = Math.min(
    props.progress.currentStepIndex,
    Math.max(0, props.guide.steps.length - 1),
  );
  const step = props.guide.steps[currentIndex];
  const stepItems = (step.stepItems?.length ?? 0) > 0 ? step.stepItems : props.guide.metadata.items;

  const travelBrain = useMemo(
    () => resolveTravelBrain(step, props.playerData ?? null, props.highlightSettings),
    [step, props.playerData, props.highlightSettings],
  );

  useEffect(() => {
    setScanResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        detectedItems: [],
        inventorySlots: [],
        chatItemsAdded: [],
        chatItemsRemoved: [],
        inventoryScanned: false,
      };
    });
    setScanning(false);
  }, [props.guide.metadata.pageName, currentIndex]);

  const highlightProgress = useMemo(() => {
    const detected = [
      ...(scanResult?.detectedItems ?? []),
      ...(scanResult?.inventorySlots ?? []).map((s) => s.item),
    ];
    const effectiveInv = effectiveCollectedItems(
      props.progress.manuallyMarkedItems ?? [],
      detected,
      stepItems,
    );
    return { ...props.progress, collectedItems: effectiveInv };
  }, [props.progress, scanResult, stepItems]);

  useGameHighlights({
    step,
    enabled: true,
    progress: highlightProgress,
    scanResult,
    settings: props.highlightSettings,
    travelBrain,
  });

  return (
    <QuestHelperPanel
      {...props}
      gameInfo={props.gameInfo}
      scanResult={scanResult}
      scanning={scanning}
      debugOpen={debugOpen}
      onDebugToggle={() => setDebugOpen((o) => !o)}
    />
  );
}
