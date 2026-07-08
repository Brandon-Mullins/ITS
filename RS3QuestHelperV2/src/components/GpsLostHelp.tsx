import { useState } from 'react';
import type { StepLostHelp } from '../types/quest-data';

interface GpsLostHelpProps {
  help: StepLostHelp;
}

export default function GpsLostHelp({ help }: GpsLostHelpProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="gps-lost-help">
      <button type="button" className="gps-lost-btn" onClick={() => setOpen((o) => !o)}>
        🆘 I&apos;m lost {open ? '▲' : '▼'}
      </button>
      {open && (
        <div className="gps-card gps-lost-panel">
          <p className="gps-lost-summary">{help.summary}</p>
          <div className="gps-lost-row"><strong>Where:</strong> {help.whereIsIt}</div>
          <div className="gps-lost-row"><strong>Nearest teleport:</strong> {help.nearestTeleport}</div>
          <div className="gps-lost-row"><strong>Direction:</strong> {help.directionToRun}</div>
          <div className="gps-lost-row"><strong>Looks like:</strong> {help.whatItLooksLike}</div>
          {help.commonMistakes.length > 0 && (
            <div className="gps-lost-mistakes">
              <strong>Common mistakes:</strong>
              <ul>{help.commonMistakes.map((m) => <li key={m}>{m}</li>)}</ul>
            </div>
          )}
          <div className="gps-lost-fallback">
            <strong>Fallback route:</strong> {help.fallbackRoute}
          </div>
        </div>
      )}
    </div>
  );
}
