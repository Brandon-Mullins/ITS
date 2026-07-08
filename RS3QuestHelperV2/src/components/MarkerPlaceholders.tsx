import type { MapMarker } from '../plugin-api/types';
import { markersFromStep } from '../plugin-api';
import type { QuestStep } from '../types/quest';
import { openWikiUrl } from '../services/storage';

interface MarkerPlaceholdersProps {
  step: QuestStep;
  wikiUrl?: string;
  onShowRoute?: () => void;
}

export default function MarkerPlaceholders({ step, wikiUrl, onShowRoute }: MarkerPlaceholdersProps) {
  const markers: MapMarker[] = markersFromStep(step);
  const area = step.markers?.area ?? step.location ?? 'Quest area';

  return (
    <div className="marker-placeholders">
      <span className="marker-heading">Map &amp; markers</span>

      <div className="marker-minimap-preview">
        <div className="marker-minimap-circle">
          <span className="marker-minimap-dot" title="NPC direction indicator" />
          <span className="marker-minimap-label">Minimap marker</span>
        </div>
        <div className="marker-map-placeholder">
          <span className="marker-map-icon">🗺</span>
          <span>Target area: {area}</span>
        </div>
      </div>

      {markers.length > 0 && (
        <ul className="marker-list">
          {markers.map((m) => (
            <li key={m.id} className={`marker-item marker-${m.type}`}>
              <span className="marker-icon">
                {m.type === 'npc' ? '👤' : m.type === 'object' ? '⬡' : m.type === 'area' ? '🗺' : '📍'}
              </span>
              <span className="marker-label">{m.label}</span>
              <span className="marker-badges">
                {m.minimap && <span className="marker-badge">Minimap</span>}
                {m.worldMap && <span className="marker-badge">World map</span>}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="marker-actions">
        {wikiUrl && (
          <button type="button" className="marker-action-btn" onClick={() => openWikiUrl(wikiUrl)}>
            Open map (wiki)
          </button>
        )}
        {onShowRoute && (
          <button type="button" className="marker-action-btn" onClick={onShowRoute}>
            Show route
          </button>
        )}
      </div>

      <p className="marker-note">Small minimap dot + compass arrow on game overlay when attached. No giant rectangles.</p>
    </div>
  );
}
