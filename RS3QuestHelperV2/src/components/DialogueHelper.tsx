interface DialogueHelperProps {
  choices: string[];
  /** Index of the next option to highlight (default: first) */
  nextIndex?: number;
}

export default function DialogueHelper({ choices, nextIndex = 0 }: DialogueHelperProps) {
  if (choices.length === 0) return null;

  const safeNext = Math.min(Math.max(0, nextIndex), choices.length - 1);

  return (
    <div className="dialogue-helper dialogue-helper-docked">
      <div className="dialogue-helper-header">
        <span className="gps-card-label">Dialogue</span>
      </div>
      <ol className="dialogue-helper-list">
        {choices.map((choice, i) => (
          <li
            key={choice}
            className={`dialogue-helper-option ${i === safeNext ? 'dialogue-next aura-blue' : i < safeNext ? 'dialogue-done aura-green' : ''}`}
          >
            <span className="dialogue-option-num">{i + 1}</span>
            <span className="dialogue-option-text">{choice}</span>
            {i === safeNext && <span className="dialogue-next-badge">NEXT</span>}
            {i < safeNext && <span className="dialogue-done-badge">✓</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
