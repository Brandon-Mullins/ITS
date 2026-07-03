import type { StructuredQuestDefinition } from '../../types/quest-data';
import { questStep } from './helpers';

const quest: StructuredQuestDefinition = {
  id: 'elemental-workshop-3',
  name: 'Elemental Workshop III',
  pageName: 'Elemental Workshop III',
  members: true,
  length: 'Short',
  requirements: ['Completion of Elemental Workshop II'],
  skillRequirements: [
    { skill: 'Smithing', level: 34 },
    { skill: 'Magic', level: 34 },
  ],
  requiredItems: ['Pickaxe', 'Hammer', 'Coal'],
  recommendedItems: ['Food'],
  enemies: ['Fire Elemental'],
  rewards: ['Ability to smith elemental helmets', 'Smithing XP', 'Magic XP'],
  unlocks: ['Elemental helmet smithing'],
  steps: [
    questStep('ew3-step-1', 'Return to the Elemental Workshop beneath Seers\' Village.', {
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
    questStep('ew3-step-2', 'Find and read the next scroll in the workshop bookcases.', {
      location: 'Elemental Workshop',
      completionChecks: {
        questJournalContains: ['scroll', 'bookcase'],
      },
      markers: { object: 'Bookcase', area: 'Elemental Workshop' },
    }),
    questStep('ew3-step-3', 'Complete the fire elemental puzzle room.', {
      location: 'Elemental Workshop',
      requiredItems: ['Pickaxe', 'Hammer', 'Coal'],
      combatWarnings: ['Fire Elemental — bring food and antifire if needed'],
      completionChecks: {
        questJournalContains: ['fire', 'elemental'],
      },
      markers: { area: 'Fire elemental room' },
    }),
    questStep('ew3-step-4', 'Smith the elemental helmet at the workshop anvil.', {
      location: 'Elemental Workshop',
      requiredItems: ['Pickaxe', 'Hammer', 'Coal'],
      completionChecks: {
        questJournalContains: ['helmet', 'complete'],
      },
      markers: { object: 'Anvil', area: 'Elemental Workshop forge' },
    }),
  ],
};

export default quest;
