import type { PlayerQuestState } from '../types';

/** Demo player profile for judge demos and first-run tutorial. */
export const DEMO_RSN = 'DemoPlayer';

export const DEMO_QUEST_STATES: PlayerQuestState[] = [
  { questId: 'fairy-tale-2', name: 'Fairy Tale II - Cure a Queen', status: 'NOT_STARTED', eligible: false },
  { questId: 'lost-city', name: 'Lost City', status: 'COMPLETED', eligible: true },
  { questId: 'fairy-tale-1', name: 'Fairy Tale I - Growing Pains', status: 'COMPLETED', eligible: true },
  { questId: 'twilight-of-the-gods', name: 'Twilight of the Gods', status: 'NOT_STARTED', eligible: false },
  { questId: 'city-of-senntisten', name: 'City of Senntisten', status: 'STARTED', eligible: true, currentStep: 12 },
  { questId: 'elemental-workshop-2', name: 'Elemental Workshop II', status: 'NOT_STARTED', eligible: true },
  { questId: 'cooks-assistant', name: "Cook's Assistant", status: 'COMPLETED', eligible: true },
  { questId: 'demon-slayer', name: 'Demon Slayer', status: 'COMPLETED', eligible: true },
];

export const DEMO_INVENTORY = [
  { id: 1, name: 'Vial of water', quantity: 2 },
  { id: 2, name: 'Pestle and mortar', quantity: 1 },
  { id: 3, name: 'Logs', quantity: 5 },
];

export const DEMO_BANK = [
  { id: 10, name: 'Amulet of glory', quantity: 1 },
  { id: 11, name: 'Food', quantity: 20 },
];

export const DEMO_LOCATION = {
  x: 3093,
  y: 3244,
  plane: 0,
  regionName: 'Misthalin',
  areaName: 'Draynor Village',
};
