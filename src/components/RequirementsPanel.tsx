import { useState } from 'react';
import type { QuestMetadata } from '../types/quest';

interface RequirementsPanelProps {
  metadata: QuestMetadata;
  collectedItems: string[];
  bankVisibleItems?: string[];
  smartDetect: boolean;
  onToggleItem: (item: string) => void;
}

function itemStatus(
  item: string,
  collected: string[],
  bankVisible: string[],
  smartDetect: boolean,
): 'collected' | 'bank' | 'missing' {
  if (collected.includes(item)) return 'collected';
  if (smartDetect && bankVisible.includes(item)) return 'bank';
  return 'missing';
}

export default function RequirementsPanel({
  metadata,
  collectedItems,
  bankVisibleItems = [],
  smartDetect,
  onToggleItem,
}: RequirementsPanelProps) {
  const [expanded, setExpanded] = useState(true);

  const hasContent =
    metadata.requirements.length > 0 ||
    metadata.skillRequirements.length > 0 ||
    metadata.items.length > 0 ||
    metadata.recommended.length > 0 ||
    metadata.kills.length > 0;

  if (!hasContent) return null;

  const collectedCount = metadata.items.filter((i) => collectedItems.includes(i)).length;

  return (
    <div className="requirements-panel">
      <button
        type="button"
        className="requirements-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        <span>
          Requirements & Items
          {metadata.items.length > 0 && (
            <span className="item-progress"> ({collectedCount}/{metadata.items.length} ready)</span>
          )}
        </span>
        <span className="toggle-icon">{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="requirements-content">
          {metadata.skillRequirements.length > 0 && (
            <section>
              <h4>Skill requirements</h4>
              <ul>
                {metadata.skillRequirements.map((req) => (
                  <li key={req.skill}>
                    {req.skill}: level {req.level}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {metadata.requirements.length > 0 && (
            <section>
              <h4>Requirements</h4>
              <ul>
                {metadata.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </section>
          )}

          {metadata.items.length > 0 && (
            <section>
              <h4>Required items</h4>
              {smartDetect && (
                <p className="item-hint">Green = detected in inventory · Yellow = seen in bank</p>
              )}
              <ul className="item-checklist">
                {metadata.items.map((item) => {
                  const status = itemStatus(item, collectedItems, bankVisibleItems, smartDetect);
                  return (
                    <li key={item} className={`item-row item-${status}`}>
                      <label>
                        <input
                          type="checkbox"
                          checked={collectedItems.includes(item)}
                          onChange={() => onToggleItem(item)}
                        />
                        <span className="item-label">{item}</span>
                        {status === 'collected' && <span className="item-badge collected">✓ Ready</span>}
                        {status === 'bank' && <span className="item-badge bank">In bank</span>}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {metadata.recommended.length > 0 && (
            <section>
              <h4>Recommended</h4>
              <ul>
                {metadata.recommended.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {metadata.kills.length > 0 && (
            <section>
              <h4>Combat</h4>
              <ul>
                {metadata.kills.map((kill, i) => (
                  <li key={i}>{kill}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
