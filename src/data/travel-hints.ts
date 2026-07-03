/**
 * RS3 travel hint database + lookup.
 * Methods are ordered fastest-first. Shows 2–4 options per step.
 */

export interface TravelMethod {
  name: string;
  detail: string;
  members?: boolean;
}

export interface LocationEntry {
  aliases: string[];
  displayName: string;
  methods: TravelMethod[];
}

export const TRAVEL_HINTS_DB: LocationEntry[] = [
  {
    aliases: [
      'draynor village',
      'draynor',
      'martin the master gardener',
      'master gardener',
      'draynor market',
      'draynor manor',
    ],
    displayName: 'Draynor Village',
    methods: [
      { name: 'Draynor lodestone', detail: 'Teleport → run north-west into Draynor market' },
      { name: 'Amulet of glory', detail: 'Rub → Draynor Village → run north to market', members: true },
      { name: "Explorer's ring", detail: 'Cabbage-port (Falador diary) → run west/north-west to Draynor', members: true },
      { name: 'Fairy ring DKR', detail: 'South of village → short walk north', members: true },
    ],
  },
  {
    aliases: ['lumbridge', 'lumbridge castle', 'father aereck', 'lumbridge church', 'cook (lumbridge)'],
    displayName: 'Lumbridge',
    methods: [
      { name: 'Lumbridge lodestone', detail: 'Teleport directly into Lumbridge' },
      { name: 'Home Teleport', detail: 'Default spawn at Lumbridge' },
      { name: 'Combat bracelet', detail: "Rub → Warriors' Guild → canoe to Lumbridge", members: true },
      { name: 'Archaeology journal', detail: 'Teleport to Archaeology Campus → dig site ferry', members: true },
    ],
  },
  {
    aliases: ['varrock', 'varrock palace', 'varrock square', 'gypsy aris', 'reldo', 'relado'],
    displayName: 'Varrock',
    methods: [
      { name: 'Varrock lodestone', detail: 'Teleport into Varrock centre' },
      { name: 'Varrock Teleport', detail: 'Standard spellbook (25 Magic)', members: true },
      { name: 'Chronicle', detail: "Diango's Toy Store — teleport to Varrock", members: true },
      { name: 'Ring of wealth', detail: 'Rub → Grand Exchange → run south', members: true },
    ],
  },
  {
    aliases: ['grand exchange', 'ge', 'varrock ge'],
    displayName: 'Grand Exchange',
    methods: [
      { name: 'Ring of wealth', detail: 'Rub → Grand Exchange (fastest)', members: true },
      { name: 'Varrock lodestone', detail: 'Teleport → run north to GE' },
      { name: 'Varrock Teleport', detail: 'Spellbook → run north', members: true },
      { name: 'Max guild', detail: 'Max cape/Max guild teleport → run north-west', members: true },
    ],
  },
  {
    aliases: ['falador', 'falador park', 'white knights castle', 'squire asrol', 'party room'],
    displayName: 'Falador',
    methods: [
      { name: 'Falador lodestone', detail: 'Teleport into Falador centre' },
      { name: 'Falador Teleport', detail: 'Standard spellbook (37 Magic)', members: true },
      { name: "Explorer's ring", detail: 'Cabbage-patch teleport (Falador diary)', members: true },
      { name: 'Ring of wealth', detail: 'Rub → GE → run south-west', members: true },
    ],
  },
  {
    aliases: ['al kharid', 'al kharid palace', 'hassan', 'gem trader', 'shantay pass'],
    displayName: 'Al Kharid',
    methods: [
      { name: 'Al Kharid lodestone', detail: 'Teleport into Al Kharid' },
      { name: 'Amulet of glory', detail: 'Rub → Al Kharid', members: true },
      { name: 'Ring of dueling', detail: 'Rub → Duel Arena (north of Al Kharid)', members: true },
      { name: 'Lumbridge lodestone', detail: 'Walk east across the bridge (~1 min)' },
    ],
  },
  {
    aliases: ['port sarim', 'redbeard frank', 'betty', "betty's magic emporium"],
    displayName: 'Port Sarim',
    methods: [
      { name: 'Port Sarim lodestone', detail: 'Teleport into Port Sarim docks' },
      { name: 'Amulet of glory', detail: 'Rub → Draynor → run south', members: true },
      { name: "Explorer's ring", detail: 'Cabbage-port → run south to Port Sarim', members: true },
      { name: 'Charter ship', detail: 'Sail from any charter port', members: true },
    ],
  },
  {
    aliases: ['ardougne', 'ardougne market', 'ardougne zoo', 'west ardougne', 'east ardougne'],
    displayName: 'Ardougne',
    methods: [
      { name: 'Ardougne lodestone', detail: 'Teleport into East Ardougne' },
      { name: 'Ardougne Teleport', detail: 'Standard spellbook (51 Magic)', members: true },
      { name: 'Fairy ring B·L·R', detail: "Legends' Guild area → walk south", members: true },
      { name: 'Combat bracelet', detail: "Rub → Warriors' Guild → fairy ring", members: true },
    ],
  },
  {
    aliases: ['catherby', "seers' village", 'seers village', 'seers', 'camelot', 'camelot castle'],
    displayName: 'Catherby / Seers\' Village',
    methods: [
      { name: "Seers' Village lodestone", detail: 'Teleport into Seers\' Village' },
      { name: 'Camelot Teleport', detail: 'Standard spellbook (45 Magic)', members: true },
      { name: 'Fairy ring C·K·S', detail: 'Catherby area', members: true },
      { name: 'Charter ship', detail: 'Catherby docks', members: true },
    ],
  },
  {
    aliases: ['canifis', 'morytania', 'werewolf'],
    displayName: 'Canifis',
    methods: [
      { name: 'Canifis lodestone', detail: 'Teleport (after Priest in Peril)', members: true },
      { name: 'Fairy ring C·K·R', detail: 'South of Canifis', members: true },
      { name: 'Ectophial', detail: 'Rub → Port Phasmatys → walk south', members: true },
      { name: 'Lodestone', detail: 'Varrock → walk east through Digsite', members: true },
    ],
  },
  {
    aliases: ['taverley', 'druidic circle', 'kaqemeex', 'herblore habitat'],
    displayName: 'Taverley',
    methods: [
      { name: 'Taverley lodestone', detail: 'Teleport into Taverley' },
      { name: 'Balloon transport', detail: 'Castle Wars → Taverley (Enlightened Journey)', members: true },
      { name: 'Falador lodestone', detail: 'Walk north-west from Falador' },
      { name: 'Games necklace', detail: 'Burthorpe → walk west', members: true },
    ],
  },
  {
    aliases: ['burthorpe', "warriors' guild", 'warriors guild', 'death plateau', 'tenzing'],
    displayName: 'Burthorpe',
    methods: [
      { name: 'Burthorpe lodestone', detail: 'Teleport into Burthorpe' },
      { name: 'Combat bracelet', detail: "Rub → Warriors' Guild", members: true },
      { name: 'Games necklace', detail: 'Rub → Burthorpe', members: true },
      { name: 'Max guild', detail: 'Max cape teleport → run south', members: true },
    ],
  },
  {
    aliases: ['rellekka', 'fremennik', 'brundt', 'brundt the chieftain'],
    displayName: 'Rellekka',
    methods: [
      { name: 'Rellekka lodestone', detail: 'Teleport into Rellekka', members: true },
      { name: 'Enchanted lyre', detail: 'Play lyre → Rellekka (Fremennik Trials)', members: true },
      { name: 'Fairy ring A·J·R', detail: 'Near Rellekka slayer cave', members: true },
      { name: 'Fremennik sea boots', detail: 'Diary reward teleport to Waterbirth', members: true },
    ],
  },
  {
    aliases: ['tree gnome stronghold', 'grand tree', 'gnome stronghold', 'king narnode', 'glough'],
    displayName: 'Tree Gnome Stronghold',
    methods: [
      { name: 'Spirit tree', detail: 'Any spirit tree → Grand Tree', members: true },
      { name: 'Gnome glider', detail: 'Grand Tree glider network', members: true },
      { name: 'Fairy ring A·J·R', detail: 'Walk to stronghold entrance', members: true },
      { name: 'Slayer ring', detail: 'Rub → Stronghold Slayer Cave', members: true },
    ],
  },
  {
    aliases: ['karamja', 'musa point', 'brimhaven', 'shipyard', 'karamja volcano'],
    displayName: 'Karamja',
    methods: [
      { name: 'Karamja lodestone', detail: 'Teleport north of Brimhaven', members: true },
      { name: 'Amulet of glory', detail: 'Rub → Karamja', members: true },
      { name: 'Charter ship', detail: 'Port Sarim → Musa Point', members: true },
      { name: 'Ring of dueling', detail: 'Castle Wars → charter to Karamja', members: true },
    ],
  },
  {
    aliases: ['fairy ring', 'fairy rings', 'fairy ring network', 'fairy ring code'],
    displayName: 'Fairy rings',
    methods: [
      { name: 'Dramen/Lunar staff', detail: 'Equip staff before using any fairy ring', members: true },
      { name: 'Fairy ring B·K·P', detail: 'Zanaris hub (after Lost City)', members: true },
      { name: 'Fairy ring D·K·R', detail: 'South of Draynor Village', members: true },
      { name: 'Slayer ring', detail: 'Rub → Fremennik Slayer Dungeon → fairy ring', members: true },
    ],
  },
  {
    aliases: ['zanaris', 'lost city', 'fairy queen', 'fairy godfather'],
    displayName: 'Zanaris',
    methods: [
      { name: 'Fairy ring B·K·P', detail: 'Any fairy ring → Zanaris (after Lost City)', members: true },
      { name: 'Lumbridge swamp shed', detail: 'Enter with Dramen/Lunar staff equipped', members: true },
      { name: 'Slayer ring', detail: 'Rub → Fremennik Slayer Dungeon → fairy ring', members: true },
    ],
  },
  {
    aliases: ['wizards tower', "wizards' tower", 'sedridor', 'ariane'],
    displayName: "Wizards' Tower",
    methods: [
      { name: 'Necklace of passage', detail: "Rub → Wizards' Tower (outside, fastest)", members: true },
      { name: 'Draynor lodestone', detail: 'Walk south to the tower' },
      { name: 'Amulet of glory', detail: 'Rub → Draynor → walk south', members: true },
    ],
  },
  {
    aliases: ['edgeville', 'edgeville bank', 'edgeville dungeon'],
    displayName: 'Edgeville',
    methods: [
      { name: 'Edgeville lodestone', detail: 'Teleport into Edgeville' },
      { name: 'Amulet of glory', detail: 'Rub → Edgeville', members: true },
      { name: 'Canoe', detail: 'Lumbridge canoe → Edgeville (Barfy Bill)', members: true },
      { name: 'Archaeology journal', detail: 'Dig site teleport → run north', members: true },
    ],
  },
  {
    aliases: ['port phasmatys', 'phasmatys', 'ectofuntus'],
    displayName: 'Port Phasmatys',
    methods: [
      { name: 'Ectophial', detail: 'Rub → Ectofuntus (fastest)', members: true },
      { name: 'Fairy ring A·L·Q', detail: 'Lighthouse → walk south', members: true },
      { name: 'Canifis lodestone', detail: 'Walk east through Mort Myre', members: true },
    ],
  },
  {
    aliases: ['prifddinas', 'prif', 'elf city'],
    displayName: 'Prifddinas',
    methods: [
      { name: 'Prifddinas lodestone', detail: "After Plague's End", members: true },
      { name: 'Crystal teleport seed', detail: 'Teleport to Prifddinas', members: true },
      { name: 'Spirit tree', detail: 'Prifddinas spirit tree', members: true },
    ],
  },
];

