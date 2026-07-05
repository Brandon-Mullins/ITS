import type { ClickTarget } from '../utils/click-targets';
import { listIncludesItem } from '../utils/item-match';

interface ClickTargetsPanelProps {
  targets: ClickTarget[];
  collectedItems?: string[];
}

const ICONS: Record<ClickTarget['type'], string> = {
  npc: '👤',
  object: '⬡',
  'use-item': '🧪',
  'equip-item': '🛡',
  'click-item': '👆',
};

const ACTION_LABELS: Record<ClickTarget['type'], string> = {
  npc: 'CLICK NPC',
  object: 'CLICK OBJECT',
  'use-item': 'USE IN INVENTORY',
  'equip-item': 'EQUIP FROM INVENTORY',
  'click-item': 'CLICK IN INVENTORY',
};

export default function ClickTargetsPanel({ targets, collectedItems = [] }: ClickTargetsPanelProps) {
  if (targets.length === 0) return null;

  const invTargets = targets.filter((t) =>
    t.type === 'use-item' || t.type === 'equip-item' || t.type === 'click-item',
  );
  const worldTargets = targets.filter((t) => t.type === 'npc' || t.type === 'object');

  return (
    <div className="click-targets-panel">
      <div className="click-targets-header">
        <span className="click-targets-title">🔵 CLICK TARGETS</span>
        <span className="click-targets-sub">Blue glow = what to click in-game</span>
      </div>

      {worldTargets.length > 0 && (
        <div className="click-targets-section">
          <span className="click-section-label">In the game world</span>
          <div className="click-target-list">
            {worldTargets.map((t) => (
              <div key={`${t.type}-${t.label}`} className={`click-target-card blue-aura target-${t.type}`}>
                <span className="click-target-icon">{ICONS[t.type]}</span>
                <div className="click-target-body">
                  <span className="click-target-action">{ACTION_LABELS[t.type]}</span>
                  <span className="click-target-name">{t.label}</span>
                  {t.type === 'npc' && (
                    <span className="click-target-hint">Look for the blue aura on this NPC in-game</span>
                  )}
                </div>
                <span className="click-aura-ring" aria-hidden />
              </div>
            ))}
          </div>
        </div>
      )}

      {invTargets.length > 0 && (
        <div className="click-targets-section">
          <span className="click-section-label">In your inventory</span>
          <div className="click-target-list">
            {invTargets.map((t) => {
              const hasItem = listIncludesItem(collectedItems, t.itemName ?? t.label);
              return (
                <div
                  key={`${t.type}-${t.label}`}
                  className={`click-target-card blue-aura target-${t.type} ${hasItem ? 'has-item' : 'need-item'}`}
                >
                  <span className="click-target-icon">{ICONS[t.type]}</span>
                  <div className="click-target-body">
                    <span className="click-target-action">{ACTION_LABELS[t.type]}</span>
                    <span className="click-target-name">{t.label}</span>
                    {t.targetName && (
                      <span className="click-target-on">on {t.targetName}</span>
                    )}
                    <span className="click-target-hint">
                      {hasItem
                        ? 'Right-click → Use (blue pulse on inventory in-game)'
                        : 'Get this item first — then use from inventory'}
                    </span>
                  </div>
                  <span className="click-aura-ring" aria-hidden />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
