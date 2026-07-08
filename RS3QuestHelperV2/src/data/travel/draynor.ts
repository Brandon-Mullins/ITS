import type { LocationTravelData } from './types';

export const DRAYNOR: LocationTravelData = {
  id: 'draynor',
  displayName: 'Draynor Village',
  aliases: [
    'draynor village',
    'draynor',
    'draynor market',
    'draynor manor',
    'martin the master gardener',
    'master gardener',
  ],
  areaDescription: 'Draynor Village Market',
  routes: [
    {
      methodId: 'passage-abyss',
      walkDirection: 'North-west',
      walkSeconds: 4,
      walkDescription: 'Run north-west to the market',
      routeType: 'fastest',
    },
    {
      methodId: 'draynor-lodestone',
      walkDirection: 'North-west',
      walkSeconds: 8,
      walkDescription: 'Run north-west into Draynor market',
      routeType: 'fastest',
    },
    {
      methodId: 'amulet-glory-draynor',
      walkDirection: 'North',
      walkSeconds: 5,
      walkDescription: 'Run north to the market',
      routeType: 'cheapest',
    },
    {
      methodId: 'explorers-ring',
      walkDirection: 'West',
      walkSeconds: 15,
      walkDescription: 'Cabbage-port → run west/north-west to Draynor',
      routeType: 'ironman',
    },
    {
      methodId: 'fairy-ring-dkr',
      walkDirection: 'North',
      walkSeconds: 10,
      walkDescription: 'South of village → short walk north',
      routeType: 'alternative',
    },
    {
      methodId: 'lumbridge-lodestone',
      walkDirection: 'West',
      walkSeconds: 102,
      walkDescription: 'Run west past the cow field',
      routeType: 'no-teleport',
    },
  ],
};
