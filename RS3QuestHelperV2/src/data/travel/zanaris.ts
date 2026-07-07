import type { LocationTravelData } from './types';

export const ZANARIS: LocationTravelData = {
  id: 'zanaris',
  displayName: 'Zanaris',
  aliases: ['zanaris', 'lost city', 'fairy godfather', 'fairy queen'],
  areaDescription: 'Fairy city — Lost City',
  routes: [
    {
      methodId: 'fairy-ring-bkp',
      walkSeconds: 0,
      walkDescription: 'Dial BKP with Dramen/Lunar staff equipped',
      routeType: 'fastest',
    },
    {
      methodId: 'zanaris-shed',
      walkSeconds: 0,
      walkDescription: 'Enter Lumbridge swamp shed with staff equipped',
      routeType: 'cheapest',
    },
    {
      methodId: 'fairy-ring-dkr',
      walkDirection: 'North',
      walkSeconds: 20,
      walkDescription: 'Fairy ring DKR → walk to shed entrance',
      routeType: 'ironman',
    },
    {
      methodId: 'lumbridge-lodestone',
      walkDirection: 'South',
      walkSeconds: 60,
      walkDescription: 'Walk south to swamp shed (staff required)',
      routeType: 'no-teleport',
    },
  ],
};

export const FAIRY_RINGS: LocationTravelData = {
  id: 'fairy-rings',
  displayName: 'Fairy rings',
  aliases: ['fairy ring', 'fairy rings', 'fairy ring network', 'fairy ring code'],
  areaDescription: 'Fairy ring network hub',
  routes: [
    {
      methodId: 'fairy-ring-bkp',
      walkSeconds: 0,
      walkDescription: 'Zanaris hub → dial destination code',
      routeType: 'fastest',
    },
    {
      methodId: 'fairy-ring-dkr',
      walkSeconds: 0,
      routeType: 'alternative',
    },
    {
      methodId: 'zanaris-shed',
      walkDirection: 'South',
      walkSeconds: 30,
      routeType: 'ironman',
    },
    {
      methodId: 'draynor-lodestone',
      walkDirection: 'South',
      walkSeconds: 45,
      walkDescription: 'Walk to DKR fairy ring south of Draynor',
      routeType: 'no-teleport',
    },
  ],
};
