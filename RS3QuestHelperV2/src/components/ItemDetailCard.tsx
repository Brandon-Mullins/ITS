import { useState } from 'react';
import type { ItemBrain } from '../types/quest-data';
import { openWikiUrl } from '../services/storage';
import { extractItemName, itemGeSearchUrl } from '../utils/items';
import { listIncludesItem } from '../utils/item-match';

type ItemState = 'inventory' | 'bank' | 'ge' | 'pending';

interface ItemDetailCardProps {
  item: string;
  inv: string[];
  bank: string[];
  ge: string[];
  itemBrain?: ItemBrain;
  isClickTarget?: boolean;
}

function itemState(item: string, inv: string[], bank: string[], ge: string[]): ItemState {
  if (listIncludesItem(inv, item)) return 'inventory';
  if (listIncludesItem(bank, item)) return 'bank';
  if (listIncludesItem(ge, item)) return 'ge';
  return 'pending';
}

function itemWhyNeeded(item: string, brain?: ItemBrain): string | null {
  if (!brain) return null;
  const name = extractItemName(item);
  if (brain.required?.some((i) => i.toLowerCase().includes(name.toLowerCase()))) {
    return 'Required for this quest step';
  }
  if (brain.consumed?.some((i) => i.toLowerCase().includes(name.toLowerCase()))) {
    return 'Consumed during the quest — bring extras';
  }
  if (brain.kept?.some((i) => i.toLowerCase().includes(name.toLowerCase()))) {
    return 'Keep after quest — do not drop';
  }
  if (brain.obtainableDuring?.some((i) => i.toLowerCase().includes(name.toLowerCase()))) {
    return 'Can be obtained during the quest';
  }
  if (brain.recommended?.some((i) => i.toLowerCase().includes(name.toLowerCase()))) {
    return 'Recommended — not strictly required';
  }
  return null;
}

export default function ItemDetailCard({
  item,
  inv,
  bank,
  ge,
  itemBrain,
  isClickTarget,
}: ItemDetailCardProps) {
  const [hover, setHover] = useState(false);
  const st = itemState(item, inv, bank, ge);
  const name = extractItemName(item);
  const why = itemWhyNeeded(item, itemBrain);
  const consumed = itemBrain?.consumed?.some((i) => i.toLowerCase().includes(name.toLowerCase()));
  const kept = itemBrain?.kept?.some((i) => i.toLowerCase().includes(name.toLowerCase()));
  const reclaimable = !consumed;
  const ironmanNote = itemBrain?.ironmanNotes?.[item] ?? itemBrain?.ironmanNotes?.[name];

  const statusLabel =
    st === 'inventory' ? 'In inventory' :
    st === 'bank' ? 'In bank' :
    st === 'ge' ? 'Buy at GE' : 'Not found';

  const auraClass =
    isClickTarget && st === 'inventory' ? 'aura-blue' :
    st === 'inventory' || st === 'bank' ? 'aura-green' : 'aura-red';

  return (
    <li
      className={`tb-item-card ${auraClass} tb-item-${st}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span className="tb-item-icon" aria-hidden>
        {st === 'inventory' ? '✓' : st === 'bank' ? '◉' : '○'}
      </span>
      <div className="tb-item-body">
        <div className="tb-item-name">{name}</div>
        <div className="tb-item-status">{statusLabel}</div>
        <div className="tb-item-tags">
          {consumed && <span className="tb-tag consumed">Consumed</span>}
          {kept && <span className="tb-tag kept">Keep</span>}
          {reclaimable && !kept && <span className="tb-tag reclaim">Reclaimable</span>}
        </div>
        {hover && why && <p className="tb-item-why">{why}</p>}
        {hover && ironmanNote && <p className="tb-item-ironman">{ironmanNote}</p>}
      </div>
      <button
        type="button"
        className={`tb-item-action ${st}`}
        onClick={() => st !== 'inventory' && openWikiUrl(itemGeSearchUrl(item))}
      >
        {st === 'inventory' ? 'Ready' : st === 'bank' ? 'Bank' : st === 'ge' ? 'GE' : 'Get'}
      </button>
    </li>
  );
}
