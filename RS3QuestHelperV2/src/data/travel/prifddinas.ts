import type { LocationTravelData } from './types';

export const PRIFDDINAS: LocationTravelData = {
  id: 'prifddinas',
  displayName: 'Prifddinas',
  aliases: ['prifddinas', 'prif', 'elf city'],
  areaDescription: 'Crystal city of the elves',
  routes: [
    {
      methodId: 'prif-lodestone',
      walkSeconds: 0,
      routeType: 'fastest',
    },
    {
      methodId: 'crystal-teleport',
      walkSeconds: 0,
      routeType: 'cheapest',
    },
    {
      methodId: 'grace-of-elves',
      walkSeconds: 0,
      routeType: 'alternative',
    },
    {
      methodId: 'varrock-lodestone',
      walkDirection: 'West',
      walkSeconds: 300,
      routeType: 'no-teleport',
    },
  ],
};

export const ELEMENTAL_WORKSHOP: LocationTravelData = {
  id: 'elemental-workshop',
  displayName: 'Elemental Workshop',
  aliases: ['elemental workshop', 'elemental workshop entrance', 'seers workshop'],
  areaDescription: "South of Seers' Village",
  routes: [
    {
      methodId: 'seers-lodestone',
      walkDirection: 'South',
      walkSeconds: 20,
      walkDescription: 'Run south to workshop building',
      routeType: 'fastest',
    },
    {
      methodId: 'camelot-teleport',
      walkDirection: 'South',
      walkSeconds: 25,
      routeType: 'cheapest',
    },
    {
      methodId: 'fairy-ring-dkr',
      walkDirection: 'West',
      walkSeconds: 40,
      routeType: 'ironman',
    },
    {
      methodId: 'lumbridge-lodestone',
      walkDirection: 'North-west',
      walkSeconds: 240,
      routeType: 'no-teleport',
    },
  ],
};
