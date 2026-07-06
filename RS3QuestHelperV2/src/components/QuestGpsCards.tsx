import { useState } from 'react';
import type { ReactNode } from 'react';
import type { ClickTargetCard } from '../utils/click-targets';
import { extractItemName } from '../utils/items';
import { listIncludesItem } from '../utils/item-match';
import type { ItemBrain } from '../types/quest-data';

interface GpsMissingItemsProps {
  items: string[];
  inv: string[];
  bank: string[];
}

export function GpsMissingItems({ items, inv, bank }: GpsMissingItemsProps) {
  const [expanded, setExpanded] = useState(false);
  const missing = items.filter((i) => !listIncludesItem(inv, i) && !listIncludesItem(bank, i));
  const ready = items.length - missing.length;

  if (items.length === 0) return null;

  if (missing.length === 0) {
    return (
      <button type="button" className="gps-card gps-items-ready" onClick={() => setExpanded((e) => !e)}>
        <span className="gps-card-label">Required Items</span>
        <span className="gps-items-count">{ready}/{items.length} Ready ✓</span>
      </button>
    );
  }

  return (
    <div className="gps-card gps-missing-items">
      <div className="gps-card-label">❌ Missing Items</div>
      <ul className="gps-missing-list">
        {missing.map((item) => (
          <li key={item}>{extractItemName(item)}</li>
        ))}
      </ul>
      {ready > 0 && (
        <button type="button" className="gps-expand-btn" onClick={() => setExpanded((e) => !e)}>
          {ready} ready — {expanded ? 'hide' : 'show'}
        </button>
      )}
      {expanded && ready > 0 && (
        <ul className="gps-ready-list">
          {items.filter((i) => listIncludesItem(inv, i) || listIncludesItem(bank, i)).map((item) => (
            <li key={item}>✓ {extractItemName(item)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface GpsHeroClickTargetProps {
  cards: ClickTargetCard[];
}

export function GpsHeroClickTarget({ cards }: GpsHeroClickTargetProps) {
  const primary = cards.find((c) => c.aura === 'blue') ?? cards[0];
  if (!primary) return null;

  return (
    <div className="gps-hero-click">
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
): string[] {
  const tips: string[] = [];
  if (!itemBrain) return tips;

  for (const item of stepItems) {
    const name = extractItemName(item);
    if (!listIncludesItem(inv, item) && !listIncludesItem(inv, name)) {
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
