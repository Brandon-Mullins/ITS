import type { QuestGuide, QuestProgress } from '../types/quest';
import { CURATED_QUESTS } from '../data/quests';

interface SidebarProps {
  guide: QuestGuide | null;
  progress: QuestProgress | null;
  currentIndex: number;
  onSelectStep: (index: number) => void;
  onSelectQuest?: (pageName: string) => void;
  curatedQuestNames?: Array<{ pageName: string; name: string }>;
  view: 'search' | 'guide' | 'goals' | 'editor' | 'why';
  onNavigate: (view: SidebarProps['view']) => void;
}

export default function Sidebar({
  guide,
  progress,
  currentIndex,
  onSelectStep,
  curatedQuestNames = [],
  view,
  onNavigate,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {(['search', 'goals', 'editor', 'why'] as const).map((v) => (
          <button
            key={v}
            type="button"
            className={`sidebar-nav-btn ${view === v ? 'active' : ''}`}
            onClick={() => onNavigate(v)}
          >
            {v === 'search' ? 'Quests' : v === 'goals' ? 'Goals' : v === 'editor' ? 'Editor' : 'Why RS3'}
          </button>
        ))}
      </nav>

      {view === 'guide' && guide && progress && (
        <div className="sidebar-steps">
          <h3 className="sidebar-title">{guide.metadata.name}</h3>
          {guide.source === 'curated' && <span className="badge badge-curated">Official</span>}
          <ol className="sidebar-step-list">
            {guide.steps.map((step, i) => (
              <li key={step.id}>
                <button
                  type="button"
                  className={`sidebar-step-btn ${i === currentIndex ? 'current' : ''} ${progress.completedSteps.includes(step.id) ? 'done' : ''}`}
                  onClick={() => onSelectStep(i)}
                >
                  <span className="step-num">{i + 1}</span>
                  <span className="step-preview">{step.text.slice(0, 40)}…</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {view === 'search' && curatedQuestNames.length > 0 && (
        <div className="sidebar-curated">
          <h3 className="sidebar-title">Official Guides</h3>
          <ul className="sidebar-quest-list">
            {curatedQuestNames.map((q) => (
              <li key={q.pageName}>
                <span className="sidebar-quest-name">{q.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}

export function getCuratedQuestList(): Array<{ pageName: string; name: string }> {
  return CURATED_QUESTS.map((q) => ({ pageName: q.pageName, name: q.name }));
}
