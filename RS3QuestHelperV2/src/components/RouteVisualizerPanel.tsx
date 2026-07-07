import type { RankedTravelRoute, TravelDestination } from '../data/travel/types';

interface RouteVisualizerPanelProps {
  route: RankedTravelRoute;
  destination: TravelDestination;
  onClose: () => void;
  visual?: boolean;
}

export default function RouteVisualizerPanel({
  route,
  destination,
  onClose,
  visual = true,
}: RouteVisualizerPanelProps) {
  return (
    <div className="tb-route-overlay" role="dialog" aria-label="Route map">
      <div className="tb-route-modal">
        <header className="tb-route-modal-header">
          <h3>Route to {destination.location}</h3>
          <button type="button" className="tb-close-btn" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="tb-route-visual">
          {route.visualSteps.map((step, i) => (
            <div key={`${step.label}-${i}`} className="tb-visual-step-group">
              <div className="tb-visual-step">
                <span className="tb-visual-icon">{step.icon}</span>
                <div className="tb-visual-text">
                  <span className="tb-visual-label">{step.label}</span>
                  {step.detail && <span className="tb-visual-detail">{step.detail}</span>}
                </div>
              </div>
              {i < route.visualSteps.length - 1 && (
                <div className="tb-visual-arrow" aria-hidden>↓</div>
              )}
            </div>
          ))}
        </div>

        {!visual && (
          <p className="tb-route-desc">{route.description}</p>
        )}

        <footer className="tb-route-modal-footer">
          <span className="tb-route-est">⏱ {route.estimatedTime}</span>
          {route.walkDirection && (
            <span className="tb-route-dir">↗ {route.walkDirection}</span>
          )}
          <p className="tb-route-future-note">Interactive world map coming soon</p>
        </footer>
      </div>
    </div>
  );
}
