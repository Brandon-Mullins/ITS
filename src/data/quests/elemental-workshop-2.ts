import type { StructuredQuestDefinition } from '../../types/quest-data';
import { questStep } from './helpers';
import { ROUTES } from './routes';

const quest: StructuredQuestDefinition = {
  id: 'elemental-workshop-2',
  name: 'Elemental Workshop II',
  pageName: 'Elemental Workshop II',
  members: true,
  length: 'Short',
  requirements: ['Completion of Elemental Workshop I'],
  skillRequirements: [
    { skill: 'Smithing', level: 20 },
    { skill: 'Magic', level: 20 },
  ],
  requiredItems: ['Pickaxe', 'Hammer', 'Coal'],
  recommendedItems: ['Food (optional)'],
  enemies: ['Earth Elemental (level 44)'],
  rewards: ['Ability to smith elemental shields', 'Smithing XP', 'Magic XP'],
  unlocks: ['Elemental shield smithing'],
  itemBrain: {
    required: ['Pickaxe', 'Hammer', 'Coal'],
    recommended: [],
    geBuyable: ['Coal'],
    ironmanNotes: { Coal: 'Mine or buy from vendors' },
  },
  steps: [
    questStep('ew2-step-1', 'Travel to the Elemental Workshop beneath Seers\' Village.', {
      location: 'Elemental Workshop',
      travelRoutes: ROUTES.elementalWorkshop(),
      completionChecks: {
        locationContains: ['Elemental Workshop', 'Seers'],
      },
      markers: { area: 'Elemental Workshop entrance', object: 'Workshop entrance' },
    }),
    questStep('ew2-step-2', 'Search the bookcases in the workshop for the next scroll.', {
      location: 'Elemental Workshop',
      requiredItems: ['Pickaxe', 'Hammer'],
      completionChecks: {
        questJournalContains: ['scroll', 'bookcase', 'search'],
      },
      markers: { object: 'Bookcase', area: 'Elemental Workshop' },
    }),
    questStep('ew2-step-3', 'Solve the earth elemental puzzle room using your pickaxe and coal.', {
      location: 'Elemental Workshop',
      requiredItems: ['Pickaxe', 'Hammer', 'Coal'],
      combatWarnings: ['Earth Elemental (level 44) — bring food if low level'],
      completionChecks: {
        inventoryContains: ['coal'],
        questJournalContains: ['earth', 'elemental'],
      },
      markers: { area: 'Earth elemental room' },
    }),
    questStep('ew2-step-4', 'Smith the elemental shield at the workshop anvil.', {
      location: 'Elemental Workshop',
      requiredItems: ['Pickaxe', 'Hammer', 'Coal'],
      completionChecks: {
        questJournalContains: ['shield', 'complete'],
      },
      markers: { object: 'Anvil', area: 'Elemental Workshop forge' },
    }),
  ],
};

export default quest;
