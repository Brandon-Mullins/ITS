import type { StructuredQuestDefinition } from '../../types/quest-data';
import { questStep } from './helpers';

const quest: StructuredQuestDefinition = {
  id: 'aftermath',
  name: 'Aftermath',
  pageName: 'Aftermath',
  members: true,
  length: 'Long',
  requirements: [
    'Completion of Twilight of the Gods',
    'Completion of City of Senntisten',
  ],
  skillRequirements: [],
  requiredItems: [],
  recommendedItems: ['Food', 'Teleport items', 'Archaeology journal'],
  enemies: ['Quest combat encounters'],
  rewards: ['Quest points', 'XP', 'Story conclusion'],
  unlocks: ['Post-Senntisten world state'],
  steps: [
    questStep('aftermath-step-1', 'Return to Senntisten and speak with the quest contact after Twilight of the Gods.', {
      location: 'Senntisten',
      npc: 'Azzanadra',
      fastestRoutes: [
        'Senntisten lodestone → Cathedral.',
        'Archaeology journal → Senntisten Dig Site.',
        'Varrock lodestone → run east.',
      ],
      completionChecks: {
        chatContains: ['Azzanadra'],
        locationContains: ['Senntisten'],
      },
      markers: { npc: 'Azzanadra', area: 'Senntisten' },
    }),
    questStep('aftermath-step-2', 'Follow the quest journal to investigate the aftermath of recent events.', {
      location: 'Senntisten',
      completionChecks: {
        questJournalContains: ['aftermath', 'investigate'],
      },
      markers: { area: 'Senntisten' },
    }),
    questStep('aftermath-step-3', 'Complete the final objectives and report back in Senntisten.', {
      location: 'Senntisten',
      combatWarnings: ['May involve combat — bring food'],
      completionChecks: {
        questJournalContains: ['complete', 'report'],
      },
      markers: { area: 'Senntisten Cathedral' },
    }),
  ],
};

export default quest;
