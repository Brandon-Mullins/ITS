import {
  RASIAL_RECOMMENDED_ORDER,
  RASIAL_UNLOCK_GOAL,
  getRasialQuestById,
  type RasialQuestEntry,
  type RasialQuestStatus,
  type RasialUnlockGoal,
} from '../data/goals/rasialUnlock';
import type { PlayerQuestData } from '../utils/quest-match';
import { buildPlayerQuestMap, mapPlayerStatus } from '../utils/quest-match';
import type { QuestIndexEntry } from '../types/quest';

export type GoalQuestManualStatus = RasialQuestStatus;

export interface GoalPlayerProfile {
  playerData: PlayerQuestData | null;
  /** goalId → questId → manual override */
  manualStatus?: Record<string, Record<string, GoalQuestManualStatus>>;
}

export interface PlannedQuestRow extends RasialQuestEntry {
  status: RasialQuestStatus;
  missingPrerequisites: string[];
  missingPrerequisiteNames: string[];
  missingSkills: Array<{ skill: string; level: number }>;
}

export interface NextQuestRecommendation {
  quest: PlannedQuestRow | null;
  blockedQuest: PlannedQuestRow | null;
  blockers: string[];
  blockReason: string | null;
}

export interface RasialGoalPlan {
  goal: RasialUnlockGoal;
  quests: PlannedQuestRow[];
  completedCount: number;
  totalCount: number;
  next: NextQuestRecommendation;
  upcoming: PlannedQuestRow[];
  estimatedRemaining: string;
}

function playerStatusForPage(
  pageName: string,
  playerData: PlayerQuestData | null,
  questIndex: QuestIndexEntry[],
): RasialQuestStatus | null {
  if (!playerData) return null;
  const map = buildPlayerQuestMap(playerData, questIndex);
  const entry = map.get(pageName);
  if (!entry) return null;
  const mapped = mapPlayerStatus(entry);
  if (mapped === 'completed') return 'completed';
  if (mapped === 'in_progress') return 'started';
  if (mapped === 'available') return 'ready';
  if (mapped === 'locked') return 'locked';
  return null;
}

function manualStatusFor(
  goalId: string,
  questId: string,
  profile: GoalPlayerProfile,
): GoalQuestManualStatus | null {
  return profile.manualStatus?.[goalId]?.[questId] ?? null;
}

function prereqsMet(
  quest: RasialQuestEntry,
  statusById: Map<string, RasialQuestStatus>,
): { met: boolean; missing: RasialQuestEntry[] } {
  const missing: RasialQuestEntry[] = [];
  for (const prereqId of quest.prerequisites) {
    const st = statusById.get(prereqId);
    if (st !== 'completed') {
      const prereq = getRasialQuestById(prereqId);
      if (prereq) missing.push(prereq);
    }
  }
  return { met: missing.length === 0, missing };
}

function resolveQuestStatus(
  quest: RasialQuestEntry,
  goalId: string,
  profile: GoalPlayerProfile,
  questIndex: QuestIndexEntry[],
  statusById: Map<string, RasialQuestStatus>,
): RasialQuestStatus {
  const manual = manualStatusFor(goalId, quest.id, profile);
  if (manual) return manual;

  const fromPlayer = playerStatusForPage(quest.pageName, profile.playerData, questIndex);
  if (fromPlayer === 'completed') return 'completed';
  if (fromPlayer === 'started') return 'started';

  const { met } = prereqsMet(quest, statusById);
  if (!met) return 'locked';
  if (fromPlayer === 'ready') return 'ready';
  return 'ready';
}

function buildStatusMap(
  goal: RasialUnlockGoal,
  profile: GoalPlayerProfile,
  questIndex: QuestIndexEntry[],
): Map<string, RasialQuestStatus> {
  const statusById = new Map<string, RasialQuestStatus>();

  // Seed completed from player/manual first pass
  for (const quest of goal.quests) {
    const manual = manualStatusFor(goal.id, quest.id, profile);
    if (manual === 'completed') {
      statusById.set(quest.id, 'completed');
      continue;
    }
    const fromPlayer = playerStatusForPage(quest.pageName, profile.playerData, questIndex);
    if (fromPlayer === 'completed') {
      statusById.set(quest.id, 'completed');
    }
  }

  // Iterate until stable (prereq propagation)
  let changed = true;
  while (changed) {
    changed = false;
    for (const quest of goal.quests) {
      const prev = statusById.get(quest.id);
      const next = resolveQuestStatus(quest, goal.id, profile, questIndex, statusById);
      if (prev !== next) {
        statusById.set(quest.id, next);
        changed = true;
      } else if (!statusById.has(quest.id)) {
        statusById.set(quest.id, next);
        changed = true;
      }
    }
  }

  return statusById;
}

