import type { QuestGoal } from '../data/goals';
import { QUEST_GOALS, getGoalById } from '../data/goals';
import { getDependencies } from '../data/quest-dependencies';
import type { PlayerQuestData } from '../utils/quest-match';
import { buildPlayerQuestMap, mapPlayerStatus } from '../utils/quest-match';
import type { QuestIndexEntry } from '../types/quest';

export interface GoalPlanQuest {
  pageName: string;
  name: string;
  status: 'completed' | 'available' | 'in_progress' | 'locked' | 'unknown';
  missingQuests: string[];
  missingSkills: Array<{ skill: string; level: number }>;
}

export interface GoalPlan {
  goal: QuestGoal;
  quests: GoalPlanQuest[];
  completedCount: number;
  totalCount: number;
  nextQuest: GoalPlanQuest | null;
}

export function buildGoalPlan(
  goalId: string,
  playerData: PlayerQuestData | null,
  questIndex: QuestIndexEntry[],
): GoalPlan | null {
  const goal = getGoalById(goalId);
  if (!goal) return null;

  const chain = goal.id === 'quest-cape'
    ? questIndex.filter((q) => !q.isMiniquest).map((q) => q.pageName).slice(0, 50)
    : goal.questChain;

  const playerMap = playerData ? buildPlayerQuestMap(playerData, questIndex) : null;
  const nameByPage = new Map(questIndex.map((q) => [q.pageName, q.name]));

  const quests: GoalPlanQuest[] = chain.map((pageName) => {
    const dep = getDependencies(pageName);
    const pq = playerMap?.get(pageName);
    const status = pq ? mapPlayerStatus(pq) : 'unknown';

    const missingQuests: string[] = [];
    if (dep && playerMap) {
      for (const req of dep.requiresQuests) {
        const reqPq = [...playerMap.entries()].find(([_, e]) =>
          e.title.toLowerCase().includes(req.toLowerCase().split('/')[0]),
        );
        if (!reqPq || mapPlayerStatus(reqPq[1]) !== 'completed') {
          missingQuests.push(req);
        }
      }
    }

    return {
      pageName,
      name: nameByPage.get(pageName) ?? pageName,
      status,
      missingQuests,
      missingSkills: dep?.requiresSkills ?? goal.skillGates ?? [],
    };
  });

  const completedCount = quests.filter((q) => q.status === 'completed').length;
  const nextQuest = quests.find((q) => q.status === 'available' || q.status === 'in_progress') ?? null;

  return {
    goal,
    quests,
    completedCount,
    totalCount: quests.length,
    nextQuest,
  };
}

export function listGoals(): QuestGoal[] {
  return QUEST_GOALS;
}
