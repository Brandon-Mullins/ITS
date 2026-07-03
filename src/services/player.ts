import type { PlayerQuestData } from '../utils/quest-match';
import { DEMO_RSN, DEMO_QUEST_STATES } from '../plugin-api/mock/demo-data';

const QUESTS_URL = 'https://apps.runescape.com/runemetrics/quests?user=';
const PROFILE_URL = 'https://apps.runescape.com/runemetrics/profile?user=';

interface RunemetricsQuestResponse {
  quests?: Array<{
    title: string;
    status: string;
    difficulty: number;
    members: boolean;
    questPoints: number;
    userEligible: boolean;
  }>;
  loggedIn?: string;
  error?: string;
}

interface RunemetricsProfileResponse {
  questscomplete?: number;
  questsstarted?: number;
  questsnotstarted?: number;
  name?: string;
  error?: string;
}

export async function fetchPlayerQuests(rsn: string): Promise<PlayerQuestData> {
  const trimmed = rsn.trim();

  if (trimmed.toLowerCase() === DEMO_RSN.toLowerCase()) {
    return {
      rsn: DEMO_RSN,
      quests: DEMO_QUEST_STATES.map((q) => ({
        title: q.name,
        status: q.status,
        difficulty: 2,
        members: true,
        questPoints: 1,
        userEligible: q.eligible,
      })),
      fetchedAt: new Date().toISOString(),
      questsComplete: 2,
    };
  }

  const encoded = encodeURIComponent(trimmed);

  if (window.electronAPI?.fetchPlayerQuests) {
    return window.electronAPI.fetchPlayerQuests(trimmed);
  }

  // Browser fallback (may hit CORS)
  const [questRes, profileRes] = await Promise.all([
    fetch(`${QUESTS_URL}${encoded}`),
    fetch(`${PROFILE_URL}${encoded}&activities=0`),
  ]);

  if (!questRes.ok) {
    throw new Error(`Failed to fetch quest data (${questRes.status})`);
  }

  const questData = (await questRes.json()) as RunemetricsQuestResponse;
  const profileData = profileRes.ok
    ? ((await profileRes.json()) as RunemetricsProfileResponse)
    : {};

  if (!questData.quests || questData.quests.length === 0) {
    throw new Error(
      'No quest data found. Check the RSN spelling, or enable RuneMetrics on your account.',
    );
  }

  return {
    rsn: rsn.trim(),
    quests: questData.quests.map((q) => ({
      title: q.title,
      status: q.status as PlayerQuestData['quests'][0]['status'],
      difficulty: q.difficulty,
      members: q.members,
      questPoints: q.questPoints,
      userEligible: q.userEligible,
    })),
    fetchedAt: new Date().toISOString(),
    questsComplete: profileData.questscomplete,
  };
}
