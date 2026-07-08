export type PlayerQuestStatus =
  | 'COMPLETED'
  | 'NOT_STARTED'
  | 'STARTED'
  | 'IN_PROGRESS'
  | 'UNKNOWN';

export type QuestPlannerStatus =
  | 'completed'
  | 'available'
  | 'in_progress'
  | 'locked'
  | 'unknown';

export interface PlayerQuestEntry {
  title: string;
  status: PlayerQuestStatus;
  difficulty: number;
  members: boolean;
  questPoints: number;
  userEligible: boolean;
}

export interface PlayerQuestData {
  rsn: string;
  quests: PlayerQuestEntry[];
  fetchedAt: string;
  questPointsEarned?: number;
  questsComplete?: number;
}

export function normalizeQuestName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(quest\)/gi, '')
    .replace(/\(miniquest\)/gi, '')
    .replace(/\(historical\)/gi, '')
    .replace(/[^a-z0-9']/g, '')
    .trim();
}

export function mapPlayerStatus(entry: PlayerQuestEntry): QuestPlannerStatus {
  const status = entry.status.toUpperCase();
  if (status === 'COMPLETED') return 'completed';
  if (status === 'STARTED' || status === 'IN_PROGRESS') return 'in_progress';
  if (status === 'NOT_STARTED' && entry.userEligible) return 'available';
  if (status === 'NOT_STARTED' && !entry.userEligible) return 'locked';
  return 'unknown';
}

export function buildPlayerQuestMap(
  playerData: PlayerQuestData,
  wikiQuests: { name: string; pageName: string }[],
): Map<string, PlayerQuestEntry> {
  const map = new Map<string, PlayerQuestEntry>();

  // Index wiki quests by normalized name
  const wikiByNorm = new Map<string, string>();
  for (const q of wikiQuests) {
    wikiByNorm.set(normalizeQuestName(q.name), q.pageName);
    wikiByNorm.set(normalizeQuestName(q.pageName), q.pageName);
  }

  for (const pq of playerData.quests) {
    const norm = normalizeQuestName(pq.title);
    const pageName = wikiByNorm.get(norm);
    if (pageName) {
      map.set(pageName, pq);
      continue;
    }

    // Fuzzy: try partial match
    for (const [wikiNorm, wikiPage] of wikiByNorm) {
      if (wikiNorm.includes(norm) || norm.includes(wikiNorm)) {
        if (!map.has(wikiPage)) {
          map.set(wikiPage, pq);
        }
      }
    }
  }

  return map;
}
