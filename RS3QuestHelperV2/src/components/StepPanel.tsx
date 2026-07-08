import type { QuestMetadata, QuestStep } from '../types/quest';
import { extractItemName, itemGeSearchUrl } from '../utils/items';
import { openWikiUrl } from '../services/storage';
import RoutePanel from './RoutePanel';
import MarkerPlaceholders from './MarkerPlaceholders';
import ItemShoppingList from './ItemShoppingList';

interface StepPanelProps {
  step: QuestStep;
  stepNumber: number;
  totalSteps: number;
  isCompleted: boolean;
  metadata: QuestMetadata;
  pageName: string;
  collectedItems: string[];
  bankItems: string[];
  needGeItems: string[];
  bankOpen: boolean;
  questStatus?: string | null;
  uiMode?: 'newbie' | 'veteran' | 'standard';
}

type ItemState = 'inventory' | 'bank' | 'ge' | 'pending';

function getItemState(item: string, collected: string[], bank: string[], needGe: string[]): ItemState {
  if (collected.includes(item)) return 'inventory';
  if (bank.includes(item)) return 'bank';
  if (needGe.includes(item)) return 'ge';
  return 'pending';
}

const STATE_LABELS: Record<ItemState, string> = {
  inventory: '✓ Ready',
  bank: '🏦 In bank',
  ge: '🛒 Buy on GE',
  pending: '… Missing',
};

function ItemList({ items, collectedItems, bankItems, needGeItems, bankOpen }: {
  items: string[]; collectedItems: string[]; bankItems: string[]; needGeItems: string[]; bankOpen: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <>
      {bankOpen && <p className="item-hint">Bank open — scanning…</p>}
      <ul className="item-checklist step-items">
        {items.map((item) => {
          const state = getItemState(item, collectedItems, bankItems, needGeItems);
          return (
            <li key={item} className={`item-row item-${state}`}>
              <span className="item-label">{extractItemName(item)}</span>
              {(state === 'ge' || state === 'pending') ? (
                <button type="button" className={`item-badge ${state}`} onClick={() => openWikiUrl(itemGeSearchUrl(item))}>
                  {STATE_LABELS[state]}
                </button>
              ) : (
                <span className={`item-badge ${state}`}>{STATE_LABELS[state]}</span>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default function StepPanel({
  step, stepNumber, totalSteps, isCompleted, metadata, pageName,
  collectedItems, bankItems, needGeItems, bankOpen, questStatus, uiMode = 'standard',
}: StepPanelProps) {
  const dialogue = step.dialogueChoices ?? [];
  const combat = step.combatWarnings ?? [];
  const puzzles = step.puzzleHints ?? [];
  const stepItems = (step.stepItems?.length ?? 0) > 0 ? step.stepItems : metadata.items;
  const recommended = step.recommendedItems ?? metadata.recommended;

  return (
    <div className={`step-panel compact ${isCompleted ? 'completed' : ''}`}>
      <div className="step-panel-header">
        <span className="step-label">Step {stepNumber}/{totalSteps}</span>
        <div className="step-header-badges">
          {questStatus && <span className={`status-pill pill-${questStatus}`}>{questStatus}</span>}
          {isCompleted && <span className="step-auto-done">✓ Done</span>}
        </div>
      </div>

      {step.location && (
        <span className="step-location">📍 {step.location}{step.npc ? ` · ${step.npc}` : ''}{step.object ? ` · ${step.object}` : ''}</span>
      )}

      <p className="step-text">{step.text}</p>

      {step.areaWarning && (
        <p className="area-warning">⚠ {step.areaWarning}</p>
      )}

      <RoutePanel routes={step.travelRoutes} fastestRoutes={step.fastestRoutes} uiMode={uiMode} />

      <MarkerPlaceholders step={step} />

      <ItemShoppingList pageName={pageName} collectedItems={collectedItems} bankItems={bankItems} needGeItems={needGeItems} />

      {stepItems.length > 0 && (
        <details className="step-section" open>
          <summary className="step-section-title">Required items (this step)</summary>
          <ItemList items={stepItems} collectedItems={collectedItems} bankItems={bankItems} needGeItems={needGeItems} bankOpen={bankOpen} />
        </details>
      )}

      {recommended.length > 0 && (
        <details className="step-section">
          <summary className="step-section-title">Recommended items</summary>
          <ItemList items={recommended} collectedItems={collectedItems} bankItems={bankItems} needGeItems={needGeItems} bankOpen={bankOpen} />
        </details>
      )}

      {dialogue.length > 0 && (
        <details className="step-section" open={dialogue.length <= 2}>
          <summary className="step-section-title">Dialogue options</summary>
          <ul className="dialogue-list">{dialogue.map((c) => <li key={c}>{c}</li>)}</ul>
        </details>
      )}

      {puzzles.length > 0 && (
        <details className="step-section" open>
          <summary className="step-section-title">Puzzle helper</summary>
          <ul className="puzzle-list">{puzzles.map((p) => <li key={p}>🧩 {p}</li>)}</ul>
        </details>
      )}

      {combat.length > 0 && (
        <details className="step-section combat-section" open>
          <summary className="step-section-title">Combat warnings</summary>
          <ul className="combat-list">{combat.map((w) => <li key={w}>⚔ {w}</li>)}</ul>
        </details>
      )}

      {uiMode === 'newbie' && step.completionChecks && (
        <details className="step-section">
          <summary className="step-section-title">How auto-detect knows you&apos;re done</summary>
          <ul className="completion-hints">
            {(step.completionChecks.chatContains ?? []).map((c) => <li key={c}>Chat mentions: {c}</li>)}
            {(step.completionChecks.locationContains ?? []).map((c) => <li key={c}>Location: {c}</li>)}
          </ul>
        </details>
      )}

      <button type="button" className="btn-report-step" disabled title="Coming soon">Report bad step</button>
    </div>
  );
}
