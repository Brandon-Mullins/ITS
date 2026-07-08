import https from 'https';

const QUESTS_URL = 'https://apps.runescape.com/runemetrics/quests?user=';

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

const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: 'https://runescape.com/',
};

function httpsGet(url: string, redirects = 0): Promise<string> {
  return new Promise((resolve, reject) => {
    if (redirects > 5) {
      reject(new Error('Too many redirects'));
      return;
    }

    const req = https.get(url, { headers: BROWSER_HEADERS }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : `https://apps.runescape.com${res.headers.location}`;
        httpsGet(next, redirects + 1).then(resolve).catch(reject);
        return;
      }

      let body = '';
      res.on('data', (chunk: Buffer) => {
        body += chunk.toString();
      });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Jagex API returned HTTP ${res.statusCode}`));
          return;
        }
        resolve(body);
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

function parseJsonResponse<T>(body: string, context: string): T {
  const trimmed = body.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    throw new Error(
      `Jagex returned an invalid response for ${context}. ` +
        'Your RuneMetrics profile must be set to Public in-game (Settings → RuneMetrics).',
    );
  }
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new Error(`Failed to parse Jagex quest data for ${context}.`);
  }
}

export async function fetchPlayerQuestsFromApi(rsn: string): Promise<PlayerQuestData> {
  const trimmed = rsn.trim();
  if (!trimmed) {
    throw new Error('Please enter a RuneScape name.');
  }

  const encoded = encodeURIComponent(trimmed);
  const url = `${QUESTS_URL}${encoded}`;

  const body = await httpsGet(url);
  const questData = parseJsonResponse<{
    quests?: Array<{
      title: string;
      status: string;
      difficulty: number;
      members: boolean;
      questPoints: number;
      userEligible: boolean;
    }>;
  }>(body, trimmed);

  if (!questData.quests || questData.quests.length === 0) {
    throw new Error(
      `No quest data for "${trimmed}". Check spelling, or set RuneMetrics to Public in-game.`,
    );
  }

  const completed = questData.quests.filter((q) => q.status === 'COMPLETED').length;

  return {
    rsn: trimmed,
    quests: questData.quests.map((q) => ({
      title: q.title,
      status: q.status,
      difficulty: q.difficulty,
      members: q.members,
      questPoints: q.questPoints,
      userEligible: q.userEligible,
    })),
    fetchedAt: new Date().toISOString(),
    questsComplete: completed,
  };
}
