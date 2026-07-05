import type { StepDebugInfo } from '../utils/step-analysis';

interface StepDebugPanelProps {
  debug: StepDebugInfo;
  open: boolean;
  onToggle: () => void;
}

export default function StepDebugPanel({ debug, open, onToggle }: StepDebugPanelProps) {
  return (
    <div className="step-debug-panel">
      <button type="button" className="debug-toggle-btn" onClick={onToggle}>
        {open ? '▼' : '▶'} Debug current step
      </button>

      {open && (
        <div className="debug-content">
          <div className="debug-row"><span className="debug-key">Step ID</span><code>{debug.stepId}</code></div>
          <div className="debug-row"><span className="debug-key">Step index</span><code>{debug.stepIndex + 1}</code></div>
          <div className="debug-row"><span className="debug-key">Instruction</span><span>{debug.instruction}</span></div>

          <div className="debug-section">
            <span className="debug-key">Expected targets</span>
            <ul className="debug-list">
              {debug.expectedCards.map((c) => (
                <li key={c.id}>{c.kind}: {c.name} ({c.action}) [{c.aura}]</li>
              ))}
              {debug.expectedCards.length === 0 && <li>None inferred</li>}
            </ul>
          </div>

          <div className="debug-section">
            <span className="debug-key">Completion checks</span>
            <pre className="debug-pre">{JSON.stringify(debug.completionChecks ?? {}, null, 2)}</pre>
          </div>

          <div className="debug-section">
            <span className="debug-key">OCR inventory text</span>
            <pre className="debug-pre">{debug.scan?.detectedItems?.join(', ') || '(none)'}</pre>
          </div>

          <div className="debug-section">
            <span className="debug-key">OCR bank text</span>
            <pre className="debug-pre">
              {debug.scan?.bankOpen
                ? (debug.scan.bankItems?.join(', ') || '(bank open, no items matched)')
                : '(bank not open)'}
            </pre>
          </div>

          <div className="debug-section">
            <span className="debug-key">OCR location / chat snippet</span>
            <pre className="debug-pre">{debug.scan?.ocrSnippet?.slice(0, 400) || '(no scan yet)'}</pre>
          </div>

          <div className="debug-section">
            <span className="debug-key">Suggest step complete?</span>
            <code>{debug.suggestStepComplete ? 'YES' : 'NO'}</code>
          </div>

          <div className="debug-section">
            <span className="debug-key">Why complete / not complete</span>
            <p className="debug-reason">{debug.completionReason}</p>
          </div>

          <div className="debug-section">
            <span className="debug-key">Inventory slot OCR (≥85% confidence)</span>
            <ul className="debug-list">
              {(debug.scan?.inventorySlots ?? []).map((s) => (
                <li key={`${s.item}-${s.slotIndex}`}>
                  {s.item} slot {s.slotIndex} — {Math.round(s.confidence * 100)}%
                </li>
              ))}
              {(debug.scan?.inventorySlots ?? []).length === 0 && <li>No high-confidence slot match — banner only</li>}
            </ul>
          </div>

          <div className="debug-section">
            <span className="debug-key">Confidence signals</span>
            <ul className="debug-list">
              {debug.confidence.map((c) => (
                <li key={c.id}>{c.label}: {c.status}{c.detail ? ` — ${c.detail}` : ''}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
