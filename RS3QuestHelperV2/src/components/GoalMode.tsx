import { useState } from 'react';
import { listGoals } from '../services/goal-planner';
import { buildGoalPlan, type GoalPlan } from '../services/goal-planner';
import type { QuestIndexEntry } from '../types/quest';
import type { PlayerQuestData } from '../utils/quest-match';
import type { GoalQuestManualStatus } from '../services/goalPlanner';
import RoadToRasial from './RoadToRasial';
import { RASIAL_UNLOCK_GOAL } from '../data/goals/rasialUnlock';

interface GoalModeProps {
  selectedGoal?: string;
  onSelectGoal: (goalId: string) => void;
  onStartQuest: (pageName: string) => void;
  playerData: PlayerQuestData | null;
  questIndex: QuestIndexEntry[];
  goalManualStatus?: Record<string, Record<string, GoalQuestManualStatus>>;
  onGoalManualStatusChange?: (status: Record<string, Record<string, GoalQuestManualStatus>>) => void;
}

export default function GoalMode({
  selectedGoal,
  onSelectGoal,
  onStartQuest,
  playerData,
  questIndex,
  goalManualStatus,
  onGoalManualStatusChange,
}: GoalModeProps) {
  const [rasialOpen, setRasialOpen] = useState(false);
  const goals = listGoals();
  const plan: GoalPlan | null = selectedGoal && selectedGoal !== 'unlock-rasial'
    ? buildGoalPlan(selectedGoal, playerData, questIndex)
    : null;

  if (rasialOpen) {
    return (
      <RoadToRasial
        playerData={playerData}
        questIndex={questIndex}
        manualStatus={goalManualStatus}
        onManualStatusChange={onGoalManualStatusChange ?? (() => {})}
        onStartQuest={onStartQuest}
        onBack={() => setRasialOpen(false)}
      />
    );
  }

  return (
    <div className="goal-mode">
      <h2 className="goal-title">🎯 Goal Mode</h2>
      <p className="goal-subtitle">Pick a goal — we generate the quest order.</p>

      <button
        type="button"
        className="rasial-featured-card"
        onClick={() => {
          onSelectGoal('unlock-rasial');
          setRasialOpen(true);
        }}
      >
        <span className="rasial-featured-icon">🦴</span>
        <div className="rasial-featured-body">
          <span className="rasial-featured-name">Unlock Rasial</span>
          <span className="rasial-featured-desc">Roadmap to Alpha vs Omega and the Rasial boss fight.</span>
        </div>
        <span className="rasial-featured-cta">Open Roadmap →</span>
      </button>

      <div className="goal-grid">
        {goals.filter((g) => g.id !== 'unlock-rasial').map((goal) => (
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

      {selectedGoal === 'unlock-rasial' && !rasialOpen && (
        <div className="goal-plan">
          <p className="goal-desc">{RASIAL_UNLOCK_GOAL.description}</p>
          <button type="button" className="btn-primary goal-next" onClick={() => setRasialOpen(true)}>
            Open Road to Rasial
          </button>
        </div>
      )}
    </div>
  );
}
