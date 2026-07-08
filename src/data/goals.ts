export interface QuestGoal {
  id: string;
  name: string;
  description: string;
  category: string;
  /** Wiki page names in recommended completion order */
  questChain: string[];
  /** Skill gates that apply to the whole goal */
  skillGates?: Array<{ skill: string; level: number }>;
}

export const QUEST_GOALS: QuestGoal[] = [
  {
    id: 'fairy-rings',
    name: 'Fairy Rings',
    description: 'Unlock full fairy ring transportation network',
    category: 'Transportation',
    questChain: [
      'Lost City',
      'Fairy Tale I - Growing Pains',
      'Fairy Tale II - Cure a Queen',
    ],
    skillGates: [
      { skill: 'Thieving', level: 40 },
      { skill: 'Farming', level: 49 },
      { skill: 'Herblore', level: 57 },
    ],
  },
  {
    id: 'prifddinas',
    name: 'Prifddinas',
    description: 'Access the elven city of Prifddinas',
    category: 'Areas',
    questChain: [
      'Plague City',
      'Biohazard',
      'Underground Pass',
      'Regicide',
      'Roving Elves',
      "Mourning's End Part I",
      "Mourning's End Part II",
      'Within the Light',
      "Plague's End",
    ],
  },
  {
    id: 'ancient-curses',
    name: 'Ancient Curses',
    description: 'Unlock Ancient Curses prayer book',
    category: 'Prayer',
    questChain: [
      'Desert Treasure',
      'The Temple at Senntisten',
    ],
  },
  {
    id: 'city-of-senntisten',
    name: 'City of Senntisten',
    description: 'Complete the Senntisten storyline foundation',
    category: 'Story',
    questChain: [
      'Desert Treasure',
      'The Dig Site',
      'The Temple at Senntisten',
      'City of Senntisten',
      'Meet Naressa in Senntisten',
      'Twilight of the Gods',
      'Aftermath',
    ],
    skillGates: [{ skill: 'Archaeology', level: 58 }],
  },
  {
    id: 'quest-cape',
    name: 'Quest Cape',
    description: 'Complete all quests for Quest Point Cape',
    category: 'Completion',
    questChain: [], // populated dynamically from index
  },
  {
    id: 'pvm-unlocks',
    name: 'PvM Unlocks',
    description: 'Key quests that unlock bosses and PvM content',
    category: 'PvM',
    questChain: [
      'Dragon Slayer',
      'Lost City',
      'Desert Treasure',
      'The Temple at Senntisten',
      'City of Senntisten',
      'Twilight of the Gods',
      'The World Wakes',
      "Nomad's Requiem",
    ],
  },
  {
    id: 'xp-rewards',
    name: 'XP Rewards',
    description: 'High-XP quests for efficient training',
    category: 'Skilling',
    questChain: [
      'Waterfall Quest',
      'Dragon Slayer',
      'Holy Grail',
      'Tree Gnome Village',
      'The Grand Tree',
      'Monkey Madness',
      'Fairy Tale II - Cure a Queen',
    ],
  },
  {
    id: 'invention',
    name: 'Invention',
    description: 'Unlock the Invention skill',
    category: 'Skills',
    questChain: [
      "Inventor's Apprentice",
    ],
    skillGates: [
      { skill: 'Divination', level: 80 },
      { skill: 'Crafting', level: 80 },
      { skill: 'Smithing', level: 80 },
    ],
  },
];

export function getGoalById(id: string): QuestGoal | undefined {
  return QUEST_GOALS.find((g) => g.id === id);
}
