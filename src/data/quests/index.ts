import type { StructuredQuestDefinition } from '../../types/quest-data';
import { questNamesMatch, normalizeQuestKey } from '../../utils/quest-keys';

import meetNaressa from './meet-naressa-senntisten';
import twilightOfTheGods from './twilight-of-the-gods';
import aftermath from './aftermath';
import fairyTale2 from './fairy-tale-2';
import elementalWorkshop2 from './elemental-workshop-2';
import elementalWorkshop3 from './elemental-workshop-3';
import elementalWorkshop4 from './elemental-workshop-4';

export const CURATED_QUESTS: StructuredQuestDefinition[] = [
  meetNaressa,
  twilightOfTheGods,
  aftermath,
  fairyTale2,
  elementalWorkshop2,
  elementalWorkshop3,
  elementalWorkshop4,
];

const byPageName = new Map<string, StructuredQuestDefinition>();
const byId = new Map<string, StructuredQuestDefinition>();

for (const quest of CURATED_QUESTS) {
  byPageName.set(quest.pageName.toLowerCase(), quest);
  byPageName.set(quest.name.toLowerCase(), quest);
  byPageName.set(normalizeQuestKey(quest.pageName), quest);
  byPageName.set(normalizeQuestKey(quest.name), quest);
  byId.set(quest.id, quest);
  // Wiki sometimes prefixes "A "
  byPageName.set(`a ${quest.name}`.toLowerCase(), quest);
}

export function getCuratedQuest(pageNameOrId: string): StructuredQuestDefinition | null {
  const key = pageNameOrId.toLowerCase().trim();
  const direct = byPageName.get(key) ?? byId.get(key) ?? byPageName.get(normalizeQuestKey(pageNameOrId));
  if (direct) return direct;

  for (const quest of CURATED_QUESTS) {
    if (questNamesMatch(pageNameOrId, quest.pageName) || questNamesMatch(pageNameOrId, quest.name)) {
      return quest;
    }
  }
  return null;
}

export function getCuratedQuestById(id: string): StructuredQuestDefinition | null {
  return byId.get(id) ?? null;
}

export function isOfficialGuideQuest(pageNameOrName: string): boolean {
  return getCuratedQuest(pageNameOrName) !== null;
}

export { meetNaressa, twilightOfTheGods, aftermath, fairyTale2 };
export { elementalWorkshop2, elementalWorkshop3, elementalWorkshop4 };
