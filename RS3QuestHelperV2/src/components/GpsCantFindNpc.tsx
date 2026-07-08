import { useState } from 'react';
import type { StepCantFindNpc } from '../types/quest-data';

interface GpsCantFindNpcProps {
  help: StepCantFindNpc;
}

export default function GpsCantFindNpc({ help }: GpsCantFindNpcProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="gps-card gps-cant-find-npc">
      <button type="button" className="gps-cant-find-header" onClick={() => setOpen((o) => !o)}>
        <span className="gps-card-label">❓ {help.title}</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="gps-cant-find-body">
          <ul className="gps-cant-find-tips">
            {help.tips.map((t) => <li key={t}>{t}</li>)}
          </ul>
          <div className="gps-map-placeholder">
            <div className="gps-map-placeholder-icon">🗺</div>
            <div className="gps-map-placeholder-text">
              <strong>Target area:</strong> {help.mapArea}
            </div>
            <div className="gps-map-placeholder-landmark">
              Look for: {help.landmark}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