// ─── Lookup ───────────────────────────────────────────────────────────────────

export interface TravelHint {
  location: string;
  methods: TravelMethod[];
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9'\s·]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function extractWikiLinks(wikitext: string): string[] {
  const links: string[] = [];
  const regex = /\[\[(?:[^|\]#]+\|)?([^\]]+)\]\]/g;
  let match;
  while ((match = regex.exec(wikitext)) !== null) {
    links.push(match[1].trim());
  }
  return links;
}

function scoreMatch(text: string, alias: string): number {
  const norm = normalize(text);
  const normAlias = normalize(alias);
  if (norm === normAlias) return 100;
  if (norm.includes(normAlias)) return normAlias.length;
  const words = normAlias.split(' ').filter((w) => w.length > 2);
  if (words.length >= 2 && words.every((w) => norm.includes(w))) return normAlias.length - 1;
  return 0;
}

function findBestLocation(searchTexts: string[]): LocationEntry | null {
  let best: LocationEntry | null = null;
  let bestScore = 0;
  for (const entry of TRAVEL_HINTS_DB) {
    for (const alias of entry.aliases) {
      for (const text of searchTexts) {
        const score = scoreMatch(text, alias);
        if (score > bestScore) {
          bestScore = score;
          best = entry;
        }
      }
    }
  }
  return bestScore >= 4 ? best : null;
}

/** Extract "in/to/at Location" patterns as fallback */
function extractLocationFromText(text: string): string | null {
  const patterns = [
    /(?:in|to|at|near|from)\s+(?:the\s+)?([A-Z][a-z]+(?:\s+[A-Z]?[a-z]+){0,3})/g,
    /(?:talk to|speak to|find|visit|go to)\s+[^.]+?\s+(?:in|at)\s+([A-Z][^.,]+)/i,
  ];
  for (const pat of patterns) {
    const m = pat.exec(text);
    if (m?.[1] && m[1].length > 4) return m[1].trim();
  }
  return null;
}

/**
 * Returns travel hints for a quest step. Always returns at least one hint block.
 */
export function getTravelHints(stepText: string, wikiLinks: string[] = []): TravelHint[] {
  const searchTexts = [stepText, ...wikiLinks];
  const loc = findBestLocation(searchTexts);

  if (loc) {
    return [{ location: loc.displayName, methods: loc.methods.slice(0, 4) }];
  }

  // Try wiki links individually
  for (const link of wikiLinks) {
    const linkLoc = findBestLocation([link]);
    if (linkLoc) {
      return [{ location: linkLoc.displayName, methods: linkLoc.methods.slice(0, 4) }];
    }
  }

  // Fallback: extract place name from prose
  const extracted = extractLocationFromText(stepText);
  if (extracted) {
    const extractedLoc = findBestLocation([extracted]);
    if (extractedLoc) {
      return [{ location: extractedLoc.displayName, methods: extractedLoc.methods.slice(0, 4) }];
    }
  }

  // Universal fallback — every step gets a route hint
  return [
    {
      location: extracted ?? 'Destination',
      methods: [
        { name: 'Nearest lodestone', detail: 'Teleport to closest unlocked lodestone' },
        { name: 'Home Teleport', detail: 'Then run from Lumbridge' },
        { name: 'Jewellery teleports', detail: 'Glory, ring of wealth, games necklace, etc.', members: true },
        { name: 'Fairy ring', detail: 'Use fairy ring network if unlocked', members: true },
      ],
    },
  ];
}
