import { useMemo, useState } from 'react';
import type { QuestGuide, QuestProgress, ScreenReaderResult, AppSettings } from '../types/quest';
import type { PlayerQuestData } from '../utils/quest-match';
import { openWikiUrl } from '../services/storage';
import { useSmartDetect } from '../hooks/useSmartDetect';
import { resolveTravelBrain } from '../services/travel-brain';
import MarkerPlaceholders from './MarkerPlaceholders';
import TravelBrainPanel from './TravelBrainPanel';
import NpcInfoCard from './NpcInfoCard';
import ItemDetailCard from './ItemDetailCard';
import ItemShoppingList from './ItemShoppingList';
import ClickTargetsPanel from './ClickTargetsPanel';
import UseOnHelper from './UseOnHelper';
import DialogueHelper from './DialogueHelper';
import StepConfidencePanel from './StepConfidencePanel';
import MistakeWarningsPanel from './MistakeWarningsPanel';
import StepDebugPanel from './StepDebugPanel';
import HighlightSettingsPanel from './HighlightSettingsPanel';
import { buildClickTargetCards, inventoryHighlightItems, getClickTargets } from '../utils/click-targets';
import { listIncludesItem } from '../utils/item-match';
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
  onHighlightSettingsChange?: (updates: Partial<AppSettings>) => void;
  onCalibrateInventory?: () => void;
  calibrating?: boolean;
}

