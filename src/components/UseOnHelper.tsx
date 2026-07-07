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
        Blue aura on inventory item + target object/NPC in-game. Right-click → Use.
      </p>
    </div>
  );
}