export function buildPlannedQuestRows(
  goal: RasialUnlockGoal,
  profile: GoalPlayerProfile,
  questIndex: QuestIndexEntry[],
): PlannedQuestRow[] {
  const statusById = buildStatusMap(goal, profile, questIndex);

  return goal.quests.map((quest) => {
    const status = statusById.get(quest.id) ?? 'locked';
    const { missing } = prereqsMet(quest, statusById);
    return {
      ...quest,
      status,
      missingPrerequisites: missing.map((m) => m.id),
      missingPrerequisiteNames: missing.map((m) => m.name),
      missingSkills: quest.requiredSkills,
    };
  });
}

export function getNextRecommendedQuest(
  goal: RasialUnlockGoal,
  profile: GoalPlayerProfile,
  questIndex: QuestIndexEntry[],
): NextQuestRecommendation {
  const rows = buildPlannedQuestRows(goal, profile, questIndex);
  const byId = new Map(rows.map((r) => [r.id, r]));

  for (const id of RASIAL_RECOMMENDED_ORDER) {
    const quest = byId.get(id);
    if (!quest) continue;
    if (quest.status === 'completed') continue;
    if (quest.status === 'started') {
      return { quest, blockedQuest: null, blockers: [], blockReason: null };
    }
    if (quest.status === 'ready') {
      return { quest, blockedQuest: null, blockers: [], blockReason: null };
    }
    if (quest.status === 'locked') {
      const blockers = quest.missingPrerequisiteNames;
      return {
        quest: null,
        blockedQuest: quest,
        blockers,
        blockReason:
          blockers.length > 0
            ? `Complete first: ${blockers.join(', ')}`
            : 'Requirements not met',
      };
    }
  }

  return { quest: null, blockedQuest: null, blockers: [], blockReason: 'All requirements complete' };
}

export function buildRasialGoalPlan(
  profile: GoalPlayerProfile,
  questIndex: QuestIndexEntry[],
): RasialGoalPlan {
  const goal = RASIAL_UNLOCK_GOAL;
  const quests = buildPlannedQuestRows(goal, profile, questIndex);
  const completedCount = quests.filter((q) => q.status === 'completed').length;
  const next = getNextRecommendedQuest(goal, profile, questIndex);

  const upcoming: PlannedQuestRow[] = [];
  if (next.quest) {
    const idx = RASIAL_RECOMMENDED_ORDER.indexOf(next.quest.id);
    if (idx >= 0) {
      for (let i = idx + 1; i < RASIAL_RECOMMENDED_ORDER.length && upcoming.length < 3; i++) {
        const row = quests.find((q) => q.id === RASIAL_RECOMMENDED_ORDER[i]);
        if (row && row.status !== 'completed') upcoming.push(row);
      }
    }
  }

  return {
    goal,
    quests,
    completedCount,
    totalCount: quests.length,
    next,
    upcoming,
    estimatedRemaining: completedCount >= quests.length ? 'Complete!' : 'Calculating…',
  };
}

export function setManualQuestStatus(
  current: Record<string, Record<string, GoalQuestManualStatus>> | undefined,
  goalId: string,
  questId: string,
  status: GoalQuestManualStatus,
): Record<string, Record<string, GoalQuestManualStatus>> {
  const next = { ...current };
  next[goalId] = { ...(next[goalId] ?? {}), [questId]: status };
  return next;
}

export function clearManualGoalStatus(
  current: Record<string, Record<string, GoalQuestManualStatus>> | undefined,
  goalId: string,
): Record<string, Record<string, GoalQuestManualStatus>> {
  const next = { ...current };
  delete next[goalId];
  return next;
}
