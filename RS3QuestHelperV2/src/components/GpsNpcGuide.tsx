import type { NpcNavigationGuide } from '../utils/npc-navigation';

interface GpsNpcGuideProps {
  guide: NpcNavigationGuide;
}

function CompassArrow({ angle, label }: { angle: number; label: string }) {
  return (
    <div className="gps-compass" aria-hidden>
      <div
        className="gps-compass-arrow"
        style={{ transform: `rotate(${angle}deg)` }}
        title={label}
      >
        ↑
      </div>
      <span className="gps-compass-label">{label}</span>
    </div>
  );
}

/** Prominent NPC finder — where to go after teleporting */
export default function GpsNpcGuide({ guide }: GpsNpcGuideProps) {
  return (
    <div className="gps-card gps-npc-guide">
      <div className="gps-card-label">🎯 Find NPC</div>
      <div className="gps-npc-hero">
        <span className="gps-npc-portrait" aria-hidden>{guide.portraitIcon}</span>
        <div className="gps-npc-hero-text">
          <div className="gps-npc-name">{guide.npcName}</div>
          <div className="gps-npc-area">{guide.area}</div>
        </div>
        <CompassArrow angle={guide.compassAngle} label={guide.compassLabel} />
      </div>

      <div className="gps-npc-walk">
        <span className="gps-npc-walk-icon">🏃</span>
        <div>
          <strong>After teleport:</strong>{' '}
          {guide.walkDescription ?? `Run ${guide.compassLabel.toLowerCase()}`}
          {guide.estimatedWalk && (
            <span className="gps-npc-walk-time"> · {guide.estimatedWalk}</span>
          )}
        </div>
      </div>

      <div className="gps-npc-landmark">
        <span className="gps-npc-landmark-icon">👁</span>
        <span>Look for: {guide.landmark}</span>
      </div>

      <div className="gps-npc-minimap-hint">
        <span className="gps-minimap-dot" aria-hidden />
        Yellow dot on your minimap shows NPC direction
      </div>
    </div>
  );
}
