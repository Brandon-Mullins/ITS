import type { StructuredQuestDefinition } from '../../types/quest-data';
import { questStep } from './helpers';
import { ROUTES } from './routes';

const quest: StructuredQuestDefinition = {
  id: 'meet-naressa-senntisten',
  name: 'Meet Naressa in Senntisten',
  pageName: 'Meet Naressa in Senntisten',
  members: true,
  length: 'Short',
  isMiniquest: true,
  requirements: ['Partial completion of City of Senntisten', 'Archaeology level 58'],
  skillRequirements: [{ skill: 'Archaeology', level: 58 }],
  requiredItems: [],
  recommendedItems: ['Archaeology journal', 'Food'],
  enemies: [],
  rewards: ['Archaeology XP', 'Story progression'],
  unlocks: ['Further Senntisten storyline'],
  itemBrain: {
    required: [],
    recommended: ['Archaeology journal', 'Food'],
    geBuyable: [],
    ironmanNotes: { 'Archaeology journal': 'Obtained from Archaeology tutorial' },
  },
  steps: [
    questStep('naressa-step-1', 'Travel to Senntisten and find Naressa in the Archaeology dig site.', {
      location: 'Senntisten',
      npc: 'Naressa',
      travelRoutes: ROUTES.senntisten(),
      completionChecks: {
        locationContains: ['Senntisten', 'Dig Site'],
      },
      markers: { npc: 'Naressa', area: 'Senntisten Dig Site' },
    }),
    questStep('naressa-step-2', 'Talk to Naressa to begin the miniquest.', {
      location: 'Senntisten',
      npc: 'Naressa',
      dialogueOptions: ['Start the conversation with Naressa'],
      completionChecks: {
        chatContains: ['Naressa'],
        questJournalContains: ['Naressa', 'Senntisten'],
      },
      markers: { npc: 'Naressa', area: 'Senntisten Dig Site' },
    }),
    questStep('naressa-step-3', 'Follow Naressa\'s instructions and complete the objective in Senntisten.', {
      location: 'Senntisten',
      npc: 'Naressa',
      completionChecks: {
        questJournalContains: ['complete', 'Naressa'],
      },
      markers: { area: 'Senntisten' },
    }),
  ],
};

export default quest;
