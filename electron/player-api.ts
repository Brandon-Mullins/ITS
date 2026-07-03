const QUESTS_URL = 'https://apps.runescape.com/runemetrics/quests?user=';
const PROFILE_URL = 'https://apps.runescape.com/runemetrics/profile?user=';

export interface PlayerQuestData {
  rsn: string;
  quests: Array<{
    title: string;
    status: string;
    difficulty: number;
    members: boolean;
    questPoints: number;
    userEligible: boolean;
  }>;
  fetchedAt: string;
  questsComplete?: number;
}

export async function fetchPlayerQuestsFromApi(rsn: string): Promise<PlayerQuestData> {
  const encoded = encodeURIComponent(rsn.trim());

  const [questRes, profileRes] = await Promise.all([
    fetch(`${QUESTS_URL}${encoded}`, {
      headers: { 'User-Agent': 'RS3QuestHelperOverlay/0.1' },
    }),
    fetch(`${PROFILE_URL}${encoded}&activities=0`, {
      headers: { 'User-Agent': 'RS3QuestHelperOverlay/0.1' },
    }),
  ]);

  if (!questRes.ok) {
    throw new Error(`Jagex API error (${questRes.status}). Try again in a moment.`);
  }

  const questData = (await questRes.json()) as {
    quests?: Array<{
      title: string;
      status: string;
      difficulty: number;
      members: boolean;
      questPoints: number;
      userEligible: boolean;
    }>;
  };

  const profileData = profileRes.ok
    ? ((await profileRes.json()) as { questscomplete?: number })
    : {};

  if (!questData.quests || questData.quests.length === 0) {
    throw new Error(
      'No quest data returned. Check RSN spelling, or enable "Public" on RuneMetrics in-game.',
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
