import type { StructuredQuestDefinition } from '../../types/quest-data';
import { questStep } from './helpers';

const quest: StructuredQuestDefinition = {
  id: 'fairy-tale-2',
  name: 'Fairy Tale II - Cure a Queen',
  pageName: 'Fairy Tale II - Cure a Queen',
  members: true,
  length: 'Medium',
  requirements: [
    'Completion of Fairy Tale I - Growing Pains',
    'Completion of Lost City',
    'Completion of Recipe for Disaster - Freeing the Goblin generals',
    'Thieving level 40',
    'Farming level 49',
    'Herblore level 57',
  ],
  skillRequirements: [
    { skill: 'Thieving', level: 40 },
    { skill: 'Farming', level: 49 },
    { skill: 'Herblore', level: 57 },
  ],
  requiredItems: [
    'Vial of water',
    'Pestle and mortar',
    'Logs',
    'Dramen staff or Lunar staff',
  ],
  recommendedItems: ['Food', 'Antipoison', 'Fairy ring access'],
  enemies: ['None required (instanced sections)'],
  rewards: ['Quest points', 'Farming XP', 'Herblore XP', 'Thieving XP'],
  unlocks: ['Access to fairy resistance potion recipe'],
  steps: [
    questStep('fairy-tale-2-step-1', 'Talk to Martin the Master Gardener in Draynor Village.', {
      location: 'Draynor Village',
      npc: 'Martin the Master Gardener',
      fastestRoutes: [
        'Draynor lodestone → run north-west into Draynor market.',
        'Amulet of glory → Draynor Village → run north.',
        "Explorer's ring cabbage teleport → run west/north-west.",
      ],
      completionChecks: {
        chatContains: ['Martin', 'Fairy Tale'],
        locationContains: ['Draynor'],
      },
      markers: {
        npc: 'Martin the Master Gardener',
        tile: null,
        area: 'Draynor Village market',
      },
    }),
    questStep('fairy-tale-2-step-2', 'Travel to Zanaris and speak with the Fairy Godfather.', {
      location: 'Zanaris',
      npc: 'Fairy Godfather',
      requiredItems: ['Dramen staff or Lunar staff'],
      fastestRoutes: [
        'Fairy ring B·K·P → Zanaris (equip Dramen/Lunar staff).',
        'Lumbridge swamp shed → enter with staff equipped.',
        'Slayer ring → Fremennik Slayer Dungeon → fairy ring.',
      ],
      completionChecks: {
        chatContains: ['Fairy Godfather'],
        locationContains: ['Zanaris'],
      },
      markers: { npc: 'Fairy Godfather', area: 'Zanaris throne room' },
    }),
    questStep('fairy-tale-2-step-3', 'Gather the required ingredients for the queen\'s cure.', {
      requiredItems: ['Vial of water', 'Pestle and mortar', 'Logs'],
      recommendedItems: ['Herblore potions'],
      completionChecks: {
        inventoryContains: ['vial', 'pestle', 'logs'],
        questJournalContains: ['ingredients', 'gather'],
      },
    }),
    questStep('fairy-tale-2-step-4', 'Use the fairy rings to reach the required farming locations.', {
      location: 'Fairy rings',
      requiredItems: ['Dramen staff or Lunar staff'],
      fastestRoutes: [
        'Fairy ring B·K·P → Zanaris hub → dial destination code.',
        'Any fairy ring → equip Dramen/Lunar staff first.',
      ],
      completionChecks: {
        locationContains: ['fairy ring', 'Zanaris'],
      },
      markers: { object: 'Fairy ring', area: 'Fairy ring network' },
    }),
    questStep('fairy-tale-2-step-5', 'Brew the cure and return to the Fairy Queen in Zanaris.', {
      location: 'Zanaris',
      npc: 'Fairy Queen',
      requiredItems: ['Vial of water', 'Pestle and mortar'],
      fastestRoutes: [
        'Fairy ring B·K·P → Zanaris.',
        'Lumbridge swamp shed → Zanaris.',
      ],
      completionChecks: {
        questJournalContains: ['cure', 'queen', 'complete'],
        chatContains: ['Fairy Queen'],
      },
      markers: { npc: 'Fairy Queen', area: 'Zanaris' },
    }),
  ],
};

export default quest;
