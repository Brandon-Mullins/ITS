interface GpsFairyRingPanelProps {
  code: string;
  notes?: string[];
}

export default function GpsFairyRingPanel({ code, notes = [] }: GpsFairyRingPanelProps) {
  const letters = code.split('').join(' · ');

  return (
    <div className="gps-card gps-fairy-ring">
      <div className="gps-card-label">🧚 Fairy Ring Code</div>
      <div className="gps-ring-code">{letters}</div>
      <div className="gps-ring-warn">
        Equip Dramen or Lunar staff + keep Nuff&apos;s certificate in inventory
      </div>
      {notes.length > 0 && (
        <ul className="gps-ring-notes">
          {notes.map((n) => <li key={n}>{n}</li>)}
        </ul>
      )}
    </div>
  );
}
