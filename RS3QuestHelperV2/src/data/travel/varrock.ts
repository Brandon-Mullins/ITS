import type { LocationTravelData } from './types';

export const VARROCK: LocationTravelData = {
  id: 'varrock',
  displayName: 'Varrock',
  aliases: ['varrock', 'varrock palace', 'varrock square', 'gypsy aris', 'reldo'],
  areaDescription: 'Varrock city centre',
  routes: [
    {
      methodId: 'varrock-lodestone',
      walkSeconds: 0,
      walkDescription: 'Arrive in Varrock centre',
      routeType: 'fastest',
    },
    {
      methodId: 'varrock-teleport',
      walkSeconds: 0,
      routeType: 'cheapest',
    },
    {
      methodId: 'ring-of-wealth-ge',
      walkDirection: 'South',
      walkSeconds: 12,
      walkDescription: 'Grand Exchange → run south to centre',
      routeType: 'alternative',
    },
    {
      methodId: 'lumbridge-lodestone',
      walkDirection: 'North',
      walkSeconds: 90,
      walkDescription: 'Walk north through Al Kharid gate route',
      routeType: 'no-teleport',
    },
  ],
};

export const GRAND_EXCHANGE: LocationTravelData = {
  id: 'grand-exchange',
  displayName: 'Grand Exchange',
  aliases: ['grand exchange', 'ge', 'varrock ge'],
  areaDescription: 'Grand Exchange plaza',
  routes: [
    {
      methodId: 'ring-of-wealth-ge',
      walkSeconds: 0,
      routeType: 'fastest',
    },
    {
      methodId: 'varrock-lodestone',
      walkDirection: 'North',
      walkSeconds: 10,
      routeType: 'cheapest',
    },
    {
      methodId: 'max-guild',
      walkDirection: 'North-west',
      walkSeconds: 15,
      routeType: 'alternative',
    },
    {
      methodId: 'lumbridge-lodestone',
      walkDirection: 'North',
      walkSeconds: 120,
      routeType: 'no-teleport',
    },
  ],
};