export default function QuestHelperPanel({
  guide,
  progress,
  playerData = null,
  uiMode = 'standard',
  onBack,
  onRefresh,
  onProgressChange,
  onDetach,
  isAttached,
  scanResult = null,
  scanning = false,
  debugOpen = false,
  onDebugToggle,
  highlightSettings,
  onHighlightSettingsChange,
  onCalibrateInventory,
  calibrating,
}: QuestHelperPanelProps) {
  const { metadata, steps } = guide;
  const currentIndex = Math.min(progress.currentStepIndex, Math.max(0, steps.length - 1));
  const step = steps[currentIndex];
  const inv = progress.collectedItems ?? [];
  const bank = progress.bankItems ?? [];
  const ge = progress.needGeItems ?? [];

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
  const readyCount = stepItems.filter((i) => listIncludesItem(inv, i)).length;

  return (
    <div className="qh-panel">
      <header className="qh-header">
        <button type="button" className="qh-icon-btn" onClick={onBack} title="Back to quest list">←</button>
        <div className="qh-header-text">
          <h1 className="qh-quest-name">{metadata.name}</h1>
          <div className="qh-badges">
            {guide.source === 'curated' && <span className="qh-badge official">Official Guide</span>}
            {guide.source !== 'curated' && <span className="qh-badge wiki">Wiki Guide</span>}
            <span className="qh-badge steps">{steps.length} steps</span>
            {metadata.members && <span className="qh-badge members">Members</span>}
          </div>
        </div>
        <button type="button" className="qh-icon-btn" onClick={() => openWikiUrl(metadata.wikiUrl)} title="Open wiki">📖</button>
        <button type="button" className="qh-icon-btn" onClick={onRefresh} title="Refresh guide">↻</button>
      </header>

      {isAttached && onDetach && (
        <div className="qh-detach-bar">
          <span>Attached to game — tap below for full planner & goals</span>
          <button type="button" className="qh-detach-btn" onClick={onDetach}>🔗 Detach</button>
        </div>
      )}

      <div className="qh-body">
        <nav className="qh-step-rail" aria-label="Quest steps">
          {steps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`qh-step-dot ${i === currentIndex ? 'active' : ''} ${progress.completedSteps.includes(s.id) ? 'done' : ''}`}
              onClick={() => goTo(i)}
              title={`Step ${i + 1}: ${s.text}`}
            >
              <span className="qh-step-num">{i + 1}</span>
            </button>
          ))}
        </nav>

        <div className="qh-main">
          {highlightSettings && onHighlightSettingsChange && onCalibrateInventory && (
            <HighlightSettingsPanel
              settings={highlightSettings}
              onChange={onHighlightSettingsChange}
              onCalibrate={onCalibrateInventory}
              calibrating={calibrating}
            />
          )}

          <div className="qh-section qh-instruction">
            <div className="qh-step-header">
              <span className="qh-section-label">Step {currentIndex + 1} of {steps.length}</span>
              {progress.completedSteps.includes(step.id) && (
                <span className="qh-step-done-badge">✓ Complete</span>
              )}
            </div>
            {step.npc && <NpcInfoCard npcName={step.npc} />}
            {(step.location || step.object) && !step.npc && (
              <div className="qh-location">
                {step.location && <span className="qh-loc-pin aura-blue">📍 {step.location}</span>}
                {step.object && (
                  <span className="qh-loc-obj aura-blue">⚙ {step.object}</span>
                )}
              </div>
            )}
            <p className="qh-instruction-text">{step.text}</p>

            <ClickTargetsPanel cards={clickCards} />
            <UseOnHelper pairs={useOnPairs} />
            <StepConfidencePanel signals={confidence} scanning={scanning} />
            <MistakeWarningsPanel warnings={warnings} />

            {onDebugToggle && (
              <StepDebugPanel debug={debugInfo} open={debugOpen} onToggle={onDebugToggle} />
            )}
          </div>

          <div className="qh-section qh-routes-section">
            <TravelBrainPanel travel={travelBrain} uiMode={uiMode} />
          </div>

          <MarkerPlaceholders step={step} />

          {stepItems.length > 0 && (
            <div className="qh-section qh-items-section">
              <div className="qh-items-header">
                <span className="qh-section-label">Required items</span>
                <span className={`qh-items-count ${readyCount === stepItems.length ? 'all-ready' : ''}`}>
                  {readyCount}/{stepItems.length} ready
                </span>
              </div>
              <ul className="qh-item-list tb-item-list">
                {stepItems.map((item) => {
                  const isClickTarget = clickTargetItems.some((t) => listIncludesItem([t], item));
                  return (
                    <ItemDetailCard
                      key={item}
                      item={item}
                      inv={inv}
                      bank={bank}
                      ge={ge}
                      itemBrain={guide.itemBrain}
                      isClickTarget={isClickTarget}
                    />
                  );
                })}
              </ul>
            </div>
          )}

          <ItemShoppingList
            pageName={metadata.pageName}
            collectedItems={inv}
            bankItems={bank}
            needGeItems={ge}
            clickTargetItems={clickTargetItems}
          />

          {(step.dialogueChoices?.length ?? 0) > 0 && (
            <DialogueHelper choices={step.dialogueChoices} nextIndex={dialogueNext} />
          )}

          {(step.puzzleHints?.length ?? 0) > 0 && (
            <div className="qh-section qh-puzzle-section">
              <div className="qh-section-label">Puzzle hints</div>
              <ul className="qh-puzzle-list">
                {step.puzzleHints!.map((p) => <li key={p}>🧩 {p}</li>)}
              </ul>
            </div>
          )}

          {(step.combatWarnings?.length ?? 0) > 0 && (
            <div className="qh-section qh-combat">
              <div className="qh-section-label">Combat</div>
              <ul className="qh-combat-list">
                {step.combatWarnings.map((w) => <li key={w}>⚔ {w}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      <footer className="qh-footer">
        <button type="button" className="qh-nav-btn" disabled={currentIndex === 0} onClick={() => goTo(currentIndex - 1)} title="Previous step">← Prev</button>
        <button type="button" className="qh-done-btn" onClick={markDone}>Done ✓</button>
        <button type="button" className="qh-nav-btn" disabled={currentIndex >= steps.length - 1} onClick={() => goTo(currentIndex + 1)} title="Next step">Next →</button>
      </footer>
    </div>
  );
}

/** Wrapper that hooks smart detect + game highlights */
export function QuestHelperPanelWithDetect(props: QuestHelperPanelProps) {
  const [scanResult, setScanResult] = useState<ScreenReaderResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const [calibrating, setCalibrating] = useState(false);

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

  const handleCalibrate = async () => {
    if (!window.electronAPI?.startInventoryCalibration) return;
    setCalibrating(true);
    try {
      const cal = await window.electronAPI.startInventoryCalibration();
      if (cal && props.onHighlightSettingsChange) {
        props.onHighlightSettingsChange({ inventoryCalibration: cal });
      }
    } finally {
      setCalibrating(false);
    }
  };

  return (
    <QuestHelperPanel
      {...props}
      scanResult={scanResult}
      scanning={scanning}
      debugOpen={debugOpen}
      onDebugToggle={() => setDebugOpen((o) => !o)}
      onCalibrateInventory={handleCalibrate}
      calibrating={calibrating}
    />
  );
}
