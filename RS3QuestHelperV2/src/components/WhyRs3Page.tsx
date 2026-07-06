export default function WhyRs3Page() {
  return (
    <div className="why-rs3">
      <h2>Why This Helps RS3</h2>

      <section>
        <h3>The Problem</h3>
        <p>
          RS3 has 400+ quests. New and returning players bounce between the Wiki,
          YouTube, and spreadsheets — losing hours to navigation, not gameplay.
        </p>
      </section>

      <section>
        <h3>The Solution</h3>
        <p>
          A native Quest Helper — proven on OSRS — that shows exactly what to do,
          where to go, what to bring, and how to get there. Zero automation.
        </p>
      </section>

      <section>
        <h3>What Makes This Different</h3>
        <ul>
          <li><strong>Smart routing</strong> — fastest, ironman, and no-teleport paths</li>
          <li><strong>Goal mode</strong> — "I want Fairy Rings" → full quest chain</li>
          <li><strong>Item brain</strong> — shopping lists with bank/inventory status</li>
          <li><strong>Plugin-ready</strong> — adapter layer for Jagex APIs today</li>
          <li><strong>Safety-first</strong> — guidance only, no botting surface</li>
        </ul>
      </section>

      <section>
        <h3>For Jagex</h3>
        <p>
          This prototype demonstrates the full feature set using safe OCR overlay.
          The same quest data and UI maps directly to approved plugin APIs —
          quest state, inventory, bank, markers — with no client modification.
        </p>
      </section>

      <section className="why-compliance">
        <p>✓ No automation · ✓ No memory reading · ✓ No unfair advantage</p>
      </section>
    </div>
  );
}
