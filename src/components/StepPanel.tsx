import type { QuestMetadata, QuestStep } from '../types/quest';
import { extractItemName, itemGeSearchUrl } from '../utils/items';
import { openWikiUrl } from '../services/storage';

interface StepPanelProps {
  step: QuestStep;
  stepNumber: number;
  totalSteps: number;
  isCompleted: boolean;
  metadata: QuestMetadata;
  collectedItems: string[];
  bankItems: string[];
  needGeItems: string[];
  bankOpen: boolean;
}

type ItemState = 'inventory' | 'bank' | 'ge' | 'pending';

function getItemState(
  item: string,
  collected: string[],
  bank: string[],
  needGe: string[],
): ItemState {
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

export default function StepPanel({
  step,
  stepNumber,
  totalSteps,
  isCompleted,
  metadata,
  collectedItems,
  bankItems,
  needGeItems,
  bankOpen,
}: StepPanelProps) {
  const hints = step.travelHints ?? [];
  const dialogue = step.dialogueChoices ?? [];
  const combat = step.combatWarnings ?? [];
  const stepItems =
    (step.stepItems?.length ?? 0) > 0 ? step.stepItems : metadata.items;

  return (
    <div className={`step-panel compact ${isCompleted ? 'completed' : ''}`}>
      <div className="step-panel-header">
        <span className="step-label">Step {stepNumber}/{totalSteps}</span>
        {isCompleted && <span className="step-auto-done">✓ Done</span>}
      </div>

      <p className="step-text">{step.text}</p>

      <div className="travel-hints">
        <span className="travel-heading">Fastest route</span>
        {hints.length > 0 ? (
          hints.map((hint) => (
            <div key={hint.location} className="travel-hint-block">
              {hints.length > 1 && (
                <span className="travel-destination">→ {hint.location}</span>
              )}
              <ol className="travel-methods">
                {hint.methods.map((m, i) => (
                  <li key={`${hint.location}-${m.name}`} className={i === 0 ? 'travel-best' : ''}>
                    <strong>{i + 1}. {m.name}</strong>
                    {m.members && <span className="badge badge-p2p travel-p2p">P2P</span>}
                    <span className="travel-detail"> — {m.detail}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))
        ) : (
          <p className="travel-fallback">Use nearest lodestone or jewellery teleport.</p>
        )}
      </div>

      {stepItems.length > 0 && (
        <details className="step-section" open>
          <summary className="step-section-title">Required items</summary>
          {bankOpen && <p className="item-hint">Bank open — scanning…</p>}
          <ul className="item-checklist step-items">
            {stepItems.map((item) => {
              const state = getItemState(item, collectedItems, bankItems, needGeItems);
              return (
                <li key={item} className={`item-row item-${state}`}>
                  <span className="item-label">{extractItemName(item)}</span>
                  {state === 'ge' ? (
                    <button
                      type="button"
                      className="item-badge ge"
                      onClick={() => openWikiUrl(itemGeSearchUrl(item))}
                      title="View GE price on Wiki"
                    >
                      {STATE_LABELS.ge}
                    </button>
                  ) : (
                    <span className={`item-badge ${state}`}>{STATE_LABELS[state]}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </details>
      )}

      {dialogue.length > 0 && (
        <details className="step-section" open={dialogue.length <= 2}>
          <summary className="step-section-title">Dialogue choices</summary>
          <ul className="dialogue-list">
            {dialogue.map((choice) => (
              <li key={choice}>{choice}</li>
            ))}
          </ul>
        </details>
      )}

      {combat.length > 0 && (
        <details className="step-section combat-section" open>
          <summary className="step-section-title">Combat warnings</summary>
          <ul className="combat-list">
            {combat.map((warning) => (
              <li key={warning}>⚔ {warning}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
