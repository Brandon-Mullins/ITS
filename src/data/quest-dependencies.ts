/** Quest prerequisite graph — wiki page names */
export interface QuestDependency {
  pageName: string;
  requiresQuests: string[];
  requiresSkills: Array<{ skill: string; level: number }>;
  unlocks: string[];
  goalTags: string[];
}

export const QUEST_DEPENDENCIES: QuestDependency[] = [
  {
    pageName: 'Lost City',
    requiresQuests: [],
    requiresSkills: [{ skill: 'Crafting', level: 31 }, { skill: 'Woodcutting', level: 36 }],
    unlocks: ['Zanaris access', 'Dragon longsword/dagger'],
    goalTags: ['fairy-rings', 'pvm-unlocks'],
  },
  {
    pageName: 'Fairy Tale I - Growing Pains',
    requiresQuests: ['Lost City'],
    requiresSkills: [],
    unlocks: ['Fairy Tale II'],
    goalTags: ['fairy-rings'],
  },
  {
    pageName: 'Fairy Tale II - Cure a Queen',
    requiresQuests: [
      'Fairy Tale I - Growing Pains',
      'Lost City',
      'Recipe for Disaster/Freeing the Goblin generals',
    ],
    requiresSkills: [
      { skill: 'Thieving', level: 40 },
      { skill: 'Farming', level: 49 },
      { skill: 'Herblore', level: 57 },
    ],
    unlocks: ['Fairy resistance potion'],
    goalTags: ['fairy-rings', 'xp-rewards'],
  },
  {
    pageName: 'City of Senntisten',
    requiresQuests: ['The Temple at Senntisten', 'Desert Treasure'],
    requiresSkills: [{ skill: 'Archaeology', level: 58 }],
    unlocks: ['Senntisten lodestone', 'Senntisten storyline'],
    goalTags: ['city-of-senntisten', 'ancient-curses', 'pvm-unlocks'],
  },
  {
    pageName: 'Meet Naressa in Senntisten',
    requiresQuests: ['City of Senntisten'],
    requiresSkills: [{ skill: 'Archaeology', level: 58 }],
    unlocks: ['Senntisten story progression'],
    goalTags: ['city-of-senntisten'],
  },
  {
    pageName: 'Twilight of the Gods',
    requiresQuests: ['City of Senntisten', 'Desperate Times'],
    requiresSkills: [],
    unlocks: ['Elder God Wars continuation'],
    goalTags: ['city-of-senntisten', 'pvm-unlocks'],
  },
  {
    pageName: 'Aftermath',
    requiresQuests: ['Twilight of the Gods'],
    requiresSkills: [],
    unlocks: ['Post-Senntisten world state'],
    goalTags: ['city-of-senntisten'],
  },
  {
    pageName: 'Elemental Workshop II',
    requiresQuests: ['Elemental Workshop I'],
    requiresSkills: [{ skill: 'Smithing', level: 20 }, { skill: 'Magic', level: 20 }],
    unlocks: ['Elemental shield smithing'],
    goalTags: [],
  },
  {
    pageName: 'Elemental Workshop III',
    requiresQuests: ['Elemental Workshop II'],
    requiresSkills: [{ skill: 'Smithing', level: 34 }, { skill: 'Magic', level: 34 }],
    unlocks: ['Elemental helmet smithing'],
    goalTags: [],
  },
  {
    pageName: 'Elemental Workshop IV',
    requiresQuests: ['Elemental Workshop III'],
    requiresSkills: [{ skill: 'Smithing', level: 42 }, { skill: 'Magic', level: 42 }],
    unlocks: ['Elemental body and legs smithing'],
    goalTags: [],
  },
  {
    pageName: "Plague's End",
    requiresQuests: ['Within the Light'],
    requiresSkills: [],
    unlocks: ['Prifddinas'],
    goalTags: ['prifddinas'],
  },
  {
    pageName: 'The Temple at Senntisten',
    requiresQuests: ['Desert Treasure'],
    requiresSkills: [],
    unlocks: ['Ancient Curses'],
    goalTags: ['ancient-curses'],
  },
];

export function getDependencies(pageName: string): QuestDependency | undefined {
  return QUEST_DEPENDENCIES.find(
    (d) => d.pageName.toLowerCase() === pageName.toLowerCase(),
  );
}

export function getQuestsForGoal(goalId: string): QuestDependency[] {
  return QUEST_DEPENDENCIES.filter((d) => d.goalTags.includes(goalId));
}
