import { useState } from 'react';
import type { QuestGuide, QuestProgress } from '../types/quest';
import type { TravelRoute } from '../types/quest-data';
import { openWikiUrl } from '../services/storage';
import { useSmartDetect } from '../hooks/useSmartDetect';
import RoutePanel from './RoutePanel';
import MarkerPlaceholders from './MarkerPlaceholders';
import ItemShoppingList from './ItemShoppingList';
import { extractItemName, itemGeSearchUrl } from '../utils/items';

interface QuestHelperPanelProps {
  guide: QuestGuide;
  progress: QuestProgress;
  uiMode?: 'newbie' | 'veteran' | 'standard';
  onBack: () => void;
  onRefresh: () => void;
  onProgressChange: (updates: Partial<QuestProgress>) => void;
  onDetach?: () => void;
  isAttached?: boolean;
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
  if (inv.includes(item)) return 'inventory';
  if (bank.includes(item)) return 'bank';
  if (ge.includes(item)) return 'ge';
  return 'pending';
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
  const readyCount = stepItems.filter((i) => inv.includes(i)).length;
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
                {step.location && <span className="qh-loc-pin">📍 {step.location}</span>}
                {step.npc && <span className="qh-loc-npc">👤 {step.npc}</span>}
                {step.object && <span className="qh-loc-obj">⚙ {step.object}</span>}
              </div>
            )}
            <p className="qh-instruction-text">{step.text}</p>
            {step.areaWarning && (
              <p className="qh-area-warning">⚠ {step.areaWarning}</p>
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
                  return (
                    <li key={item} className={`qh-item qh-item-${st}`}>
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
          />

          {(step.dialogueChoices?.length ?? 0) > 0 && (
            <div className="qh-section qh-dialogue-section">
              <div className="qh-section-label">Say this</div>
              <ul className="qh-dialogue">
                {step.dialogueChoices.map((d) => (
                  <li key={d}>
                    <span className="qh-dialogue-bullet">›</span> {d}
                  </li>
                ))}
              </ul>
            </div>
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

/** Wrapper that hooks smart detect */
export function QuestHelperPanelWithDetect(props: QuestHelperPanelProps) {
  useSmartDetect({
    enabled: true,
    guide: props.guide,
    progress: props.progress,
    onProgressChange: props.onProgressChange,
  });
  return <QuestHelperPanel {...props} />;
}
