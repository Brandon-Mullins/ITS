/**
 * Fetches all RS3 quest metadata from the RuneScape Wiki Bucket API
 * and writes a bundled quest-index.json for fast offline startup.
 */
import fs from 'fs';
import path from 'path';

const WIKI_API = 'https://runescape.wiki/api.php';
const OUTPUT = path.join(import.meta.dirname, '..', 'data', 'quest-index.json');

interface BucketQuestRow {
  page_name: string;
  json: string;
  official_length?: string | null;
}

interface QuestJsonData {
  name?: string;
  members?: string;
  length?: string;
}

async function fetchQuestIndex() {
  const query =
    "bucket('quest').select('page_name','json','official_length').limit(500).run()";

  const url = new URL(WIKI_API);
  url.searchParams.set('action', 'bucket');
  url.searchParams.set('format', 'json');
  url.searchParams.set('formatversion', '2');
  url.searchParams.set('query', query);

  const response = await fetch(url.toString(), {
    headers: { 'User-Agent': 'RS3QuestHelperOverlay/0.1 (seed script)' },
  });

  if (!response.ok) {
    throw new Error(`Wiki API error: ${response.status}`);
  }

  const data = (await response.json()) as { bucket?: BucketQuestRow[]; error?: string };
  if (data.error) throw new Error(data.error);
  if (!data.bucket) throw new Error('No bucket data returned');

  return data.bucket.map((row) => {
    const parsed = JSON.parse(row.json) as QuestJsonData;
    const pageName = row.page_name;
    const name = parsed.name ?? pageName;
    return {
      name,
      pageName,
      members: (parsed.members ?? 'No').toLowerCase() === 'yes',
      length: parsed.length ?? row.official_length ?? 'Unknown',
      isMiniquest:
        pageName.toLowerCase().includes('miniquest') ||
        name.toLowerCase().includes('miniquest'),
    };
  });
}

async function main() {
  console.log('Fetching quest index from RuneScape Wiki…');
  const index = await fetchQuestIndex();
  console.log(`Fetched ${index.length} quests`);

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(index, null, 2), 'utf-8');
  console.log(`Wrote ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
