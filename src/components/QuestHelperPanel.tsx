import { useState } from 'react';
import type { QuestGuide, QuestProgress, ScreenReaderResult } from '../types/quest';
import type { TravelRoute } from '../types/quest-data';
import { openWikiUrl } from '../services/storage';
import { useSmartDetect } from '../hooks/useSmartDetect';
import RoutePanel from './RoutePanel';
import MarkerPlaceholders from './MarkerPlaceholders';
import ItemShoppingList from './ItemShoppingList';
import ClickTargetsPanel from './ClickTargetsPanel';
import UseOnHelper from './UseOnHelper';
import DialogueHelper from './DialogueHelper';
import StepConfidencePanel from './StepConfidencePanel';
import MistakeWarningsPanel from './MistakeWarningsPanel';
import StepDebugPanel from './StepDebugPanel';
import { extractItemName, itemGeSearchUrl } from '../utils/items';
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
}

type ItemState = 'inventory' | 'bank' | 'ge' | 'pending';

const ROUTE_TABS: TravelRoute['type'][] = ['fastest', 'cheapest', 'ironman', 'no-teleport'];
const ROUTE_TAB_LABELS: Record<TravelRoute['type'], string> = {
  fastest: '⚡ Fastest',
  cheapest: '💰 Cheapest',
  ironman: '🛡 Ironman',
  'no-teleport': '🚶 Walk',
};

function itemState(item: string, inv: string[], bank: string[], ge: string[]): ItemState {
  if (listIncludesItem(inv, item)) return 'inventory';
  if (listIncludesItem(bank, item)) return 'bank';
  if (listIncludesItem(ge, item)) return 'ge';
  return 'pending';
}

function itemAuraClass(
  item: string,
  inv: string[],
  bank: string[],
  isClickTarget: boolean,
): string {
  if (isClickTarget && listIncludesItem(inv, item)) return 'aura-blue';
  if (listIncludesItem(inv, item) || listIncludesItem(bank, item)) return 'aura-green';
  return 'aura-red';
}

export default function QuestHelperPanel({
  guide,
  progress,
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
}: QuestHelperPanelProps) {
  const { metadata, steps } = guide;
  const currentIndex = Math.min(progress.currentStepIndex, Math.max(0, steps.length - 1));
  const step = steps[currentIndex];
  const inv = progress.collectedItems ?? [];
  const bank = progress.bankItems ?? [];
  const ge = progress.needGeItems ?? [];

  const routes = step.travelRoutes ?? [];
  const [routeTab, setRouteTab] = useState<TravelRoute['type']>('fastest');
  const activeRoute = routes.find((r) => r.type === routeTab) ?? routes[0];

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
  const hasRoutes = routes.length > 0 || (step.fastestRoutes?.length ?? 0) > 0;

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
          <div className="qh-section qh-instruction">
            <div className="qh-step-header">
              <span className="qh-section-label">Step {currentIndex + 1} of {steps.length}</span>
              {progress.completedSteps.includes(step.id) && (
                <span className="qh-step-done-badge">✓ Complete</span>
              )}
            </div>
            {(step.location || step.npc || step.object) && (
              <div className="qh-location">
                {step.location && <span className="qh-loc-pin aura-blue">📍 {step.location}</span>}
                {step.npc && (
                  <span className="qh-loc-npc aura-blue">👤 {step.npc}</span>
                )}
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
            <div className="qh-section-label route-label">Travel</div>
            {routes.length > 1 && (
              <div className="qh-route-tabs" role="tablist">
                {ROUTE_TABS.filter((t) => routes.some((r) => r.type === t)).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={routeTab === tab}
                    className={`qh-route-tab ${routeTab === tab ? 'active' : ''}`}
                    onClick={() => setRouteTab(tab)}
                  >
                    {ROUTE_TAB_LABELS[tab]}
                  </button>
                ))}
              </div>
            )}
            {activeRoute ? (
              <div className="qh-route-card">
                <span className="qh-route-name">{activeRoute.label}</span>
                <p className="qh-route-desc">{activeRoute.description}</p>
                {activeRoute.requiredUnlocks && activeRoute.requiredUnlocks.length > 0 && uiMode !== 'veteran' && (
                  <span className="qh-route-unlocks">Needs: {activeRoute.requiredUnlocks.join(', ')}</span>
                )}
              </div>
            ) : hasRoutes ? (
              <RoutePanel routes={step.travelRoutes} fastestRoutes={step.fastestRoutes} uiMode={uiMode} />
            ) : (
              <p className="qh-route-fallback">Walk from nearest lodestone or use jewellery teleports.</p>
            )}
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
              <ul className="qh-item-list">
                {stepItems.map((item) => {
                  const st = itemState(item, inv, bank, ge);
                  const isClickTarget = clickTargetItems.some((t) => listIncludesItem([t], item));
                  const aura = itemAuraClass(item, inv, bank, isClickTarget);
                  return (
                    <li key={item} className={`qh-item qh-item-${st} ${aura}`}>
                      <span className="qh-item-icon" aria-hidden>
                        {st === 'inventory' ? '✓' : st === 'bank' ? '◉' : '○'}
                      </span>
                      <span className="qh-item-name">{extractItemName(item)}</span>
                      <button
                        type="button"
                        className={`qh-item-action ${st}`}
                        onClick={() => st !== 'inventory' && openWikiUrl(itemGeSearchUrl(item))}
                      >
                        {st === 'inventory' ? 'Ready' : st === 'bank' ? 'In bank' : st === 'ge' ? 'Buy GE' : 'Get item'}
                      </button>
                    </li>
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

  useSmartDetect({
    enabled: true,
    guide: props.guide,
    progress: props.progress,
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
  useGameHighlights({ step, enabled: true, progress: props.progress, scanResult });

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
