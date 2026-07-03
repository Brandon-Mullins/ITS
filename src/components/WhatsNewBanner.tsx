interface WhatsNewBannerProps {
  version: string;
  onDismiss: () => void;
  onOpenGoals: () => void;
}

export default function WhatsNewBanner({ version, onDismiss, onOpenGoals }: WhatsNewBannerProps) {
  return (
    <div className="whats-new-banner">
      <div className="whats-new-content">
        <strong>v{version} is here!</strong>
        <span> Goals · Smart routes · Demo mode · Shopping lists</span>
      </div>
      <div className="whats-new-actions">
        <button type="button" className="btn-ghost btn-sm" onClick={onOpenGoals}>Try Goals</button>
        <button type="button" className="btn-ghost btn-sm" onClick={onDismiss}>Got it</button>
      </div>
    </div>
  );
}
