import type { StructuredQuestDefinition } from '../../types/quest-data';
import { questNamesMatch, normalizeQuestKey } from '../../utils/quest-keys';

import meetNaressa from './meet-naressa-senntisten';
import twilightOfTheGods from './twilight-of-the-gods';
import aftermath from './aftermath';
import fairyTale2 from './fairy-tale-2';
import elementalWorkshop2 from './elemental-workshop-2';
import elementalWorkshop3 from './elemental-workshop-3';
import elementalWorkshop4 from './elemental-workshop-4';
import { RASIAL_ROADMAP_QUESTS } from './rasial-roadmap';

export const CURATED_QUESTS: StructuredQuestDefinition[] = [
  meetNaressa,
  twilightOfTheGods,
  aftermath,
  fairyTale2,
  elementalWorkshop2,
  elementalWorkshop3,
  elementalWorkshop4,
  ...RASIAL_ROADMAP_QUESTS,
];

const byPageName = new Map<string, StructuredQuestDefinition>();
const byId = new Map<string, StructuredQuestDefinition>();

/** Prefer the guide with more steps when multiple quests share a page name */
function registerPageName(key: string, quest: StructuredQuestDefinition): void {
  const k = key.toLowerCase();
  const existing = byPageName.get(k);
  if (!existing || quest.steps.length > existing.steps.length) {
    byPageName.set(k, quest);
  }
}

for (const quest of CURATED_QUESTS) {
  registerPageName(quest.pageName, quest);
  registerPageName(quest.name, quest);
  registerPageName(normalizeQuestKey(quest.pageName), quest);
  registerPageName(normalizeQuestKey(quest.name), quest);
  byId.set(quest.id, quest);
  // Wiki sometimes prefixes "A "
  registerPageName(`a ${quest.name}`, quest);
}

// Rasial roadmap uses fairy-tale-ii; full guide id is fairy-tale-2
const fairyTaleFull = byId.get('fairy-tale-2');
if (fairyTaleFull) {
  byId.set('fairy-tale-ii', fairyTaleFull);
  registerPageName('fairy-tale-ii', fairyTaleFull);
}

export function getCuratedQuest(pageNameOrId: string): StructuredQuestDefinition | null {
  const key = pageNameOrId.toLowerCase().trim();
  const direct = byPageName.get(key) ?? byId.get(key) ?? byPageName.get(normalizeQuestKey(pageNameOrId));
  if (direct) return direct;

  let best: StructuredQuestDefinition | null = null;
  for (const quest of CURATED_QUESTS) {
    if (questNamesMatch(pageNameOrId, quest.pageName) || questNamesMatch(pageNameOrId, quest.name)) {
      if (!best || quest.steps.length > best.steps.length) {
        best = quest;
      }
    }
  }
  return best;
}

export function getCuratedQuestById(id: string): StructuredQuestDefinition | null {
  return byId.get(id) ?? null;
}

export function isOfficialGuideQuest(pageNameOrName: string): boolean {
  return getCuratedQuest(pageNameOrName) !== null;
}

export { meetNaressa, twilightOfTheGods, aftermath, fairyTale2 };
export { elementalWorkshop2, elementalWorkshop3, elementalWorkshop4 };
