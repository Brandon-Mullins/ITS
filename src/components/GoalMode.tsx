import { listGoals } from '../services/goal-planner';
import { buildGoalPlan, type GoalPlan } from '../services/goal-planner';
import type { QuestIndexEntry } from '../types/quest';
import type { PlayerQuestData } from '../utils/quest-match';

interface GoalModeProps {
  selectedGoal?: string;
  onSelectGoal: (goalId: string) => void;
  onStartQuest: (pageName: string) => void;
  playerData: PlayerQuestData | null;
  questIndex: QuestIndexEntry[];
}

export default function GoalMode({
  selectedGoal,
  onSelectGoal,
  onStartQuest,
  playerData,
  questIndex,
}: GoalModeProps) {
  const goals = listGoals();
  const plan: GoalPlan | null = selectedGoal
    ? buildGoalPlan(selectedGoal, playerData, questIndex)
    : null;

  return (
    <div className="goal-mode">
      <h2 className="goal-title">🎯 Goal Mode</h2>
      <p className="goal-subtitle">Pick a goal — we generate the quest order.</p>

      <div className="goal-grid">
        {goals.map((goal) => (
          <button
            key={goal.id}
            type="button"
            className={`goal-card ${selectedGoal === goal.id ? 'active' : ''}`}
            onClick={() => onSelectGoal(goal.id)}
          >
            <span className="goal-name">{goal.name}</span>
            <span className="goal-cat">{goal.category}</span>
          </button>
        ))}
      </div>

      {plan && (
        <div className="goal-plan">
          <div className="goal-plan-header">
            <h3>{plan.goal.name}</h3>
            <span className="goal-progress">{plan.completedCount}/{plan.totalCount} done</span>
          </div>
          <p className="goal-desc">{plan.goal.description}</p>

          {plan.nextQuest && (
            <button
              type="button"
              className="btn-primary btn-sm goal-next"
              onClick={() => onStartQuest(plan.nextQuest!.pageName)}
            >
              Start next: {plan.nextQuest.name}
            </button>
          )}

          <ol className="goal-quest-chain">
            {plan.quests.map((q) => (
              <li key={q.pageName} className={`goal-quest goal-status-${q.status}`}>
                <button type="button" className="goal-quest-btn" onClick={() => onStartQuest(q.pageName)}>
                  <span className={`status-pill pill-${q.status}`}>{q.status}</span>
                  <span>{q.name}</span>
                </button>
                {q.missingQuests.length > 0 && (
                  <span className="goal-missing">Needs: {q.missingQuests.join(', ')}</span>
                )}
                {q.missingSkills.length > 0 && (
                  <span className="goal-missing">
                    Skills: {q.missingSkills.map((s) => `${s.skill} ${s.level}`).join(', ')}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
