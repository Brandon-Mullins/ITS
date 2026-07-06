import type { TravelBrainResult, RankedTravelRoute } from '../data/travel/types';

interface GpsTeleportPanelProps {
  travel: TravelBrainResult;
}

function AltPill({ route }: { route: RankedTravelRoute }) {
  return (
    <span className={`gps-alt-pill ${route.available ? '' : 'locked'}`} title={route.lockReason}>
      {route.methodIcon} {route.methodName}
    </span>
  );
}

/** GPS mode — best teleport + compact alternatives only */
export default function GpsTeleportPanel({ travel }: GpsTeleportPanelProps) {
  const { fastestAvailable, destination } = travel;
  const availableRoutes = travel.rankedRoutes.filter((r) => r.available);
  const best = availableRoutes[0] ?? fastestAvailable;
  const alts = availableRoutes.slice(1, 4);

  if (!best) {
    return (
      <div className="gps-card gps-teleport">
        <div className="gps-card-label">Best Teleport</div>
        <p className="gps-teleport-fallback">Walk from nearest lodestone</p>
      </div>
    );
  }

  return (
    <div className="gps-card gps-teleport gps-teleport-primary">
      <div className="gps-card-label">⚡ Best Teleport</div>
      <div className="gps-teleport-method">
        <span className="gps-teleport-icon">{best.methodIcon}</span>
        <span className="gps-teleport-name">{best.methodName}</span>
      </div>
      <div className="gps-teleport-time">Estimated: {best.estimatedTime}</div>
      {best.walkDirection && (
        <div className="gps-teleport-walk">Run {best.walkDirection.toLowerCase()}</div>
      )}
      {destination.npc && (
        <div className="gps-destination">
          → {destination.npc}
          {destination.area && <span className="gps-dest-area"> · {destination.area}</span>}
        </div>
      )}
      {!destination.npc && destination.location && (
        <div className="gps-destination">→ {destination.location}</div>
      )}
      {alts.length > 0 && (
        <div className="gps-alts">
          <span className="gps-alts-label">Alternative</span>
          <div className="gps-alt-pills">
            {alts.map((r) => <AltPill key={`${r.methodName}-${r.type}`} route={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}
