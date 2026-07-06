import { getCuratedQuest } from '../data/quests';
import { getDependencies } from '../data/quest-dependencies';
import type { QuestIndexEntry } from '../types/quest';
import type { PlayerQuestData } from '../utils/quest-match';
import { buildPlayerQuestMap, mapPlayerStatus } from '../utils/quest-match';

export interface QuestRecommendation {
  pageName: string;
  name: string;
  status: string;
  reason: string;
  missingQuests: string[];
  missingSkills: Array<{ skill: string; level: number }>;
  priority: number;
}

export interface PlannerSummary {
  completed: number;
  available: number;
  inProgress: number;
  locked: number;
  recommendations: QuestRecommendation[];
}

export function buildPlannerSummary(
  playerData: PlayerQuestData | null,
  questIndex: QuestIndexEntry[],
): PlannerSummary {
  const playerMap = playerData ? buildPlayerQuestMap(playerData, questIndex) : null;
  const counts = { completed: 0, available: 0, inProgress: 0, locked: 0 };
  const recommendations: QuestRecommendation[] = [];

  for (const quest of questIndex) {
    const pq = playerMap?.get(quest.pageName);
    const status = pq ? mapPlayerStatus(pq) : 'unknown';
    if (status === 'completed') counts.completed++;
    else if (status === 'available') counts.available++;
    else if (status === 'in_progress') counts.inProgress++;
    else if (status === 'locked') counts.locked++;
  }

  if (playerMap) {
    for (const quest of questIndex) {
      const pq = playerMap.get(quest.pageName);
      if (!pq) continue;
      const status = mapPlayerStatus(pq);
      if (status !== 'available' && status !== 'in_progress') continue;

      const dep = getDependencies(quest.pageName);
      const curated = getCuratedQuest(quest.pageName);
      const missingQuests = dep?.requiresQuests.filter((req) => {
        const found = [...playerMap.values()].some(
          (e) => e.title.toLowerCase().includes(req.toLowerCase().split('/')[0]) &&
            mapPlayerStatus(e) === 'completed',
        );
        return !found;
      }) ?? [];

      const missingSkills = dep?.requiresSkills ?? curated?.skillRequirements ?? [];

      let priority = status === 'in_progress' ? 100 : 50;
      if (curated) priority += 30;
      if (missingQuests.length === 0 && missingSkills.length === 0) priority += 20;

      recommendations.push({
        pageName: quest.pageName,
        name: quest.name,
        status,
        reason: curated ? 'Official guide available' : 'Ready to start',
        missingQuests,
        missingSkills,
        priority,
      });
    }
  }

  recommendations.sort((a, b) => b.priority - a.priority);

  return {
    ...counts,
    recommendations: recommendations.slice(0, 5),
  };
}

export function getMissingForQuest(pageName: string): {
  missingQuests: string[];
  missingSkills: Array<{ skill: string; level: number }>;
} {
  const dep = getDependencies(pageName);
  const curated = getCuratedQuest(pageName);
  return {
    missingQuests: dep?.requiresQuests ?? [],
    missingSkills: dep?.requiresSkills ?? curated?.skillRequirements ?? [],
  };
}
