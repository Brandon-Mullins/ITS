import { CURATED_QUESTS } from '../data/quests';
import { validateQuest, type ValidationIssue } from '../services/quest-validator';

export default function QuestEditor() {
  const allIssues: ValidationIssue[] = CURATED_QUESTS.flatMap(validateQuest);
  const errors = allIssues.filter((i) => i.severity === 'error');
  const warnings = allIssues.filter((i) => i.severity === 'warning');

  return (
    <div className="quest-editor">
      <h2>Quest Editor & Validation</h2>
      <p className="editor-desc">
        Validates curated quests against the{' '}
        <code>schemas/quest.schema.json</code> quality standard.
      </p>

      <div className="editor-stats">
        <span className="stat-ok">{CURATED_QUESTS.length} quests</span>
        <span className={errors.length ? 'stat-err' : 'stat-ok'}>{errors.length} errors</span>
        <span className="stat-warn">{warnings.length} warnings</span>
      </div>

      <ul className="editor-quest-list">
        {CURATED_QUESTS.map((quest) => {
          const issues = validateQuest(quest);
          const errCount = issues.filter((i) => i.severity === 'error').length;
          const warnCount = issues.filter((i) => i.severity === 'warning').length;
          return (
            <li key={quest.id} className="editor-quest-item">
              <span className="editor-quest-name">{quest.name}</span>
              <span className="editor-quest-meta">
                {quest.steps.length} steps ·
                {errCount > 0 ? ` ${errCount} errors` : ' ✓'}
                {warnCount > 0 ? ` · ${warnCount} warnings` : ''}
              </span>
            </li>
          );
        })}
      </ul>

      {warnings.length > 0 && (
        <details className="editor-issues" open>
          <summary>Warnings ({warnings.length})</summary>
          <ul>
            {warnings.slice(0, 20).map((w, i) => (
              <li key={`${w.stepId}-${i}`} className="issue-warning">
                {w.stepId ? `[${w.stepId}] ` : ''}{w.message}
              </li>
            ))}
          </ul>
        </details>
      )}

      <button type="button" className="btn-ghost btn-sm report-btn" disabled title="Coming soon">
        Report bad step (placeholder)
      </button>

      <p className="editor-footer">
        See <code>docs/contributing-quests.md</code> to add quests.
      </p>
    </div>
  );
}
