interface UseOnHelperProps {
  pairs: Array<{ item: string; target: string }>;
}

export default function UseOnHelper({ pairs }: UseOnHelperProps) {
  if (pairs.length === 0) return null;

  return (
    <div className="use-on-helper">
      <div className="use-on-header">🔵 USE ON TARGET</div>
      {pairs.map(({ item, target }) => (
        <div key={`${item}-${target}`} className="use-on-row aura-blue">
          <span className="use-on-item aura-blue">Use <strong>{item}</strong></span>
          <span className="use-on-arrow">→</span>
          <span className="use-on-target aura-blue">on <strong>{target}</strong></span>
        </div>
      ))}
      <p className="use-on-note">
        Helper panel only — no in-game screen rectangles in v0.6.4-HIGHLIGHT-FIX. Right-click → Use in game.
      </p>
    </div>
  );
}
