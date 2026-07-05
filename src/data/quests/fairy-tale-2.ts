import type { StructuredQuestDefinition } from '../../types/quest-data';
import { questStep } from './helpers';
import { ROUTES } from './routes';

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
  recommendedItems: ['Food', 'Antipoison'],
  enemies: ['None required (instanced sections)'],
  rewards: ['2 Quest points', '3,500 Farming XP', '2,500 Herblore XP', '3,500 Thieving XP'],
  unlocks: ['Fairy resistance potion recipe', 'Full fairy ring network access'],
  itemBrain: {
    required: ['Vial of water', 'Pestle and mortar', 'Logs', 'Dramen staff or Lunar staff'],
    recommended: ['Food', 'Antipoison'],
    obtainableDuring: ['Logs (chop during quest)'],
    consumed: ['Vial of water', 'Logs'],
    kept: ['Dramen staff or Lunar staff', 'Pestle and mortar'],
    geBuyable: ['Vial of water', 'Pestle and mortar', 'Logs'],
    ironmanNotes: {
      'Vial of water': 'Fill at any fountain or buy from general store',
      'Pestle and mortar': 'Buy from Herblore shop or GE',
      'Logs': 'Chop any tree or buy from GE',
      'Dramen staff or Lunar staff': 'Made during Lost City — keep from that quest',
    },
  },
  steps: [
    questStep('fairy-tale-2-step-1', 'Talk to Martin the Master Gardener in Draynor Village.', {
      location: 'Draynor Village',
      npc: 'Martin the Master Gardener',
      travelRoutes: ROUTES.draynorVillage(),
      dialogueOptions: ['Ask about the quest', 'Yes — start Fairy Tale II'],
      completionChecks: {
        chatContains: ['Martin', 'Fairy Tale'],
        locationContains: ['Draynor'],
      },
      markers: {
        npc: 'Martin the Master Gardener',
        area: 'Draynor Village market',
        minimapHint: 'NPC marker on Martin',
        worldMapHint: 'Draynor Village',
      },
    }),
    questStep('fairy-tale-2-step-2', 'Travel to Zanaris and speak with the Fairy Godfather.', {
      location: 'Zanaris',
      npc: 'Fairy Godfather',
      requiredItems: ['Dramen staff or Lunar staff'],
      travelRoutes: ROUTES.zanaris(),
      dialogueOptions: ['Listen to the Fairy Godfather', 'Agree to help the queen'],
      areaWarning: 'You must equip Dramen/Lunar staff to use fairy rings or enter Zanaris.',
      completionChecks: {
        chatContains: ['Fairy Godfather'],
        locationContains: ['Zanaris'],
      },
      markers: {
        npc: 'Fairy Godfather',
        area: 'Zanaris throne room',
        minimapHint: 'NPC marker on Fairy Godfather',
        worldMapHint: 'Zanaris',
      },
    }),
    questStep('fairy-tale-2-step-3', 'Gather the required ingredients for the queen\'s cure.', {
      requiredItems: ['Vial of water', 'Pestle and mortar', 'Logs'],
      recommendedItems: ['Food'],
      completionChecks: {
        inventoryContains: ['vial', 'pestle', 'logs'],
        questJournalContains: ['ingredients', 'gather'],
      },
      markers: { area: 'Various — see journal' },
    }),
    questStep('fairy-tale-2-step-4', 'Use the fairy rings to reach the required farming locations.', {
      location: 'Fairy rings',
      object: 'Fairy ring',
      requiredItems: ['Dramen staff or Lunar staff'],
      travelRoutes: ROUTES.fairyRings(),
      puzzleHints: [
        'Equip Dramen/Lunar staff before interacting with any fairy ring',
        'Use fairy ring codes from quest journal',
        'Zanaris hub code: B·K·P',
      ],
      areaWarning: 'Do not unequip staff while using fairy rings.',
      completionChecks: {
        locationContains: ['fairy ring', 'Zanaris'],
      },
      markers: {
        object: 'Fairy ring',
        area: 'Fairy ring network',
        minimapHint: 'Nearest fairy ring',
        worldMapHint: 'Fairy ring network',
      },
    }),
    questStep('fairy-tale-2-step-5', 'Use the ingredients on the queen\'s cauldron, then talk to the Fairy Queen in Zanaris.', {
      location: 'Zanaris',
      npc: 'Fairy Queen',
      requiredItems: ['Vial of water', 'Pestle and mortar'],
      travelRoutes: ROUTES.zanaris(),
      dialogueOptions: ['Give the cure to the Fairy Queen'],
      completionChecks: {
        questJournalContains: ['cure', 'queen', 'complete'],
        chatContains: ['Fairy Queen'],
      },
      markers: {
        npc: 'Fairy Queen',
        object: 'Queen\'s cauldron',
        area: 'Zanaris',
        minimapHint: 'NPC marker on Fairy Queen',
        worldMapHint: 'Zanaris',
      },
    }),
  ],
};

export default quest;
