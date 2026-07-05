import type { QuestStep } from '../types/quest';
import type { TravelRoute } from '../types/quest-data';

interface RoutePanelProps {
  routes?: TravelRoute[];
  fastestRoutes?: string[];
  uiMode?: 'newbie' | 'veteran' | 'standard';
}

const ROUTE_ICONS: Record<string, string> = {
  fastest: '⚡',
  cheapest: '💰',
  ironman: '🛡',
  'no-teleport': '🚶',
};

export default function RoutePanel({ routes, fastestRoutes, uiMode = 'standard' }: RoutePanelProps) {
  if (routes && routes.length > 0) {
    return (
      <div className="route-panel">
        <span className="travel-heading">Fastest route</span>
        <ol className="travel-methods route-typed">
          {routes.map((route) => (
            <li key={`${route.type}-${route.label}`} className={route.type === 'fastest' ? 'travel-best' : ''}>
              <span className="route-type-badge">{ROUTE_ICONS[route.type] ?? '•'} {route.label}</span>
              <span className="route-desc">{route.description}</span>
              {route.requiredUnlocks && route.requiredUnlocks.length > 0 && uiMode !== 'veteran' && (
                <span className="route-unlocks">
                  Needs: {route.requiredUnlocks.join(', ')}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (fastestRoutes && fastestRoutes.length > 0) {
    return (
      <div className="route-panel">
        <span className="travel-heading">Fastest route</span>
        <ol className="travel-methods route-strings">
          {fastestRoutes.map((route, i) => (
            <li key={route} className={i === 0 ? 'travel-best' : ''}>
              <strong>{i + 1}.</strong> {route}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="route-panel">
      <span className="travel-heading">Fastest route</span>
      <p className="travel-fallback">Use nearest lodestone or jewellery teleport.</p>
    </div>
  );
}

export function routesFromStep(step: QuestStep): TravelRoute[] | undefined {
  return step.travelRoutes;
}
