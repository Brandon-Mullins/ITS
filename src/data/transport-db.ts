export interface TravelMethod {
  name: string;
  detail: string;
  members?: boolean;
}

export interface LocationTransport {
  /** All names that match this location (lowercase) */
  aliases: string[];
  displayName: string;
  methods: TravelMethod[];
}

/**
 * Curated RS3 transport options for common quest locations.
 * Ordered fastest-first within each location.
 */
export const TRANSPORT_DB: LocationTransport[] = [
  {
    aliases: ['draynor village', 'draynor', 'martin the master gardener', 'martin'],
    displayName: 'Draynor Village',
    methods: [
      { name: 'Lodestone', detail: 'Teleport to Draynor Village lodestone' },
      { name: 'Amulet of glory', detail: 'Rub → Draynor (right in village)', members: true },
      { name: 'Fairy ring DKR', detail: 'South of village, short walk north', members: true },
      { name: 'Walk from Lumbridge', detail: 'Head west past the cow field (~1 min)' },
    ],
  },
  {
    aliases: ['lumbridge', 'lumbridge castle', 'cook (lumbridge)', 'father aereck', 'lumbridge church'],
    displayName: 'Lumbridge',
    methods: [
      { name: 'Lodestone', detail: 'Teleport to Lumbridge lodestone' },
      { name: 'Home Teleport', detail: 'Lumbridge is the default spawn' },
      { name: 'Combat bracelet', detail: 'Rub → Warriors\' Guild, canoe to Lumbridge', members: true },
    ],
  },
  {
    aliases: ['varrock', 'varrock palace', 'varrock square', 'gypsy aris', 'relado', 'reldo'],
    displayName: 'Varrock',
    methods: [
      { name: 'Lodestone', detail: 'Teleport to Varrock lodestone' },
      { name: 'Varrock Teleport', detail: 'Standard spellbook (level 25 Magic)', members: true },
      { name: 'Chronicle', detail: 'Use Chronicle book (Diango\'s Toy Store)', members: true },
      { name: 'Combat bracelet', detail: 'Rub → Warriors\' Guild, walk east', members: true },
    ],
  },
  {
    aliases: ['falador', 'falador park', 'white knights castle', 'squire asrol', 'party room'],
    displayName: 'Falador',
    methods: [
      { name: 'Lodestone', detail: 'Teleport to Falador lodestone' },
      { name: 'Falador Teleport', detail: 'Standard spellbook (level 37 Magic)', members: true },
      { name: 'Ring of wealth', detail: 'Grand Exchange → walk south-west', members: true },
      { name: 'Explorer\'s ring', detail: 'Cabbage patch teleport (Falador diary)', members: true },
    ],
  },
  {
    aliases: ['al kharid', 'al kharid palace', 'hassan', 'gem trader', 'shantay pass'],
    displayName: 'Al Kharid',
    methods: [
      { name: 'Lodestone', detail: 'Teleport to Al Kharid lodestone' },
      { name: 'Amulet of glory', detail: 'Rub → Al Kharid', members: true },
      { name: 'Ring of dueling', detail: 'Rub → Duel Arena (north of Al Kharid)', members: true },
      { name: 'Walk from Lumbridge', detail: 'Cross the bridge east of Lumbridge swamps' },
    ],
  },
  {
    aliases: ['port sarim', 'port sarim jail', 'redbeard frank', 'betty', 'betty\'s magic emporium'],
    displayName: 'Port Sarim',
    methods: [
      { name: 'Lodestone', detail: 'Teleport to Port Sarim lodestone' },
      { name: 'Amulet of glory', detail: 'Rub → Draynor, walk south', members: true },
      { name: 'Explorer\'s ring', detail: 'Cabbage patch teleport, walk south', members: true },
      { name: 'Ship from Ardougne', detail: 'Captain Barnabus (members)' },
    ],
  },
  {
    aliases: ['ardougne', 'ardougne market', 'ardougne zoo', 'west ardougne', 'east ardougne'],
    displayName: 'Ardougne',
    methods: [
      { name: 'Lodestone', detail: 'Teleport to Ardougne lodestone' },
      { name: 'Ardougne Teleport', detail: 'Standard spellbook (level 51 Magic)', members: true },
      { name: 'Fairy ring B·L·R', detail: 'Legends\' Guild, walk south', members: true },
      { name: 'Combat bracelet', detail: 'Rub → Warriors\' Guild, fairy ring to Ardougne area', members: true },
    ],
  },
  {
    aliases: ['yanille', 'wizard\'s guild', 'wizards\' guild yanille', 'aleck'],
    displayName: 'Yanille',
    methods: [
      { name: 'Lodestone', detail: 'Teleport to Yanille lodestone' },
      { name: 'Fairy ring C·I·Q', detail: 'North-west of Yanille', members: true },
      { name: 'Watchtower Teleport', detail: 'After Watchtower quest (level 58 Magic)', members: true },
      { name: 'Spirit tree', detail: 'Tree Gnome Village → spirit tree to Battlefield of Khazard', members: true },
    ],
  },
  {
    aliases: ['tree gnome village', 'gnome village', 'king bolren', 'spirit tree gnome village'],
    displayName: 'Tree Gnome Village',
    methods: [
      { name: 'Spirit tree', detail: 'Any spirit tree → Tree Gnome Village', members: true },
      { name: 'Fairy ring C·I·Q', detail: 'Near village entrance', members: true },
      { name: 'Walk from Ardougne', detail: 'South-west through Battlefield of Khazard' },
    ],
  },
  {
    aliases: ['tree gnome stronghold', 'grand tree', 'gnome stronghold', 'king narnode shareen', 'glough'],
    displayName: 'Tree Gnome Stronghold',
    methods: [
      { name: 'Spirit tree', detail: 'Any spirit tree → Grand Tree', members: true },
      { name: 'Gnome glider', detail: 'From Grand Tree (after The Grand Tree quest)', members: true },
      { name: 'Fairy ring A·J·R', detail: 'Slayer cave area, walk to stronghold', members: true },
    ],
  },
  {
    aliases: ['camelot', 'camelot castle', 'king arthur', 'catherby', 'seers\' village', 'seers village', 'seers'],
    displayName: 'Seers\' Village / Catherby',
    methods: [
      { name: 'Lodestone', detail: 'Teleport to Seers\' Village lodestone' },
      { name: 'Camelot Teleport', detail: 'Standard spellbook (level 45 Magic)', members: true },
      { name: 'Combat bracelet', detail: 'Rub → Warriors\' Guild, fairy ring to CKS (Catherby)', members: true },
      { name: 'Charter ship', detail: 'Catherby docks (members)' },
    ],
  },
  {
    aliases: ['burthorpe', 'warriors\' guild', 'warriors guild', 'death plateau'],
    displayName: 'Burthorpe',
    methods: [
      { name: 'Lodestone', detail: 'Teleport to Burthorpe lodestone' },
      { name: 'Combat bracelet', detail: 'Rub → Warriors\' Guild', members: true },
      { name: 'Games necklace', detail: 'Rub → Burthorpe', members: true },
      { name: 'Falador Teleport', detail: 'Walk north from Falador (~2 min)', members: true },
    ],
  },
  {
    aliases: ['taverley', 'druidic circle', 'kaqemeex', 'herblore habitat'],
    displayName: 'Taverley',
    methods: [
      { name: 'Lodestone', detail: 'Teleport to Taverley lodestone' },
      { name: 'Balloon transport', detail: 'Castle Wars → Taverley (after Enlightened Journey)', members: true },
      { name: 'Falador Teleport', detail: 'Walk north-west from Falador', members: true },
    ],
  },
  {
    aliases: ['edgeville', 'edgeville bank', 'edgeville dungeon', 'oryph'],
    displayName: 'Edgeville',
    methods: [
      { name: 'Lodestone', detail: 'Teleport to Edgeville lodestone' },
      { name: 'Amulet of glory', detail: 'Rub → Edgeville', members: true },
      { name: 'Combat bracelet', detail: 'Rub → Warriors\' Guild, walk south', members: true },
      { name: 'Canoe', detail: 'From Lumbridge to Edgeville (Barfy Bill)', members: true },
    ],
  },
  {
    aliases: ['barbarian village', 'gunnarsgrunn', 'barbarian outpost'],
    displayName: 'Barbarian Village',
    methods: [
      { name: 'Lodestone', detail: 'Teleport to Edgeville, walk south' },
      { name: 'Amulet of glory', detail: 'Rub → Edgeville, walk south', members: true },
      { name: 'Skull sceptre', detail: 'Teleport to Barbarian Village (Stronghold of Security)', members: true },
    ],
  },
  {
    aliases: ['rimmington', 'hetty', 'witch\'s house rimmington'],
    displayName: 'Rimmington',
    methods: [
      { name: 'Lodestone', detail: 'Teleport to Port Sarim, walk west' },
      { name: 'Amulet of glory', detail: 'Rub → Draynor, walk far south-west', members: true },
      { name: 'House Teleport', detail: 'Teleport to POH in Rimmington (if set)', members: true },
    ],
  },
  {
    aliases: ['wizards\' tower', 'wizards tower', 'wizard\'s tower', 'sedridor', 'ariane'],
    displayName: 'Wizards\' Tower',
    methods: [
      { name: 'Necklace of passage', detail: 'Rub → Wizards\' Tower (OUTSIDE, fastest)', members: true },
      { name: 'Amulet of glory', detail: 'Rub → Draynor, walk south to tower', members: true },
      { name: 'Lodestone', detail: 'Draynor lodestone, walk south' },
    ],
  },
  {
    aliases: ['digsite', 'dig site', 'exam centre', 'archaeological expert'],
    displayName: 'Digsite',
    methods: [
      { name: 'Digsite pendant', detail: 'Rub → Digsite (fastest)', members: true },
      { name: 'Lodestone', detail: 'Varrock lodestone, walk east' },
      { name: 'Ring of dueling', detail: 'Duel Arena → walk south-east', members: true },
    ],
  },
  {
    aliases: ['canifis', 'morytania', 'werewolf', 'canifis bank'],
    displayName: 'Canifis',
    methods: [
      { name: 'Lodestone', detail: 'Teleport to Canifis lodestone (after Priest in Peril)', members: true },
      { name: 'Fairy ring C·K·R', detail: 'South of Canifis', members: true },
      { name: 'Ectophial', detail: 'Empty and recharge at Ectofuntus, walk south', members: true },
      { name: 'Walk from Varrock', detail: 'Through Digsite to Senntisten temple' },
    ],
  },
  {
    aliases: ['mort\'ton', 'mortton', 'burgh de rott', 'burgh de rott'],
    displayName: 'Mort\'ton / Burgh de Rott',
    methods: [
      { name: 'Lodestone', detail: 'Canifis lodestone, walk south', members: true },
      { name: 'Fairy ring B·K·R', detail: 'Mort Myre swamp', members: true },
      { name: 'Ectophial', detail: 'Walk south-west from Port Phasmatys', members: true },
    ],
  },
  {
    aliases: ['port phasmatys', 'phasmatys', 'ectofuntus', 'ghost ahoy', 'necrovarus'],
    displayName: 'Port Phasmatys',
    methods: [
      { name: 'Ectophial', detail: 'Rub → Ectofuntus (fastest)', members: true },
      { name: 'Fairy ring A·L·Q', detail: 'Lighthouse, walk south', members: true },
      { name: 'Lodestone', detail: 'Canifis lodestone, walk east through swamp', members: true },
    ],
  },
  {
    aliases: ['karamja', 'musa point', 'brimhaven', 'shipyard', 'karamja volcano'],
    displayName: 'Karamja',
    methods: [
      { name: 'Lodestone', detail: 'Teleport to Karamja lodestone (north of Brimhaven)', members: true },
      { name: 'Charter ship', detail: 'Port Sarim → Karamja (Musa Point)', members: true },
      { name: 'Ring of dueling', detail: 'Castle Wars → walk south to charter', members: true },
      { name: 'Amulet of glory', detail: 'Rub → Karamja', members: true },
    ],
  },
  {
    aliases: ['shilo village', 'shilo', 'karamja jungle'],
    displayName: 'Shilo Village',
    methods: [
      { name: 'Fairy ring C·K·R', detail: 'Near Shilo Village (after Shilo Village quest)', members: true },
      { name: 'Lodestone', detail: 'Karamja lodestone, walk south through jungle', members: true },
      { name: 'Charter ship', detail: 'To Brimhaven/Cairn Isle, walk east', members: true },
    ],
  },
  {
    aliases: ['ape atoll', 'marim', 'monkey madness', 'awowogei'],
    displayName: 'Ape Atoll',
    methods: [
      { name: 'Greegree', detail: 'Equip small/medium/large ninja Greegree + Amulet of glory to Karamja, enter cave', members: true },
      { name: 'Fairy ring D·L·R', detail: 'Near entrance to Ape Atoll dungeon', members: true },
    ],
  },
  {
    aliases: ['desert', 'pollnivneach', 'sophanem', 'menaphos', 'al kharid gate'],
    displayName: 'Desert (Pollnivneach / Menaphos)',
    methods: [
      { name: 'Lodestone', detail: 'Pollnivneach or Menaphos lodestone', members: true },
      { name: 'Magic carpet', detail: 'From Shantay Pass or Pollnivneach', members: true },
      { name: 'Amulet of glory', detail: 'Rub → Al Kharid, walk south through Shantay Pass', members: true },
    ],
  },
  {
    aliases: ['prifddinas', 'prif', 'elf city', 'prifddinas gates'],
    displayName: 'Prifddinas',
    methods: [
      { name: 'Lodestone', detail: 'Prifddinas lodestone (after Plague\'s End)', members: true },
      { name: 'Crystal teleport', detail: 'Crystal teleport seed to Prifddinas', members: true },
      { name: 'Spirit tree', detail: 'Prifddinas spirit tree (after Mourning\'s End Part II)', members: true },
    ],
  },
  {
    aliases: ['grand exchange', 'ge', 'varrock ge'],
    displayName: 'Grand Exchange',
    methods: [
      { name: 'Ring of wealth', detail: 'Rub → Grand Exchange (fastest)', members: true },
      { name: 'Lodestone', detail: 'Varrock lodestone, walk north' },
      { name: 'Varrock Teleport', detail: 'Walk north to GE', members: true },
    ],
  },
  {
    aliases: ['wilderness', 'chaos temple wilderness', 'mage bank', 'mage arena', 'ferox enclave'],
    displayName: 'Wilderness',
    methods: [
      { name: 'Wilderness sword', detail: 'Teleport to Wilderness obelisks (diary reward)', members: true },
      { name: 'Games necklace', detail: 'Rub → Corporeal Beast (Wilderness)', members: true },
      { name: 'Lodestone', detail: 'Edgeville lodestone, walk north', members: true },
      { name: 'Canoe', detail: 'Edgeville canoe → Wilderness pond', members: true },
    ],
  },
  {
    aliases: ['entrana', 'entrana church', 'dramen tree'],
    displayName: 'Entrana',
    methods: [
      { name: 'Ship from Port Sarim', detail: 'Monks\' ferry (no weapons/armour allowed)' },
      { name: 'Lodestone', detail: 'Port Sarim lodestone, walk to docks' },
    ],
  },
  {
    aliases: ['crandor', 'elvarg', 'crandor island'],
    displayName: 'Crandor',
    methods: [
      { name: 'Ship from Karamja', detail: 'After Dragon Slayer — Captain Ned in Port Sarim or Karamja' },
      { name: 'Charter ship', detail: 'To Karamja, use hidden ship', members: true },
    ],
  },
  {
    aliases: ['zanaris', 'lost city', 'fairy queen', 'fairy godfather'],
    displayName: 'Zanaris (Lost City)',
    methods: [
      { name: 'Fairy ring', detail: 'Any fairy ring → B·K·P (Zanaris)', members: true },
      { name: 'Lumbridge swamp shed', detail: 'Enter shed with Dramen/Lunar staff equipped', members: true },
    ],
  },
  {
    aliases: ['god wars dungeon', 'gwd', 'bandos', 'armadyl', 'zaros'],
    displayName: 'God Wars Dungeon',
    methods: [
      { name: 'Fairy ring B·J·P', detail: 'Near GWD entrance (Wilderness edge)', members: true },
      { name: 'Games necklace', detail: 'Rub → Tears of Guthix, walk north', members: true },
      { name: 'Spirit tree', detail: 'Tree Gnome Stronghold → walk to Agility shortcut', members: true },
    ],
  },
  {
    aliases: ['fremennik', 'rellekka', 'fremennik province', 'brundt', 'brundt the chieftain'],
    displayName: 'Rellekka (Fremennik)',
    methods: [
      { name: 'Lodestone', detail: 'Teleport to Rellekka lodestone', members: true },
      { name: 'Fremennik sea boots', detail: 'Teleport to Waterbirth Island (diary)', members: true },
      { name: 'Enchanted lyre', detail: 'Play lyre → Rellekka (Fremennik Trials reward)', members: true },
      { name: 'Fairy ring A·J·R', detail: 'Near Rellekka slayer cave', members: true },
    ],
  },
  {
    aliases: ['waterbirth island', 'waterbirth', 'dks', 'dagannoth kings'],
    displayName: 'Waterbirth Island',
    methods: [
      { name: 'Fremennik sea boots', detail: 'Right-click boots → Waterbirth Island', members: true },
      { name: 'Enchanted lyre', detail: 'Play lyre → Waterbirth (after Fremennik Trials)', members: true },
      { name: 'Rellekka ship', detail: 'Jarvald\'s ship from Rellekka docks', members: true },
    ],
  },
  {
    aliases: ['trollheim', 'trollweiss mountain', 'troll stronghold', 'dad', 'eirik'],
    displayName: 'Trollheim',
    methods: [
      { name: 'Trollheim Teleport', detail: 'Standard spellbook (after Eadgar\'s Ruse quest)', members: true },
      { name: 'Stony basalt', detail: 'Teleport to Trollheim (My Arm\'s Big Adventure)', members: true },
      { name: 'Walk from Burthorpe', detail: 'Through Trollheim tunnel (Death Plateau quest)', members: true },
    ],
  },
  {
    aliases: ['death plateau', 'trollheim tunnel', 'tenzing'],
    displayName: 'Death Plateau / Burthorpe Trolls',
    methods: [
      { name: 'Lodestone', detail: 'Burthorpe lodestone' },
      { name: 'Combat bracelet', detail: 'Rub → Warriors\' Guild (Burthorpe)', members: true },
      { name: 'Games necklace', detail: 'Rub → Burthorpe', members: true },
    ],
  },
  {
    aliases: ['observatory', 'observatory professor'],
    displayName: 'Observatory',
    methods: [
      { name: 'Lodestone', detail: 'Ardougne lodestone, walk south-west' },
      { name: 'Combat bracelet', detail: 'Rub → Warriors\' Guild, walk south', members: true },
      { name: 'Fairy ring A·J·R', detail: 'Walk south from slayer cave area', members: true },
    ],
  },
  {
    aliases: ['mort myre', 'mort myre swamp', 'nature spirit', 'filliman'],
    displayName: 'Mort Myre Swamp',
    methods: [
      { name: 'Fairy ring B·K·R', detail: 'Inside Mort Myre swamp', members: true },
      { name: 'Ectophial', detail: 'Walk south from Port Phasmatys', members: true },
      { name: 'Canifis lodestone', detail: 'Walk south into swamp', members: true },
    ],
  },
  {
    aliases: ['castle wars', 'castlewars'],
    displayName: 'Castle Wars',
    methods: [
      { name: 'Ring of dueling', detail: 'Rub → Castle Wars (fastest)', members: true },
      { name: 'Lodestone', detail: 'Falador lodestone, walk south' },
    ],
  },
  {
    aliases: ['sophanem', 'menaphos', 'osman', 'emir'],
    displayName: 'Menaphos / Sophanem',
    methods: [
      { name: 'Lodestone', detail: 'Menaphos or Sophanem lodestone', members: true },
      { name: 'Magic carpet', detail: 'From Pollnivneach', members: true },
      { name: 'Pharaoh\'s sceptre', detail: 'Jalsavrah teleport (Pyramid Plunder)', members: true },
    ],
  },
  {
    aliases: ['piscatoris', 'piscatoris fishing colony', 'larry'],
    displayName: 'Piscatoris',
    methods: [
      { name: 'Eagle transport', detail: 'Eagles\' Peak quest — use eagle to Piscatoris', members: true },
      { name: 'Fairy ring A·K·Q', detail: 'Near Piscatoris Hunter area', members: true },
      { name: 'Lodestone', detail: 'Rellekka lodestone, walk north-west (long walk)', members: true },
    ],
  },
  {
    aliases: ['nardah', 'desert city nardah'],
    displayName: 'Nardah',
    methods: [
      { name: 'Lodestone', detail: 'Nardah lodestone', members: true },
      { name: 'Magic carpet', detail: 'From Pollnivneach or Shantay Pass', members: true },
      { name: 'Pharaoh\'s sceptre', detail: 'Jaleustrophos teleport', members: true },
    ],
  },
  {
    aliases: ['sorceress\'s garden', 'sorceress garden', 'sorceress'],
    displayName: 'Sorceress\'s Garden (Al Kharid)',
    methods: [
      { name: 'Lodestone', detail: 'Al Kharid lodestone, enter house south of gem trader' },
      { name: 'Amulet of glory', detail: 'Rub → Al Kharid', members: true },
    ],
  },
];
