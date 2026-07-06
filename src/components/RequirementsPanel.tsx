import { useState } from 'react';
import type { QuestMetadata } from '../types/quest';
import { extractItemName, itemGeSearchUrl } from '../utils/items';
import { openWikiUrl } from '../services/storage';

interface RequirementsPanelProps {
  metadata: QuestMetadata;
  collectedItems: string[];
  bankItems: string[];
  needGeItems: string[];
  scanning: boolean;
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

export default function RequirementsPanel({
  metadata,
  collectedItems,
  bankItems,
  needGeItems,
  scanning,
  bankOpen,
}: RequirementsPanelProps) {
  const [expanded, setExpanded] = useState(true);

  if (metadata.items.length === 0) return null;

  const readyCount = metadata.items.filter((i) => collectedItems.includes(i)).length;

  return (
    <div className="requirements-panel compact">
      <button type="button" className="requirements-toggle" onClick={() => setExpanded(!expanded)}>
        <span>
          Items {readyCount}/{metadata.items.length}
          {scanning && <span className="scan-dot"> ●</span>}
        </span>
        <span className="toggle-icon">{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="requirements-content">
          {bankOpen && <p className="item-hint">Bank open — scanning items…</p>}
          <ul className="item-checklist">
            {metadata.items.map((item) => {
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
        </div>
      )}
    </div>
  );
}
