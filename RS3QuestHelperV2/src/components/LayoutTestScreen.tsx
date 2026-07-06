/** Stress-test screen — every element must survive resize without clipping */

const MOCK_STEPS = Array.from({ length: 12 }, (_, i) => i + 1);

const MOCK_ITEMS = [
  'Dramen staff or Lunar staff',
  'Vial of water',
  'Pestle and mortar',
  'Enchanted chicken scroll (very long item name test)',
  'Logs',
  'Food',
  'Antipoison (4)',
];

const MOCK_DIALOGUE = [
  'Ask about the quest and what happened to the fairy queen',
  'Yes — I will help cure the queen',
  'Tell me more about the fairy resistance potion ingredients',
];

export default function LayoutTestScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="qh-panel layout-test-panel">
      <header className="qh-header">
        <button type="button" className="qh-icon-btn" onClick={onBack} title="Back">←</button>
        <div className="qh-header-text">
          <h1 className="qh-quest-name">
            Fairy Tale II - Cure a Queen (Layout Test — Extremely Long Quest Name Overflow Check)
          </h1>
          <div className="qh-badges">
            <span className="qh-badge official">Layout Test</span>
            <span className="qh-badge steps">12 steps</span>
          </div>
        </div>
      </header>

      <div className="qh-body">
        <nav className="qh-step-rail" aria-label="Test steps">
          {MOCK_STEPS.map((n) => (
            <button
              key={n}
              type="button"
              className={`qh-step-dot ${n === 1 ? 'active' : ''} ${n < 1 ? 'done' : ''}`}
            >
              <span className="qh-step-num">{n}</span>
            </button>
          ))}
        </nav>

        <div className="qh-main">
          <div className="qh-section">
            <div className="qh-section-label">Step 1 of 12</div>
            <p className="qh-instruction-text">
              Talk to Martin the Master Gardener in Draynor Village market beside the farming patch.
              This paragraph is intentionally long to test text wrapping and horizontal overflow behaviour
              at narrow window widths down to the minimum supported size of 420 pixels.
            </p>
          </div>

          <div className="tb-panel">
            <div className="tb-destination-card">
              <div className="tb-section-label">📍 Destination</div>
              <div className="tb-dest-npc">Martin the Master Gardener</div>
              <div className="tb-dest-location">Draynor Village Market — beside the farming patch</div>
            </div>
            <div className="tb-route-card tb-route-primary">
              <div className="tb-route-header">
                <span className="tb-route-type">Fastest Route</span>
              </div>
              <div className="tb-route-method">
                <span className="tb-method-icon">🪨</span>
                <span className="tb-method-name">Draynor Lodestone — run north-west through the market stalls</span>
              </div>
              <div className="tb-route-time">
                <span className="tb-time-label">Estimated:</span>
                <span className="tb-time-value">14 sec</span>
              </div>
            </div>
          </div>

          <div className="qh-section qh-items-section">
            <div className="qh-section-label">Required items</div>
            <ul className="tb-item-list">
              {MOCK_ITEMS.map((item) => (
                <li key={item} className="tb-item-card aura-red">
                  <span className="tb-item-icon">○</span>
                  <div className="tb-item-body">
                    <div className="tb-item-name">{item}</div>
                    <div className="tb-item-status">Not found</div>
                  </div>
                  <button type="button" className="tb-item-action">Get</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="qh-section">
            <div className="qh-section-label">Dialogue</div>
            <ul className="dialogue-helper-list">
              {MOCK_DIALOGUE.map((d, i) => (
                <li key={d} className={`dialogue-helper-option ${i === 0 ? 'dialogue-next aura-blue' : ''}`}>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <footer className="qh-footer">
        <button type="button" className="qh-nav-btn" disabled>← Prev</button>
        <button type="button" className="qh-done-btn">Done ✓</button>
        <button type="button" className="qh-nav-btn">Next →</button>
      </footer>
    </div>
  );
}
