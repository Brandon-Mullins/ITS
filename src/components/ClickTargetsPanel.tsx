import type { ClickTargetCard } from '../utils/click-targets';

const KIND_LABELS: Record<ClickTargetCard['kind'], string> = {
  npc: 'NPC',
  object: 'Object',
  'inventory-item': 'Inventory item',
  'bank-item': 'Bank item',
  destination: 'Destination',
};

const KIND_ICONS: Record<ClickTargetCard['kind'], string> = {
  npc: '👤',
  object: '⬡',
  'inventory-item': '🧪',
  'bank-item': '🏦',
  destination: '📍',
};

const AURA_CLASS: Record<ClickTargetCard['aura'], string> = {
  blue: 'aura-blue',
  green: 'aura-green',
  red: 'aura-red',
};

interface ClickTargetsPanelProps {
  cards: ClickTargetCard[];
}

export default function ClickTargetsPanel({ cards }: ClickTargetsPanelProps) {
  if (cards.length === 0) return null;

  return (
    <div className="click-targets-panel">
      <div className="click-targets-header">
        <span className="click-targets-title">🎯 CLICK TARGET</span>
        <span className="click-targets-sub">
          <span className="aura-legend aura-blue">Blue</span> = click now ·
          <span className="aura-legend aura-green"> Green</span> = ready ·
          <span className="aura-legend aura-red"> Red</span> = missing
        </span>
      </div>

      <div className="click-target-list">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`click-target-card ${AURA_CLASS[card.aura]} target-${card.kind}`}
          >
            <span className="click-target-icon">{KIND_ICONS[card.kind]}</span>
            <div className="click-target-body">
              <span className="click-target-kind">{KIND_LABELS[card.kind]}</span>
              <span className="click-target-name">{card.name}</span>
              {card.location && (
                <span className="click-target-location">📍 {card.location}</span>
              )}
              <span className="click-target-action-badge">Action: {card.action}</span>
              {card.hint && <span className="click-target-hint">{card.hint}</span>}
            </div>
            <span className="click-aura-ring" aria-hidden />
          </div>
        ))}
      </div>
    </div>
  );
}
