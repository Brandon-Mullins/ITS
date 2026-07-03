import type { MapMarker } from '../plugin-api/types';
import { markersFromStep } from '../plugin-api';
import type { QuestStep } from '../types/quest';

interface MarkerPlaceholdersProps {
  step: QuestStep;
}

export default function MarkerPlaceholders({ step }: MarkerPlaceholdersProps) {
  const markers: MapMarker[] = markersFromStep(step);

  if (markers.length === 0) return null;

  return (
    <div className="marker-placeholders">
      <span className="marker-heading">Map markers (plugin API)</span>
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
      <p className="marker-note">Highlights render via Jagex MarkerProvider in native plugin.</p>
    </div>
  );
}
