import type { LocationTravelData } from './types';

export const SENNTISTEN: LocationTravelData = {
  id: 'senntisten',
  displayName: 'Senntisten',
  aliases: [
    'senntisten',
    'senntisten cathedral',
    'senntisten dig site',
    'naressa',
    'azzanadra',
  ],
  areaDescription: 'Senntisten Cathedral / Dig Site',
  routes: [
    {
      methodId: 'passage-abyss',
      walkSeconds: 4,
      walkDescription: 'Teleport to Senntisten entrance',
      routeType: 'fastest',
    },
    {
      methodId: 'senntisten-lodestone',
      walkSeconds: 0,
      walkDescription: 'Arrive at Senntisten lodestone',
      routeType: 'fastest',
    },
    {
      methodId: 'archaeology-journal',
      walkSeconds: 0,
      walkDescription: 'Teleport to Senntisten Dig Site',
      routeType: 'cheapest',
    },
    {
      methodId: 'varrock-lodestone',
      walkDirection: 'East',
      walkSeconds: 45,
      walkDescription: 'Run east to Senntisten entrance',
      routeType: 'ironman',
    },
    {
      methodId: 'ring-of-wealth-ge',
      walkDirection: 'South-east',
      walkSeconds: 55,
      routeType: 'alternative',
    },
    {
      methodId: 'lumbridge-lodestone',
      walkDirection: 'East',
      walkSeconds: 180,
      routeType: 'no-teleport',
    },
  ],
};
