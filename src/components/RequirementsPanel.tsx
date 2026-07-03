import { useState } from 'react';
import type { QuestMetadata } from '../types/quest';

interface RequirementsPanelProps {
  metadata: QuestMetadata;
}

export default function RequirementsPanel({ metadata }: RequirementsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const hasContent =
    metadata.requirements.length > 0 ||
    metadata.skillRequirements.length > 0 ||
    metadata.items.length > 0 ||
    metadata.recommended.length > 0 ||
    metadata.kills.length > 0;

  if (!hasContent) return null;

  return (
    <div className="requirements-panel">
      <button
        type="button"
        className="requirements-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        <span>Requirements & Items</span>
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
              <ul className="item-checklist">
                {metadata.items.map((item, i) => (
                  <li key={i}>
                    <label>
                      <input type="checkbox" />
                      {item}
                    </label>
                  </li>
                ))}
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
