import type { StructuredQuestDefinition } from '../../types/quest-data';
import { questStep } from './helpers';

const quest: StructuredQuestDefinition = {
  id: 'twilight-of-the-gods',
  name: 'Twilight of the Gods',
  pageName: 'Twilight of the Gods',
  members: true,
  length: 'Very Long',
  requirements: [
    'Completion of City of Senntisten',
    'Completion of Desperate Times',
    'High combat stats recommended',
  ],
  skillRequirements: [],
  requiredItems: [],
  recommendedItems: ['Food', 'Prayer potions', 'Teleport items'],
  enemies: ['Elder God Wars Dungeon bosses', 'Quest combat encounters'],
  rewards: ['Quest points', 'XP lamps', 'Story progression'],
  unlocks: ['Elder God Wars storyline continuation'],
  steps: [
    questStep('totg-step-1', 'Speak with the quest start NPC in Senntisten about the Elder Gods threat.', {
      location: 'Senntisten',
      npc: 'Azzanadra',
      fastestRoutes: [
        'Senntisten lodestone → Cathedral area.',
        'Archaeology journal → Senntisten Dig Site → run north.',
        'Varrock lodestone → run east to Senntisten.',
      ],
      completionChecks: {
        chatContains: ['Azzanadra', 'Elder'],
        locationContains: ['Senntisten'],
      },
      markers: { npc: 'Azzanadra', area: 'Senntisten Cathedral' },
    }),
    questStep('totg-step-2', 'Investigate the situation at the Senntisten Cathedral.', {
      location: 'Senntisten',
      fastestRoutes: [
        'Senntisten lodestone → Cathedral.',
        'Archaeology journal → Senntisten.',
      ],
      completionChecks: {
        questJournalContains: ['Cathedral', 'investigate'],
        locationContains: ['Senntisten'],
      },
      markers: { area: 'Senntisten Cathedral' },
    }),
    questStep('totg-step-3', 'Travel to the Elder God Wars Dungeon entrance and proceed with the quest.', {
      location: 'Senntisten',
      recommendedItems: ['Food', 'Prayer potions'],
      combatWarnings: ['Combat encounters — prepare food and prayers'],
      fastestRoutes: [
        'Senntisten lodestone → Elder God Wars Dungeon entrance.',
        'Archaeology journal → Senntisten.',
      ],
      completionChecks: {
        locationContains: ['Elder God Wars', 'Senntisten'],
        questJournalContains: ['dungeon', 'Elder'],
      },
      markers: { area: 'Elder God Wars Dungeon entrance' },
    }),
    questStep('totg-step-4', 'Complete the combat and puzzle sections as directed by the quest journal.', {
      combatWarnings: [
        'Bring food and prayer potions',
        'Combat step — check gear and prayers',
      ],
      completionChecks: {
        questJournalContains: ['progress', 'complete'],
      },
    }),
  ],
};

export default quest;
