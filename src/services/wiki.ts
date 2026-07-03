import { extractWikiLinks, getTravelHints } from '../data/travel-hints';
import { parseDialogueHints, parseCombatWarnings, itemsMentionedInStep } from '../utils/step-parser';

const WIKI_API = 'https://runescape.wiki/api.php';
const WIKI_BASE = 'https://runescape.wiki';

const SKIP_SECTIONS = new Set([
  'official description',
  'overview',
  'rewards',
  'achievements',
  'required for completing',
  'transcript',
  'quick guide',
  'quick start',
  'credits',
  'update history',
  'trivia',
  'gallery',
  'development',
  'music',
  'cultural references',
  'references',
  'see also',
  'disassembly',
  'graphical updates',
  'comparison',
  'cost of completion',
  'recommended setup',
  'recommended loadout',
  'recommended equipment',
  'maps',
  'map',
]);

interface BucketQuestRow {
  page_name: string;
  json: string;
  requirements?: string | null;
  requirement_skill?: string | string[] | null;
  requirement_skill_level?: string | string[] | null;
  official_length?: string | null;
}

interface QuestJsonData {
  name?: string;
  start?: string;
  length?: string;
  members?: string;
  items?: string;
  recommended?: string;
  kills?: string;
  requirements?: string;
}

interface WikiSection {
  index: string;
  line: string;
  level: string;
}

function wikiPageUrl(pageName: string): string {
  return `${WIKI_BASE}/w/${encodeURIComponent(pageName.replace(/ /g, '_'))}`;
}

