import type { AppSettings } from '../types/quest';

interface TutorialOverlayProps {
  onComplete: () => void;
  onTryDemo: () => void;
}

export default function TutorialOverlay({ onComplete, onTryDemo }: TutorialOverlayProps) {
  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card">
        <h2>Welcome to RS3 Quest Helper</h2>
        <p>Pure guidance — like OSRS Quest Helper. <strong>No automation.</strong></p>
        <ol className="tutorial-steps">
          <li>Enter your RSN to see quest status (or try Demo mode)</li>
          <li>Pick a quest or use <strong>Goal Mode</strong> for quest order</li>
          <li>Follow steps: route → items → dialogue → combat</li>
          <li>Attach overlay to RS3 (windowed mode) for OCR hints</li>
          <li>Click <strong>Done</strong> if auto-detect misses a step</li>
        </ol>
        <div className="tutorial-actions">
          <button type="button" className="btn-primary" onClick={onComplete}>Get started</button>
          <button type="button" className="btn-ghost" onClick={onTryDemo}>Try demo (DemoPlayer)</button>
        </div>
      </div>
    </div>
  );
}

export function applyAccessibility(settings: AppSettings): string {
  const classes: string[] = [];
  if (settings.accessibility?.largeText) classes.push('a11y-large-text');
  if (settings.accessibility?.highContrast) classes.push('a11y-high-contrast');
  if (settings.uiMode === 'veteran') classes.push('ui-veteran');
  if (settings.uiMode === 'newbie') classes.push('ui-newbie');
  return classes.join(' ');
}
