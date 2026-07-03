import type { StructuredQuestDefinition } from '../../types/quest-data';
import { questStep } from './helpers';

const quest: StructuredQuestDefinition = {
  id: 'elemental-workshop-4',
  name: 'Elemental Workshop IV',
  pageName: 'Elemental Workshop IV',
  members: true,
  length: 'Short',
  requirements: ['Completion of Elemental Workshop III'],
  skillRequirements: [
    { skill: 'Smithing', level: 42 },
    { skill: 'Magic', level: 42 },
  ],
  requiredItems: ['Pickaxe', 'Hammer', 'Coal'],
  recommendedItems: ['Food', 'Prayer potions'],
  enemies: ['Barbarian Spirit', 'Water Elemental'],
  rewards: ['Ability to smith elemental body and legs', 'Smithing XP', 'Magic XP'],
  unlocks: ['Elemental body and legs smithing'],
  steps: [
    questStep('ew4-step-1', 'Enter the Elemental Workshop beneath Seers\' Village.', {
      location: 'Elemental Workshop',
      fastestRoutes: [
        "Seers' Village lodestone → workshop south of bank.",
        'Camelot Teleport → run south.',
        'Fairy ring C·K·S → Catherby → run west.',
      ],
      completionChecks: {
        locationContains: ['Elemental Workshop'],
      },
      markers: { area: 'Elemental Workshop entrance' },
    }),
    questStep('ew4-step-2', 'Search the workshop for the final scroll.', {
      location: 'Elemental Workshop',
      completionChecks: {
        questJournalContains: ['scroll', 'search'],
      },
      markers: { object: 'Bookcase', area: 'Elemental Workshop' },
    }),
    questStep('ew4-step-3', 'Defeat the Barbarian Spirit and solve the water elemental puzzle.', {
      location: 'Elemental Workshop',
      requiredItems: ['Pickaxe', 'Hammer', 'Coal'],
      combatWarnings: [
        'Barbarian Spirit — combat encounter',
        'Water Elemental — bring food',
      ],
      completionChecks: {
        questJournalContains: ['barbarian', 'water', 'elemental'],
      },
      markers: { area: 'Water elemental room' },
    }),
    questStep('ew4-step-4', 'Smith the elemental body and legs at the workshop anvil.', {
      location: 'Elemental Workshop',
      requiredItems: ['Pickaxe', 'Hammer', 'Coal'],
      completionChecks: {
        questJournalContains: ['body', 'legs', 'complete'],
      },
      markers: { object: 'Anvil', area: 'Elemental Workshop forge' },
    }),
  ],
};

export default quest;
