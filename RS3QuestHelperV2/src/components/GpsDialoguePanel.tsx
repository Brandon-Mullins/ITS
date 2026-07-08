interface GpsDialoguePanelProps {
  choices: string[];
  nextIndex?: number;
  needsVerification?: boolean;
}

export default function GpsDialoguePanel({ choices, nextIndex = 0, needsVerification }: GpsDialoguePanelProps) {
  if (choices.length === 0) return null;

  const safeNext = Math.min(Math.max(0, nextIndex), choices.length - 1);

  return (
    <div className="gps-card gps-dialogue-panel">
      <div className="gps-dialogue-header">
        <span className="gps-card-label">Dialogue — click these options</span>
        {needsVerification && (
          <span className="gps-verify-badge" title="Dialogue from wiki transcript — may vary slightly in-game">
            Needs verification
          </span>
        )}
      </div>
      <ol className="gps-dialogue-list">
        {choices.map((choice, i) => (
          <li
            key={choice}
            className={`gps-dialogue-opt ${i === safeNext ? 'gps-dialogue-next' : i < safeNext ? 'gps-dialogue-done' : ''}`}
          >
            <span className="gps-dialogue-num">{i + 1}.</span>
            <span className="gps-dialogue-text">Choose: &ldquo;{choice}&rdquo;</span>
            {i === safeNext && <span className="gps-dialogue-badge">NEXT</span>}
            {i < safeNext && <span className="gps-dialogue-check">✓</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
