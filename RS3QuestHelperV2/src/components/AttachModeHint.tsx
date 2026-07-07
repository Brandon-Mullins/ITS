interface AttachModeHintProps {
  onDetach: () => void;
}

/** Shown when overlay is locked to RS3 — full UI needs detach. */
export default function AttachModeHint({ onDetach }: AttachModeHintProps) {
  return (
    <div className="attach-hint">
      <span>Compact attach mode</span>
      <button type="button" className="btn-ghost btn-sm" onClick={onDetach}>
        🔗 Detach for Goals & Planner
      </button>
    </div>
  );
}
