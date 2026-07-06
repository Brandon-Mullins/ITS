import { useState } from 'react';
import type { TravelBrainResult, RankedTravelRoute } from '../data/travel/types';
import RouteVisualizerPanel from './RouteVisualizerPanel';

interface TravelBrainPanelProps {
  travel: TravelBrainResult;
  uiMode?: 'newbie' | 'veteran' | 'standard';
}

function RouteCard({
  route,
  highlight,
  compact,
}: {
  route: RankedTravelRoute;
  highlight?: boolean;
  compact?: boolean;
}) {
  const metCount = route.requirements.filter((r) => r.met).length;
  const allMet = route.requirements.length === 0 || metCount === route.requirements.length;

  return (
    <div className={`tb-route-card ${highlight ? 'tb-route-primary' : ''} ${route.locked ? 'tb-route-locked' : ''}`}>
      <div className="tb-route-header">
        <span className="tb-route-type">{route.label}</span>
        {route.locked && <span className="tb-locked-badge">Locked</span>}
      </div>
      <div className="tb-route-method">
        <span className="tb-method-icon" aria-hidden>{route.methodIcon}</span>
        <span className="tb-method-name">{route.methodName}</span>
      </div>
      {!compact && route.walkDirection && (
        <div className="tb-route-walk">
          <span className="tb-walk-icon">🏃</span>
          <span>Walk: {route.walkDirection}</span>
        </div>
      )}
      <div className="tb-route-time">
        <span className="tb-time-label">Estimated:</span>
        <span className="tb-time-value">{route.estimatedTime}</span>
      </div>
      {!compact && route.requirements.length > 0 && (
        <div className="tb-route-reqs">
          <span className="tb-reqs-label">Requirements:</span>
          <ul className="tb-reqs-list">
            {route.requirements.map((req) => (
              <li key={req.text} className={req.met ? 'met' : 'missing'}>
                {req.met ? '✔' : '✗'} {req.text}
              </li>
            ))}
          </ul>
        </div>
      )}
      {route.locked && route.lockReason && (
        <p className="tb-lock-reason">{route.lockReason}</p>
      )}
      {!compact && !allMet && route.available === false && (
        <p className="tb-alt-hint">Unlock above to use this route</p>
      )}
    </div>
  );
}

export default function TravelBrainPanel({ travel, uiMode = 'standard' }: TravelBrainPanelProps) {
  const [showRoute, setShowRoute] = useState(false);
  const isNewbie = uiMode === 'newbie';
  const isVeteran = uiMode === 'veteran';
  const { destination, fastestAvailable, alternatives, ironmanRoute, noTeleportRoute } = travel;

  const displayRoutes: RankedTravelRoute[] = [];
  if (fastestAvailable) displayRoutes.push(fastestAvailable);
  for (const alt of alternatives) {
    if (!displayRoutes.includes(alt)) displayRoutes.push(alt);
  }
  if (ironmanRoute && !displayRoutes.includes(ironmanRoute)) displayRoutes.push(ironmanRoute);
  if (noTeleportRoute && !displayRoutes.includes(noTeleportRoute)) displayRoutes.push(noTeleportRoute);

  if (displayRoutes.length === 0) {
    return (
      <div className="tb-panel">
        <div className="tb-section-label">📍 Travel</div>
        <p className="tb-fallback">Walk from nearest lodestone or use jewellery teleports.</p>
      </div>
    );
  }

  return (
    <div className="tb-panel">
      <div className="tb-destination-card">
        <div className="tb-section-label">📍 Destination</div>
        {destination.npc && <div className="tb-dest-npc">{destination.npc}</div>}
        <div className="tb-dest-location">{destination.area ?? destination.location}</div>
      </div>

      {isNewbie && travel.newbieInstructions.length > 0 && (
        <div className="tb-newbie-card">
          <div className="tb-section-label">🌱 Step-by-step</div>
          <ol className="tb-newbie-list">
            {travel.newbieInstructions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </div>
      )}

      {fastestAvailable && (
        <RouteCard route={fastestAvailable} highlight compact={isVeteran} />
      )}

      {!isVeteran && alternatives.slice(0, 2).map((route) => (
        <RouteCard key={`${route.methodName}-${route.type}`} route={route} />
      ))}

      {!isVeteran && ironmanRoute && ironmanRoute !== fastestAvailable && !alternatives.includes(ironmanRoute) && (
        <RouteCard route={ironmanRoute} />
      )}

      {!isVeteran && noTeleportRoute && noTeleportRoute !== fastestAvailable && (
        <RouteCard route={noTeleportRoute} />
      )}

      {fastestAvailable && (
        <button
          type="button"
          className="tb-show-route-btn"
          onClick={() => setShowRoute(true)}
        >
          🗺 Show Route
        </button>
      )}

      {showRoute && fastestAvailable && (
        <RouteVisualizerPanel
          route={fastestAvailable}
          destination={destination}
          onClose={() => setShowRoute(false)}
          visual={isNewbie || uiMode === 'standard'}
        />
      )}
    </div>
  );
}
