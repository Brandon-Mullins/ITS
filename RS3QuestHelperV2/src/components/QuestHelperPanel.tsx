import { useMemo, useState } from 'react';
import type { QuestGuide, QuestProgress, ScreenReaderResult, AppSettings } from '../types/quest';
import type { PlayerQuestData } from '../utils/quest-match';
import { openWikiUrl } from '../services/storage';
import { useSmartDetect } from '../hooks/useSmartDetect';
import { resolveTravelBrain } from '../services/travel-brain';
import GpsTeleportPanel from './GpsTeleportPanel';
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
import {
  buildConfidenceSignals,
  buildStepWarnings,
  buildStepDebugInfo,
  getUseOnPairs,
  getDialogueNextIndex,
} from '../utils/step-analysis';
import { useGameHighlights } from '../hooks/useGameHighlights';

interface QuestHelperPanelProps {
  guide: QuestGuide;
  progress: QuestProgress;
  playerData?: PlayerQuestData | null;
  uiMode?: 'newbie' | 'veteran' | 'standard';
  onBack: () => void;
  onRefresh: () => void;
  onProgressChange: (updates: Partial<QuestProgress>) => void;
  onDetach?: () => void;
  isAttached?: boolean;
  scanResult?: ScreenReaderResult | null;
  scanning?: boolean;
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
  debugOpen = false,
  onDebugToggle,
  highlightSettings,
}: QuestHelperPanelProps) {
  const { metadata, steps } = guide;
  const currentIndex = Math.min(progress.currentStepIndex, Math.max(0, steps.length - 1));
  const step = steps[currentIndex];
  const inv = progress.collectedItems ?? [];
  const bank = progress.bankItems ?? [];
  const ge = progress.needGeItems ?? [];
  const isStepComplete = progress.completedSteps.includes(step.id);

  const travelBrain = useMemo(
    () => resolveTravelBrain(step, playerData, highlightSettings),
    [step, playerData, highlightSettings],
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

  const stepItems = (step.stepItems?.length ?? 0) > 0 ? step.stepItems : metadata.items;
  const clickCards = buildClickTargetCards(step, progress, guide.itemBrain);
  const clickTargetItems = inventoryHighlightItems(getClickTargets(step));
  const useOnPairs = getUseOnPairs(clickCards);
  const confidence = buildConfidenceSignals(step, progress, scanResult);
  const warnings = buildStepWarnings(step, guide, progress, clickCards);
  const debugInfo = buildStepDebugInfo(guide, progress, scanResult);
  const dialogueNext = getDialogueNextIndex(step.dialogueChoices ?? [], scanResult?.ocrSnippet ?? '');
  const tips = buildStepTips(guide.itemBrain, stepItems, inv);

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
              <GpsMissingItems items={stepItems} inv={inv} bank={bank} />
              <GpsTeleportPanel travel={travelBrain} />
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
                  collectedItems={inv}
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
  useGameHighlights({
    step,
    enabled: true,
    progress: props.progress,
    scanResult,
    settings: props.highlightSettings,
  });

  return (
    <QuestHelperPanel
      {...props}
      scanResult={scanResult}
      scanning={scanning}
      debugOpen={debugOpen}
      onDebugToggle={() => setDebugOpen((o) => !o)}
    />
  );
}