async function wikiFetch<T>(params: Record<string, string>): Promise<T> {
  const url = new URL(WIKI_API);
  url.searchParams.set('format', 'json');
  url.searchParams.set('formatversion', '2');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    headers: { 'User-Agent': 'RS3QuestHelperOverlay/0.4 (educational overlay; no automation)' },
  });

  if (!response.ok) {
    throw new Error(`Wiki API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function parseWikiList(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .split('\n')
    .map((line) => line.replace(/^\*\s*/, '').trim())
    .filter((line) => line.length > 0 && line.toLowerCase() !== 'none');
}

function stripWikiMarkup(text: string): string {
  let result = text;

  // Templates — remove simple ones
  result = result.replace(/\{\{Needed\|[^}]+\}\}/gi, '');
  result = result.replace(/\{\{[^{}|]+\}\}/g, '');
  result = result.replace(/\{\{[^{}]+\}\}/g, '');

  // Links: [[target|display]] or [[target]]
  result = result.replace(/\[\[(?:[^|\]]+\|)?([^\]]+)\]\]/g, '$1');

  // Bold/italic
  result = result.replace(/'''+/g, '');
  result = result.replace(/''/g, '');

  // HTML tags
  result = result.replace(/<[^>]+>/g, '');

  // Floor number template remnants
  result = result.replace(/\{\{floornumber\|[^}]+\}\}/gi, 'ground floor');

  // File links
  result = result.replace(/\[\[File:[^\]]+\]\]/gi, '');

  // Ref tags
  result = result.replace(/<ref[^>]*>.*?<\/ref>/gi, '');

  // Whitespace cleanup
  result = result.replace(/\n{3,}/g, '\n\n').trim();

  return result;
}

function parseRequirementsFromJson(data: QuestJsonData): string[] {
  if (!data.requirements) return [];
  return data.requirements
    .split('\n')
    .map((line) => stripWikiMarkup(line.replace(/^\*\s*/, '')))
    .filter((line) => line.length > 0);
}

function toStringList(value: string | string[] | null | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return value.split(',').map((v) => v.trim()).filter(Boolean);
}

function parseSkillRequirements(
  skills: string | string[] | null | undefined,
  levels: string | string[] | null | undefined,
): { skill: string; level: number }[] {
  const levelEntries = toStringList(levels);
  const results: { skill: string; level: number }[] = [];

  for (const entry of levelEntries) {
    const colonMatch = entry.match(/^(.+?):\s*(\d+)$/);
    if (colonMatch) {
      const skill = colonMatch[1].trim();
      const level = parseInt(colonMatch[2], 10);
      if (skill.toLowerCase() !== 'quest points' && level > 0) {
        results.push({ skill, level });
      }
      continue;
    }

    const level = parseInt(entry, 10);
    if (!Number.isNaN(level) && level > 0) {
      const skillList = toStringList(skills);
      const skill = skillList[results.length];
      if (skill && skill.toLowerCase() !== 'quest points') {
        results.push({ skill, level });
      }
    }
  }

  if (results.length > 0) return results;

  const skillList = toStringList(skills);
  const numericLevels = levelEntries.map((l) => parseInt(l, 10));
  return skillList
    .map((skill, i) => ({ skill, level: numericLevels[i] ?? 0 }))
    .filter((r) => r.skill && r.level > 0 && r.skill.toLowerCase() !== 'quest points');
}

function parseBucketRow(row: BucketQuestRow): import('../types/quest').QuestMetadata {
  const data: QuestJsonData = JSON.parse(row.json);
  const pageName = row.page_name;
  const name = data.name ?? pageName;
  const isMiniquest = pageName.toLowerCase().includes('miniquest') || name.toLowerCase().includes('miniquest');

  const reqText = row.requirements ?? data.requirements ?? '';
  const requirements = reqText
    ? reqText
        .split('\n')
        .map((line) => stripWikiMarkup(line.replace(/^\*\s*/, '')))
        .filter((line) => line.length > 0)
    : parseRequirementsFromJson(data);

  return {
    name,
    pageName,
    wikiUrl: wikiPageUrl(pageName),
    members: (data.members ?? 'No').toLowerCase() === 'yes',
    length: data.length ?? row.official_length ?? 'Unknown',
    start: stripWikiMarkup(data.start ?? ''),
    requirements,
    skillRequirements: parseSkillRequirements(row.requirement_skill, row.requirement_skill_level),
    items: parseWikiList(data.items).map(stripWikiMarkup),
    recommended: parseWikiList(data.recommended).map(stripWikiMarkup),
    kills: parseWikiList(data.kills).map(stripWikiMarkup),
    isMiniquest,
  };
}

export async function fetchQuestIndex(): Promise<import('../types/quest').QuestIndexEntry[]> {
  const query =
    "bucket('quest').select('page_name','json','official_length').limit(500).run()";

  const data = await wikiFetch<{ bucket?: BucketQuestRow[]; error?: string }>({
    action: 'bucket',
    query,
  });

  if (data.error) throw new Error(data.error);
  if (!data.bucket) return [];

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

function isWalkthroughSection(section: WikiSection): boolean {
  const title = section.line.toLowerCase().trim();
  if (SKIP_SECTIONS.has(title)) return false;
  if (title.startsWith('transcript')) return false;
  return true;
}

async function fetchSectionWikitext(pageName: string, sectionIndex: string): Promise<string> {
  const data = await wikiFetch<{ parse?: { wikitext?: string } }>({
    action: 'parse',
    page: pageName,
    prop: 'wikitext',
    section: sectionIndex,
  });
  return data.parse?.wikitext ?? '';
}

function wikitextToSteps(
  wikitext: string,
  sectionTitle: string,
  baseOrder: number,
  questItems: string[],
  questKills: string[],
): import('../types/quest').QuestStep[] {
  const steps: import('../types/quest').QuestStep[] = [];
  const lines = wikitext.split('\n');

  let paragraphBuffer: string[] = [];
  let paragraphLinks: string[] = [];
  let order = baseOrder;

  const pushStep = (rawText: string, links: string[]) => {
    const text = stripWikiMarkup(rawText).trim();
    if (text.length < 8) return;
    steps.push({
      id: `${sectionTitle}-${order}`,
      sectionTitle,
      text,
      order: order++,
      travelHints: getTravelHints(text, links),
      stepItems: itemsMentionedInStep(text, questItems),
      dialogueChoices: parseDialogueHints(rawText, text),
      combatWarnings: parseCombatWarnings(text, questKills),
    });
  };

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      pushStep(paragraphBuffer.join(' '), paragraphLinks);
    }
    paragraphBuffer = [];
    paragraphLinks = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('=')) continue;
    if (trimmed.startsWith('[[File:')) continue;
    if (trimmed.startsWith('{{Map:')) continue;
    if (trimmed.startsWith('{{Infobox')) continue;
    if (trimmed === '') {
      flushParagraph();
      continue;
    }

    if (trimmed.startsWith('*') || trimmed.startsWith('#')) {
      flushParagraph();
      const links = extractWikiLinks(trimmed);
      pushStep(trimmed.replace(/^[*#]+\s*/, ''), links);
      continue;
    }

    paragraphBuffer.push(trimmed);
    paragraphLinks.push(...extractWikiLinks(trimmed));
  }

  flushParagraph();
  return steps;
}

export async function fetchQuestGuide(pageName: string): Promise<import('../types/quest').QuestGuide> {
  // Fetch metadata from bucket
  const bucketQuery = `bucket('quest').select('page_name','json','requirements','requirement_skill','requirement_skill_level','official_length').where('page_name', '${pageName.replace(/'/g, "\\'")}').limit(1).run()`;

  const bucketData = await wikiFetch<{ bucket?: BucketQuestRow[] }>({
    action: 'bucket',
    query: bucketQuery,
  });

  let metadata: import('../types/quest').QuestMetadata;
  if (bucketData.bucket?.[0]) {
    metadata = parseBucketRow(bucketData.bucket[0]);
  } else {
    metadata = {
      name: pageName,
      pageName,
      wikiUrl: wikiPageUrl(pageName),
      members: false,
      length: 'Unknown',
      start: '',
      requirements: [],
      skillRequirements: [],
      items: [],
      recommended: [],
      kills: [],
      isMiniquest: pageName.toLowerCase().includes('miniquest'),
    };
  }

  // Fetch walkthrough sections
  const sectionsData = await wikiFetch<{ parse?: { sections?: WikiSection[] } }>({
    action: 'parse',
    page: pageName,
    prop: 'sections',
  });

  const sections = (sectionsData.parse?.sections ?? []).filter(isWalkthroughSection);

  const steps: import('../types/quest').QuestStep[] = [];
  let order = 0;

  // Add start step from metadata
  if (metadata.start) {
    const startText = metadata.start;
    steps.push({
      id: 'start-0',
      sectionTitle: 'Getting started',
      text: startText,
      order: order++,
      travelHints: getTravelHints(startText),
      stepItems: itemsMentionedInStep(startText, metadata.items),
      dialogueChoices: parseDialogueHints(startText, startText),
      combatWarnings: parseCombatWarnings(startText, metadata.kills),
    });
  }

  for (const section of sections) {
    const wikitext = await fetchSectionWikitext(pageName, section.index);
    const sectionSteps = wikitextToSteps(wikitext, section.line, order, metadata.items, metadata.kills);
    steps.push(...sectionSteps);
    order += sectionSteps.length;
  }

  // Re-index order
  steps.forEach((step, i) => {
    step.order = i;
    step.id = `${pageName}-${i}`;
  });

  return {
    metadata,
    steps,
    fetchedAt: new Date().toISOString(),
  };
}

export { wikiPageUrl, WIKI_BASE };
