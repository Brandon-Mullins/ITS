import type { TravelRoute } from '../../types/quest-data';

/** Pre-built route sets for common locations. */
export const ROUTES = {
  draynorVillage: (): TravelRoute[] => [
    {
      type: 'fastest',
      label: 'Fastest',
      description: 'Draynor lodestone → run north-west into Draynor market.',
      requiredUnlocks: ['Draynor lodestone'],
    },
    {
      type: 'cheapest',
      label: 'Alternative',
      description: 'Amulet of glory → Draynor Village → run north.',
      requiredUnlocks: ['Amulet of glory (charged)'],
      membersOnly: true,
    },
    {
      type: 'ironman',
      label: 'Ironman / no jewellery',
      description: "Explorer's ring cabbage-port → run west/north-west (if unlocked).",
      requiredUnlocks: ["Explorer's ring 3", 'Falador Medium Diary'],
      membersOnly: true,
    },
    {
      type: 'no-teleport',
      label: 'No teleport',
      description: 'Lumbridge lodestone → run west past cow field (~90 sec).',
      requiredUnlocks: [],
    },
  ],

  zanaris: (): TravelRoute[] => [
    {
      type: 'fastest',
      label: 'Fastest',
      description: 'Fairy ring B·K·P → Zanaris (equip Dramen/Lunar staff).',
      requiredUnlocks: ['Lost City', 'Dramen/Lunar staff'],
      membersOnly: true,
    },
    {
      type: 'cheapest',
      label: 'Alternative',
      description: 'Lumbridge swamp shed → enter with staff equipped.',
      requiredUnlocks: ['Lost City', 'Dramen/Lunar staff'],
      membersOnly: true,
    },
    {
      type: 'ironman',
      label: 'Ironman',
      description: 'Craft Dramen staff during Lost City → shed entrance.',
      requiredUnlocks: ['Lost City'],
      membersOnly: true,
    },
    {
      type: 'no-teleport',
      label: 'No teleport',
      description: 'Walk to Lumbridge swamp shed from Lumbridge (staff required).',
      requiredUnlocks: ['Dramen/Lunar staff'],
      membersOnly: true,
    },
  ],

  senntisten: (): TravelRoute[] => [
    {
      type: 'fastest',
      label: 'Fastest',
      description: 'Senntisten lodestone → enter dig site/cathedral.',
      requiredUnlocks: ['City of Senntisten', 'Senntisten lodestone'],
      membersOnly: true,
    },
    {
      type: 'cheapest',
      label: 'Alternative',
      description: 'Archaeology journal → Senntisten Dig Site.',
      requiredUnlocks: ['Archaeology journal'],
      membersOnly: true,
    },
    {
      type: 'ironman',
      label: 'Ironman',
      description: 'Varrock lodestone → run east to Senntisten entrance.',
      requiredUnlocks: ['City of Senntisten'],
      membersOnly: true,
    },
    {
      type: 'no-teleport',
      label: 'No teleport',
      description: 'Walk east from Varrock Palace through the dig site.',
      requiredUnlocks: ['City of Senntisten'],
      membersOnly: true,
    },
  ],

  elementalWorkshop: (): TravelRoute[] => [
    {
      type: 'fastest',
      label: 'Fastest',
      description: "Seers' Village lodestone → run south to workshop building.",
      requiredUnlocks: ["Seers' Village lodestone"],
      membersOnly: true,
    },
    {
      type: 'cheapest',
      label: 'Alternative',
      description: 'Camelot Teleport → run south to workshop.',
      requiredUnlocks: ['Camelot Teleport (45 Magic)'],
      membersOnly: true,
    },
    {
      type: 'ironman',
      label: 'Ironman',
      description: 'Fairy ring C·K·S → Catherby → run west to Seers\' Village.',
      requiredUnlocks: ['Fairy ring access', 'Lost City'],
      membersOnly: true,
    },
    {
      type: 'no-teleport',
      label: 'No teleport',
      description: 'Walk from Catherby bank south-west to workshop.',
      requiredUnlocks: [],
      membersOnly: true,
    },
  ],

  fairyRings: (): TravelRoute[] => [
    {
      type: 'fastest',
      label: 'Fastest',
      description: 'Fairy ring B·K·P → Zanaris hub → dial destination.',
      requiredUnlocks: ['Lost City', 'Dramen/Lunar staff'],
      membersOnly: true,
    },
    {
      type: 'cheapest',
      label: 'Alternative',
      description: 'Any fairy ring with staff equipped.',
      requiredUnlocks: ['Dramen/Lunar staff'],
      membersOnly: true,
    },
    {
      type: 'ironman',
      label: 'Ironman',
      description: 'Self-crafted Dramen staff from Lost City quest.',
      requiredUnlocks: ['Lost City'],
      membersOnly: true,
    },
    {
      type: 'no-teleport',
      label: 'No teleport',
      description: 'Walk to nearest fairy ring (e.g. D·K·R south of Draynor).',
      requiredUnlocks: ['Dramen/Lunar staff'],
      membersOnly: true,
    },
  ],
};

export function routesToStrings(routes: TravelRoute[]): string[] {
  return routes.map((r) => `${r.label}: ${r.description}`);
}
