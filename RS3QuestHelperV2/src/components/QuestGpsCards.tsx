import { useState } from 'react';
import type { ReactNode } from 'react';
import type { ClickTargetCard } from '../utils/click-targets';
import { extractItemName } from '../utils/items';
import { hasQuestItem, itemReadySource } from '../utils/item-match';
import type { ItemBrain } from '../types/quest-data';

interface GpsMissingItemsProps {
  items: string[];
  inv: string[];
  bank: string[];
  detected?: string[];
  scanning?: boolean;
  onMarkItem?: (item: string) => void;
}

export function GpsMissingItems({
  items,
  inv,
  bank,
  detected = [],
  scanning,
  onMarkItem,
}: GpsMissingItemsProps) {
  const [collapsed, setCollapsed] = useState(false);
  const missing = items.filter((i) => !hasQuestItem(i, inv, bank, detected));
  const ready = items.length - missing.length;
  const allReady = missing.length === 0;

  if (items.length === 0) return null;

  if (allReady && collapsed) {
    return (
      <button type="button" className="gps-card gps-items-ready" onClick={() => setCollapsed(false)}>
        <span className="gps-card-label">Required Items</span>
        <span className="gps-items-count">{ready}/{items.length} Ready ✓</span>
      </button>
    );
  }

  return (
    <div className={`gps-card gps-items-panel ${allReady ? 'gps-items-all-ready' : 'gps-missing-items'}`}>
      <div className="gps-items-header">
        <span className="gps-card-label">
          {allReady ? 'Required Items' : '❌ Missing Items'}
        </span>
        <span className={`gps-items-count ${allReady ? 'all-ready' : ''}`}>
          {ready}/{items.length} ready
          {scanning && ' · scanning…'}
        </span>
        {allReady && (
          <button type="button" className="gps-collapse-btn" onClick={() => setCollapsed(true)}>
            Collapse
          </button>
        )}
      </div>
      <ul className="gps-item-rows">
        {items.map((item) => {
          const status = itemReadySource(item, inv, bank, detected);
          const isReady = status !== 'missing';
          return (
            <li key={item}>
              <button
                type="button"
                className={`gps-item-row ${isReady ? 'gps-item-ready' : 'gps-item-missing'}`}
                onClick={() => !isReady && onMarkItem?.(item)}
                title={isReady ? 'Ready' : 'Click when you have this item'}
              >
                <span className="gps-item-status" aria-hidden>
                  {status === 'inventory' ? '✓' : status === 'bank' ? '◉' : '○'}
                </span>
                <span className="gps-item-name">{extractItemName(item)}</span>
                {status === 'bank' && <span className="gps-item-tag">bank</span>}
                {status === 'inventory' && <span className="gps-item-tag ready">ready</span>}
                {!isReady && <span className="gps-item-tap">tap when obtained</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface GpsHeroClickTargetProps {
  cards: ClickTargetCard[];
}

export function GpsHeroClickTarget({ cards }: GpsHeroClickTargetProps) {
  const primary = cards.find((c) => c.aura === 'blue') ?? cards.find((c) => c.aura === 'green') ?? cards[0];
  if (!primary) return null;

  const isReady = primary.aura === 'green';

  return (
    <div className={`gps-hero-click ${isReady ? 'gps-hero-ready' : ''}`}>
      <div className="gps-hero-label">CLICK</div>
      <div className="gps-hero-name">{primary.name}</div>
      <div className="gps-hero-action">{primary.action}</div>
      {primary.location && <div className="gps-hero-loc">📍 {primary.location}</div>}
    </div>
  );
}

interface GpsConfidenceBadgeProps {
  allGood: boolean;
  completeCount: number;
  totalCount: number;
  scanning?: boolean;
}

export function GpsConfidenceBadge({ allGood, completeCount, totalCount, scanning }: GpsConfidenceBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  if (allGood) {
    return (
      <div className="gps-confidence gps-confidence-ok">
        {scanning ? '◌ Scanning…' : '🟢 Everything looks good'}
      </div>
    );
  }

  return (
    <button type="button" className="gps-confidence gps-confidence-warn" onClick={() => setExpanded((e) => !e)}>
      Checks — {completeCount}/{totalCount} complete {expanded ? '▲' : '▼'}
    </button>
  );
}

interface GpsTipsProps {
  tips: string[];
}

export function GpsTips({ tips }: GpsTipsProps) {
  if (tips.length === 0) return null;
  return (
    <div className="gps-card gps-tips">
      <div className="gps-card-label">TIP</div>
      <ul className="gps-tips-list">
        {tips.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </div>
  );
}

export function buildStepTips(
  itemBrain: ItemBrain | undefined,
  stepItems: string[],
  inv: string[],
  detected: string[] = [],
): string[] {
  const tips: string[] = [];
  if (!itemBrain) return tips;

  for (const item of stepItems) {
    const name = extractItemName(item);
    if (!hasQuestItem(item, inv, [], detected)) {
      tips.push(`Need ${name}.`);
    }
    if (itemBrain.consumed?.some((c) => c.toLowerCase().includes(name.toLowerCase()))) {
      tips.push(`${name} will be consumed.`);
    }
  }

  const ironman = itemBrain.ironmanNotes;
  if (ironman) {
    for (const item of stepItems.slice(0, 2)) {
      const note = ironman[item] ?? ironman[extractItemName(item)];
      if (note) tips.push(note);
    }
  }

  return [...new Set(tips)].slice(0, 4);
}

interface GpsAdvancedSectionProps {
  children: ReactNode;
}

export function GpsAdvancedSection({ children }: GpsAdvancedSectionProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="gps-advanced">
      <button type="button" className="gps-advanced-toggle" onClick={() => setOpen((o) => !o)}>
        Advanced {open ? '▲' : '▼'}
      </button>
      {open && <div className="gps-advanced-body">{children}</div>}
    </div>
  );
}
