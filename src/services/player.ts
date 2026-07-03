import type { PlayerQuestData } from '../utils/quest-match';

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
  const encoded = encodeURIComponent(rsn.trim());

  if (window.electronAPI?.fetchPlayerQuests) {
    return window.electronAPI.fetchPlayerQuests(rsn.trim());
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
