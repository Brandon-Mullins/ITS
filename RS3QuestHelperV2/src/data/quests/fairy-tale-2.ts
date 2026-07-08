import type { StructuredQuestDefinition } from '../../types/quest-data';
import { questStep, MARTIN_CANT_FIND, MARTIN_HOW_TO, MARTIN_LOST } from './helpers';
import { ROUTES } from './routes';

const STAFF = 'Dramen staff or Lunar staff';

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
    STAFF,
  ],
  recommendedItems: ['Food', 'Antipoison', 'Combat gear', 'Super restore potions'],
  enemies: ['Gorak (level 74)'],
  rewards: ['2 Quest points', '3,500 Farming XP', '2,500 Herblore XP', '3,500 Thieving XP', 'Antique lamp'],
  unlocks: ['Fairy ring network', 'Magic essence potion recipe', 'Fairy Resistance Hideout'],
  itemBrain: {
    required: ['Vial of water', 'Pestle and mortar', 'Logs', STAFF],
    recommended: ['Food', 'Antipoison', 'Combat gear'],
    obtainableDuring: ['Nuff\'s certificate', 'Queen\'s secateurs', 'Starflower', 'Gorak claw'],
    consumed: ['Vial of water', 'Logs', 'Magic essence potion (1 dose)'],
    kept: [STAFF, 'Pestle and mortar', 'Nuff\'s certificate (until hideout travel)'],
    geBuyable: ['Vial of water', 'Pestle and mortar', 'Logs'],
    ironmanNotes: {
      'Vial of water': 'Fill at any fountain before starting — needed for starflower + gorak claw potion.',
      'Pestle and mortar': 'Buy from Herblore shop or GE — grind gorak claw during quest.',
      'Logs': 'Chop any tree or buy from GE — not always needed if you have other firemaking.',
      [STAFF]: 'From Lost City quest — MUST equip to use fairy rings and enter Zanaris.',
    },
  },
  steps: [
    // ── PHASE 1: MARTIN / DRAYNOR ──────────────────────────────────────────
    questStep('ft2-01-start', 'Talk to Martin the Master Gardener to start the quest.', {
      objective: 'Talk to Martin the Master Gardener',
      location: 'Draynor Village',
      locationDetail: 'Draynor Village market, near the farming patch and market stalls.',
      npc: 'Martin the Master Gardener',
      travelRoutes: ROUTES.draynorVillage(),
      dialogueOptions: [
        'Talk about farming problems and fairies.',
        'Accept quest — "I\'ll come back after your crops grow."',
      ],
      howToGetThere: MARTIN_HOW_TO,
      cantFindNpc: MARTIN_CANT_FIND,
      lostHelp: MARTIN_LOST,
      markers: {
        npc: 'Martin the Master Gardener',
        area: 'Draynor Village market',
        tile: { x: 3080, y: 3257, plane: 0 },
        minimapHint: 'Martin — farming patch area',
        worldMapHint: 'Draynor Village market',
      },
      completionChecks: {
        questJournalContains: ['crops', 'grow', 'Martin'],
      },
    }),

    questStep('ft2-02-wait', 'Wait ~5 minutes for Martin\'s crops to grow, then talk to him again.', {
      objective: 'Wait, then talk to Martin again',
      location: 'Draynor Village',
      npc: 'Martin the Master Gardener',
      waitNote: 'Wait about 5 minutes. Your quest journal will update when crops have had time to grow. Pickpocketing Martin may delay this.',
      travelRoutes: ROUTES.draynorVillage(),
      dialogueOptions: [
        '"So, have your vegetables grown yet?" (if too early)',
        '"Hello, Martin..." (after 5 minutes)',
      ],
      howToGetThere: MARTIN_HOW_TO,
      cantFindNpc: MARTIN_CANT_FIND,
      lostHelp: MARTIN_LOST,
      completionChecks: {
        chatContains: ['Martin', 'crops', 'angry'],
        questJournalContains: ['investigate', 'failing'],
      },
    }),

    questStep('ft2-03-investigate', 'Agree to investigate the crop problem and travel to Zanaris.', {
      objective: 'Agree to investigate — go to Zanaris',
      location: 'Draynor Village → Zanaris',
      npc: 'Martin the Master Gardener',
      requiredItems: [STAFF],
      areaWarning: 'Equip Dramen or Lunar staff BEFORE using any fairy ring or entering Zanaris.',
      dialogueOptions: [
        'Continue Martin\'s dialogue until you agree to investigate.',
      ],
      howToGetThere: {
        location: 'Finish talking to Martin, then travel to Zanaris.',
        fastestRoute: 'Equip staff → use fairy ring (any code to Zanaris) or enter Zanaris shed in Lumbridge swamp.',
        alternativeRoute: 'Fairy ring B·K·P from anywhere → Zanaris hub.',
        ifLost: 'Zanaris is accessed via the shed in Lumbridge Swamp (Lost City) or any fairy ring with staff equipped.',
      },
      lostHelp: {
        summary: 'Finish Martin\'s dialogue, then head to Zanaris to investigate.',
        whereIsIt: 'Zanaris (Lost City) — enter via Lumbridge swamp shed or fairy ring with staff equipped.',
        nearestTeleport: 'Lumbridge lodestone → run south to swamp shed',
        directionToRun: 'South from Lumbridge into swamp, enter the shed with staff equipped.',
        whatItLooksLike: 'Giant mushroom city. Bank is central; Fairy Nuff\'s house is north of bank.',
        commonMistakes: ['Forgetting to equip Dramen/Lunar staff — rings won\'t work.', 'Going to Draynor Manor instead of finishing Martin dialogue.'],
        fallbackRoute: 'World map → Lumbridge Swamp → enter Zanaris shed (requires staff).',
      },
      completionChecks: {
        questJournalContains: ['Zanaris', 'investigate'],
      },
    }),

    // ── PHASE 2: FAIRY NUFF'S HOUSE ───────────────────────────────────────
    questStep('ft2-04-nuff-house', 'Go to Fairy Nuff\'s house north of the Zanaris bank.', {
      objective: 'Enter Fairy Nuff\'s grotto (north of bank)',
      location: 'Zanaris',
      locationDetail: 'Fairy Nuff\'s house — just north of the Zanaris bank.',
      requiredItems: [STAFF],
      travelRoutes: ROUTES.zanaris(),
      areaWarning: 'Keep Dramen/Lunar staff equipped in Zanaris.',
      howToGetThere: {
        location: 'North of Zanaris bank — walk north from bank area.',
        fastestRoute: 'Zanaris fairy ring B·K·P → run north from bank.',
        ifLost: 'From Zanaris entrance, run north past the bank. Nuff\'s grotto is the house directly north of bank.',
      },
      lostHelp: {
        summary: 'Find Fairy Nuff\'s trashed house north of the Zanaris bank.',
        whereIsIt: 'Directly north of the Zanaris bank — enter the grotto.',
        nearestTeleport: 'Zanaris fairy ring (B·K·P)',
        directionToRun: 'From bank, run north into the grotto.',
        whatItLooksLike: 'Fairy house interior — trashed, potion shelves, broken vials.',
        commonMistakes: ['Searching south near Godfather instead of north of bank.', 'Not entering the house — walk through the door.'],
        fallbackRoute: 'Zanaris bank → face north → enter first house/grotto.',
      },
      completionChecks: {
        locationContains: ['Zanaris', 'Nuff'],
        questJournalContains: ['Nuff', 'trashed', 'house'],
      },
      markers: { area: 'North of Zanaris bank', npc: 'Fairy Nuff' },
    }),

    questStep('ft2-05-certificate', 'Pick up Nuff\'s certificate from under a potion shelf.', {
      objective: 'Take Nuff\'s certificate',
      location: 'Fairy Nuff\'s house, Zanaris',
      object: 'Nuff\'s certificate',
      requiredItems: [STAFF],
      howToGetThere: {
        location: 'Inside Fairy Nuff\'s grotto, north of bank.',
        fastestRoute: 'Already inside from previous step — search potion shelves.',
        ifLost: 'North of Zanaris bank, inside the grotto. Certificate is under a potion shelf.',
      },
      dialogueOptions: ['Click the certificate on the shelf to pick it up.'],
      completionChecks: {
        inventoryContains: ['certificate', 'Nuff'],
        questJournalContains: ['certificate'],
      },
      markers: { object: 'Nuff\'s certificate', area: 'Fairy Nuff\'s house' },
    }),

    questStep('ft2-06-study-cert', 'Study (turn over) Nuff\'s certificate to reveal fairy symbols.', {
      objective: 'Study Nuff\'s certificate',
      location: 'Fairy Nuff\'s house, Zanaris',
      requiredItems: ['Nuff\'s certificate', STAFF],
      howToGetThere: {
        location: 'Inventory — right-click Nuff\'s certificate → Study.',
        fastestRoute: 'Open inventory → Study certificate.',
        ifLost: 'You need the certificate in inventory. If lost, search the potion shelf again.',
      },
      dialogueOptions: ['Right-click certificate → Study / Turn over.'],
      puzzleHints: ['Back of certificate has strange fairy symbols — you must decode these later.'],
      completionChecks: {
        questJournalContains: ['symbols', 'certificate', 'back'],
      },
    }),

    questStep('ft2-07-fairy-chef', 'Show the certificate to the Fairy Chef (south of bank).', {
      objective: 'Talk to Fairy Chef about the symbols',
      location: 'Zanaris — south of bank',
      npc: 'Fairy Chef',
      requiredItems: ['Nuff\'s certificate', STAFF],
      useOn: { item: 'Nuff\'s certificate', target: 'Fairy Chef' },
      dialogueOptions: [
        'Use certificate on Fairy Chef.',
        'Ask about the strange marks.',
      ],
      dialogueNeedsVerification: true,
      howToGetThere: {
        location: 'South of Zanaris bank — Fairy Chef is in the kitchen area.',
        fastestRoute: 'From bank, run south to find Fairy Chef.',
        ifLost: 'Bank → run south. Chef is near the cooking area south of bank.',
      },
      lostHelp: {
        summary: 'Find the Fairy Chef south of Zanaris bank.',
        whereIsIt: 'South of the bank in Zanaris.',
        nearestTeleport: 'Zanaris B·K·P',
        directionToRun: 'South from bank.',
        whatItLooksLike: 'Fairy NPC in kitchen/cooking area.',
        commonMistakes: ['Talking before studying certificate — study it first.', 'Looking north near Nuff\'s house.'],
        fallbackRoute: 'Bank → south → use certificate on Fairy Chef.',
      },
      puzzleHints: ['Chef mentions similar marks near the Cosmic altar ruins in southern Zanaris.'],
      completionChecks: {
        chatContains: ['Chef', 'cosmic', 'ruins'],
      },
    }),

    questStep('ft2-08-cosmic-sign', 'Find and read the stone tablet south of the Cosmic altar ruins.', {
      objective: 'Read the Cosmic Rune Altar sign',
      location: 'Southern Zanaris — Cosmic ruins',
      object: 'Rune temple sign',
      requiredItems: ['Nuff\'s certificate', STAFF],
      howToGetThere: {
        location: 'South of Zanaris, near the mysterious ruins leading to Cosmic altar.',
        fastestRoute: 'From bank, run south-west toward the cosmic ruins entrance.',
        ifLost: 'Head to southern Zanaris — look for the mysterious ruins (Cosmic altar entrance). Sign is south of it.',
      },
      lostHelp: {
        summary: 'Find the stone tablet near the Cosmic altar ruins in southern Zanaris.',
        whereIsIt: 'South of the mysterious ruins that lead to the Cosmic altar.',
        nearestTeleport: 'Zanaris B·K·P',
        directionToRun: 'South-west from bank toward cosmic ruins, then search south of ruins.',
        whatItLooksLike: 'Small stone tablet with rune symbols — reads "Cosmic Rune Altar".',
        commonMistakes: ['Entering the cosmic altar instead of searching outside.', 'Not reading the tablet — you must read it to proceed.'],
        fallbackRoute: 'Southern Zanaris → cosmic ruins → search south for tablet.',
      },
      puzzleHints: [
        'Sign reads: Cosmic Rune Altar — match symbols to decode certificate.',
        'Decoded message: "AIR, DLR, DJQ, AJS" — fairy ring coordinates to find the hideout.',
      ],
      completionChecks: {
        questJournalContains: ['cosmic', 'tablet', 'AIR', 'DLR'],
      },
      markers: { object: 'Rune temple sign', area: 'Cosmic ruins, Zanaris' },
    }),

    // ── PHASE 3: GODFATHER & FAIRY RINGS ──────────────────────────────────
    questStep('ft2-09-godfather', 'Tell the Fairy Godfather the Queen is missing.', {
      objective: 'Talk to Fairy Godfather',
      location: 'Zanaris — south of entrance',
      npc: 'Fairy Godfather',
      requiredItems: ['Nuff\'s certificate', STAFF],
      dialogueOptions: [
        'Where is the Fairy Queen?',
        'Do you have any idea who could have done this?',
        'Where could she have been taken to?',
        'Show the Godfather the Certificate!',
      ],
      dialogueNeedsVerification: true,
      howToGetThere: {
        location: 'Room directly south of Zanaris entrance, near Chaeldar.',
        fastestRoute: 'From entrance, go south to Godfather\'s room.',
        ifLost: 'Zanaris entrance → south → Godfather\'s throne room near Chaeldar.',
      },
      lostHelp: {
        summary: 'Fairy Godfather is in the room south of Zanaris entrance.',
        whereIsIt: 'South of the main Zanaris entrance, near Chaeldar.',
        nearestTeleport: 'Zanaris B·K·P',
        directionToRun: 'South from entrance.',
        whatItLooksLike: 'Fairy Godfather on a throne — mafia-style fairy.',
        commonMistakes: ['Talking to Chaeldar instead of Godfather.', 'Not showing the certificate after initial talk.'],
        fallbackRoute: 'Entrance → south → talk to Fairy Godfather.',
      },
      completionChecks: {
        chatContains: ['Godfather', 'Queen'],
      },
    }),

    questStep('ft2-10-agree-help', 'Agree to help the Godfather search for the Queen.', {
      objective: 'Agree to help the Godfather',
      location: 'Zanaris — Fairy Godfather\'s room',
      npc: 'Fairy Godfather',
      requiredItems: ['Nuff\'s certificate', STAFF],
      dialogueOptions: [
        '"Yes, okay." — agree to help (signs fealty scroll).',
        'OR decline first, then return and agree "Oh, okay then."',
      ],
      dialogueNeedsVerification: true,
      areaWarning: 'You must agree to help to get fairy ring permission. Declining just delays — talk again to agree.',
      completionChecks: {
        questJournalContains: ['co-ordinator', 'fairy ring', 'permission'],
      },
    }),

    questStep('ft2-11-coordinator', 'Talk to the Fairy Ring Co-ordinator to learn how rings work.', {
      objective: 'Talk to Fairy Ring Co-ordinator',
      location: 'Zanaris — near entrance intersection',
      npc: 'Co-ordinator',
      requiredItems: ['Nuff\'s certificate', STAFF],
      dialogueOptions: [
        'Ask about fairy rings (after Godfather gave permission).',
        'Listen to the fairy ring tutorial dialogue.',
      ],
      dialogueNeedsVerification: true,
      howToGetThere: {
        location: 'South of Zanaris entrance, north of Godfather\'s room, at the intersection.',
        fastestRoute: 'From Godfather\'s room, go north to the co-ordinator.',
        ifLost: 'Between entrance and Godfather\'s room — look for Co-ordinator fairy.',
      },
      puzzleHints: [
        'MUST hold Dramen/Lunar staff to activate rings.',
        'Main ring is near the fountains (SW) — dial 3-letter codes.',
        'Market ring and chicken shrine ring only go to one place each.',
      ],
      completionChecks: {
        chatContains: ['co-ordinator', 'ring'],
        questJournalContains: ['ring', 'dial'],
      },
    }),

    questStep('ft2-12-fixit', 'Talk to Fairy Fixit near the main fairy ring (south-west fountains).', {
      objective: 'Talk to Fairy Fixit at the fairy ring',
      location: 'Zanaris — south-west, near fountains',
      npc: 'Fairy Fixit',
      object: 'Fairy ring',
      requiredItems: ['Nuff\'s certificate', STAFF],
      fairyRingNotes: [
        'Equip Dramen/Lunar staff BEFORE clicking the ring.',
        'Keep Nuff\'s certificate in inventory for the code sequence.',
      ],
      howToGetThere: {
        location: 'South-west Zanaris, near the fountains — main fairy ring.',
        fastestRoute: 'From centre, run south-west to fountains.',
        ifLost: 'Look for the large fairy ring near fountains in SW Zanaris.',
      },
      completionChecks: {
        chatContains: ['Fixit', 'ring'],
      },
      markers: { object: 'Fairy ring', area: 'Zanaris fountains' },
    }),

    questStep('ft2-13-ring-air', 'Use fairy ring code: A·I·R (with staff + certificate).', {
      objective: 'Fairy ring → A·I·R',
      location: 'Fairy ring network',
      object: 'Fairy ring',
      requiredItems: ['Nuff\'s certificate', STAFF],
      fairyRingCode: 'AIR',
      fairyRingNotes: [
        'Equip staff + keep certificate in inventory.',
        'A·I·R → Islands south of Witchhaven.',
        'Can use fairy ring autodialler if unlocked.',
      ],
      areaWarning: 'Wrong code or missing certificate sends you to penguin island instead!',
      completionChecks: { locationContains: ['AIR', 'island', 'Witchaven'] },
    }),

    questStep('ft2-14-ring-dlr', 'Use fairy ring code: D·L·R (with staff + certificate).', {
      objective: 'Fairy ring → D·L·R',
      location: 'Fairy ring network',
      object: 'Fairy ring',
      requiredItems: ['Nuff\'s certificate', STAFF],
      fairyRingCode: 'DLR',
      fairyRingNotes: [
        'D·L·R → Poison Waste south of Isafdar.',
        'Use autodialler if available.',
      ],
      completionChecks: { locationContains: ['DLR', 'Poison'] },
    }),

    questStep('ft2-15-ring-djq', 'Use fairy ring code: D·J·Q (manual dial — with staff + certificate).', {
      objective: 'Fairy ring → D·J·Q (manual dial)',
      location: 'Fairy ring network',
      object: 'Fairy ring',
      requiredItems: ['Nuff\'s certificate', STAFF],
      fairyRingCode: 'DJQ',
      fairyRingNotes: [
        'D·J·Q must be dialled MANUALLY — no autodialler.',
        'Returns you to Zanaris fairy ring.',
      ],
      completionChecks: { locationContains: ['Zanaris', 'DJQ'] },
    }),

    questStep('ft2-16-ring-ajs', 'Use fairy ring code: A·J·S (with staff + certificate).', {
      objective: 'Fairy ring → A·J·S → Hideout',
      location: 'Fairy ring network',
      object: 'Fairy ring',
      requiredItems: ['Nuff\'s certificate', STAFF],
      fairyRingCode: 'AJS',
      fairyRingNotes: [
        'A·J·S → Fairy Resistance Hideout (or penguins if wrong).',
        'If you land with penguins: wrong code, missing certificate, or didn\'t read cosmic tablet.',
      ],
      areaWarning: 'Penguin island = something went wrong. Check certificate, tablet, skill reqs, and codes.',
      completionChecks: {
        questJournalContains: ['hideout', 'resistance', 'Nuff'],
        locationContains: ['hideout'],
      },
    }),

    // ── PHASE 4: HIDEOUT & PICKPOCKET ───────────────────────────────────
    questStep('ft2-17-hideout-nuff', 'Talk to Fairy Nuff in the north-east room of the hideout.', {
      objective: 'Talk to Fairy Nuff at the hideout',
      location: 'Fairy Resistance Hideout',
      npc: 'Fairy Nuff',
      requiredItems: ['Nuff\'s certificate', STAFF],
      howToGetThere: {
        location: 'Go up the path, north-east room in the hideout.',
        fastestRoute: 'Follow path up → enter NE room → talk to Fairy Nuff.',
        ifLost: 'Hideout → follow path upward → NE room has Fairy Nuff and Fairy Very Wise.',
      },
      dialogueOptions: [
        'Listen to Fairy Nuff and Fairy Very Wise explain the situation.',
        'Accept task to pickpocket secateurs from Godfather.',
      ],
      completionChecks: {
        chatContains: ['Nuff', 'secateurs', 'pickpocket'],
      },
    }),

    questStep('ft2-18-pickpocket', 'Pickpocket the Fairy Godfather in Zanaris for Queen\'s secateurs.', {
      objective: 'Pickpocket Fairy Godfather',
      location: 'Zanaris — Godfather\'s room',
      npc: 'Fairy Godfather',
      requiredItems: [STAFF],
      areaWarning: 'Thieving 40 required. Pickpocket from BEHIND or SIDE when henchmen aren\'t looking. Failure = beaten and teleported to Lumbridge Swamp.',
      combatWarnings: [
        'Orks now wander Zanaris — avoid combat if possible.',
        'If caught pickpocketing: you wake up in Lumbridge Swamp. Return to Zanaris and try again.',
      ],
      howToGetThere: {
        location: 'Return to Zanaris Godfather\'s room (south of entrance).',
        fastestRoute: 'Travel log → Fairy Resistance HQ reverse, OR fairy rings back to Zanaris B·K·P.',
        ifLost: 'Godfather\'s throne room — south of Zanaris entrance.',
      },
      lostHelp: {
        summary: 'Pickpocket the Fairy Godfather when his henchmen look away.',
        whereIsIt: 'Godfather\'s room, south of Zanaris entrance.',
        nearestTeleport: 'Zanaris B·K·P',
        directionToRun: 'South from entrance to Godfather.',
        whatItLooksLike: 'Right-click Godfather → Pickpocket. Golden secateurs on success.',
        commonMistakes: [
          'Pickpocketing while henchmen face you — wait for them to look away.',
          'Standing directly in front of Godfather — approach from behind.',
        ],
        fallbackRoute: 'Zanaris → Godfather\'s room → pickpocket from behind.',
      },
      completionChecks: {
        inventoryContains: ['secateurs', 'Queen'],
      },
    }),

    questStep('ft2-19-give-secateurs', 'Return to hideout and give Queen\'s secateurs to Fairy Nuff.', {
      objective: 'Give secateurs to Fairy Nuff',
      location: 'Fairy Resistance Hideout',
      npc: 'Fairy Nuff',
      requiredItems: ['Queen\'s secateurs', 'Nuff\'s certificate', STAFF],
      useOn: { item: 'Queen\'s secateurs', target: 'Fairy Nuff' },
      howToGetThere: {
        location: 'Fairy Resistance Hideout — NE room.',
        fastestRoute: 'Travel log → "Fairy Resistance HQ" (if unlocked) with certificate in inventory.',
        ifLost: 'Fairy ring A·J·S with certificate, or use travel log hideout sequence.',
      },
      dialogueOptions: ['Talk to Fairy Nuff with secateurs in inventory — hand them over.'],
      completionChecks: {
        questJournalContains: ['secateurs', 'potion', 'ingredients'],
      },
    }),

    // ── PHASE 5: MAGIC ESSENCE POTION ─────────────────────────────────────
    questStep('ft2-20-ingredients-brief', 'Listen to Fairy Nuff — you need starflower + gorak claw for magic essence.', {
      objective: 'Learn potion ingredients from Fairy Nuff',
      location: 'Fairy Resistance Hideout',
      npc: 'Fairy Nuff',
      requiredItems: ['Vial of water', 'Pestle and mortar', STAFF],
      puzzleHints: [
        'Starflower: fairy ring C·K·P → Cosmic plane. Wait ~2 min for flowers to grow.',
        'Gorak claw: fairy ring D·I·R → Gorak plane. Kill goraks (lvl 74), grind claw with pestle.',
        'Potion MUST be made after Nuff tells you — pre-made potions won\'t work.',
      ],
      completionChecks: {
        questJournalContains: ['starflower', 'gorak', 'magic essence'],
      },
    }),

    questStep('ft2-21-ring-ckp', 'Fairy ring C·K·P → Cosmic Entity plane for starflowers.', {
      objective: 'Fairy ring → C·K·P (starflower plane)',
      location: 'Zanaris fairy ring',
      object: 'Fairy ring',
      requiredItems: ['Vial of water', STAFF],
      fairyRingCode: 'CKP',
      fairyRingNotes: ['C·K·P → Cosmic Entity plane where starflowers grow.'],
      howToGetThere: {
        location: 'Main fairy ring in Zanaris (near fountains).',
        fastestRoute: 'Travel to Zanaris → SW fountains → use ring C·K·P with staff.',
        ifLost: 'Zanaris SW fountains — main fairy ring.',
      },
      completionChecks: { locationContains: ['cosmic', 'CKP'] },
    }),

    questStep('ft2-22-starflower', 'Wait for starflowers to grow, pick one, add to vial of water.', {
      objective: 'Pick starflower → add to vial',
      location: 'Cosmic Entity plane',
      object: 'Starflower',
      requiredItems: ['Vial of water', STAFF],
      waitNote: 'Starflowers grow, flower, and die in minutes. Walk around ~2 minutes waiting for them to appear.',
      dialogueOptions: [
        'Talk to Cosmic Being: "I\'m looking for a Star Flower."',
        'Pick starflower → use on vial of water.',
      ],
      howToGetThere: {
        location: 'Cosmic plane via ring C·K·P.',
        fastestRoute: 'Already on plane — walk around until flowers spawn.',
        ifLost: 'Ring C·K·P from Zanaris. Walk the plane until starflowers appear.',
      },
      completionChecks: {
        inventoryContains: ['starflower', 'vial'],
      },
    }),

    questStep('ft2-23-ring-dir', 'Fairy ring D·I·R → Gorak plane. Bring food and combat gear.', {
      objective: 'Fairy ring → D·I·R (gorak plane)',
      location: 'Zanaris fairy ring',
      object: 'Fairy ring',
      requiredItems: ['Vial of water', 'Pestle and mortar', STAFF],
      recommendedItems: ['Food', 'Combat gear'],
      fairyRingCode: 'DIR',
      combatWarnings: [
        'Goraks are level 74 with 2,650 HP. Typeless damage — protection prayers don\'t work.',
        'Weak to magic. Melee works with decent gear. Super restores help vs stat drain.',
      ],
      howToGetThere: {
        location: 'Zanaris main fairy ring.',
        fastestRoute: 'Return to Zanaris → equip staff + gear → ring D·I·R.',
        ifLost: 'Zanaris SW fountains fairy ring.',
      },
      completionChecks: { locationContains: ['gorak', 'DIR'] },
    }),

    questStep('ft2-24-gorak-claw', 'Kill goraks until you get a claw. Grind it with pestle and mortar.', {
      objective: 'Get gorak claw → grind with pestle',
      location: 'Gorak plane',
      requiredItems: ['Pestle and mortar', 'Vial of water (with starflower)'],
      recommendedItems: ['Food', 'Combat gear'],
      combatWarnings: [
        'Gorak claw is NOT 100% drop — kill multiple goraks.',
        'Use pestle and mortar on gorak claw to get gorak claw powder.',
      ],
      howToGetThere: {
        location: 'Gorak plane via D·I·R.',
        fastestRoute: 'Kill goraks on the plane until claw drops.',
        ifLost: 'Ring D·I·R from Zanaris. Kill goraks — they roam the small plane.',
      },
      completionChecks: {
        inventoryContains: ['gorak', 'claw'],
      },
    }),

    questStep('ft2-25-make-potion', 'Make magic essence potion: starflower water + gorak claw powder.', {
      objective: 'Make magic essence potion',
      location: 'Anywhere',
      requiredItems: ['Vial of water', 'Pestle and mortar'],
      puzzleHints: [
        'Use gorak claw powder on vial of water (with starflower).',
        'Must be made AFTER Fairy Nuff asked — pre-made won\'t work.',
      ],
      completionChecks: {
        inventoryContains: ['magic essence'],
      },
    }),

    // ── PHASE 6: CURE THE QUEEN ───────────────────────────────────────────
    questStep('ft2-26-tell-nuff', 'Return to hideout — tell Fairy Nuff you made the potion.', {
      objective: 'Tell Fairy Nuff the potion is ready',
      location: 'Fairy Resistance Hideout',
      npc: 'Fairy Nuff',
      requiredItems: ['Magic essence potion', STAFF],
      howToGetThere: {
        location: 'Hideout NE room — use travel log or A·J·S with certificate.',
        fastestRoute: 'Travel log → Fairy Resistance HQ.',
        ifLost: 'Hideout via travel log or fairy ring sequence with certificate.',
      },
      dialogueOptions: ['"I\'ve made a potion of magic essence!"'],
      completionChecks: {
        chatContains: ['Nuff', 'potion', 'Majesty'],
      },
    }),

    questStep('ft2-27-cure-queen', 'Use magic essence potion on the Fairy Queen.', {
      objective: 'Use potion on Fairy Queen',
      location: 'Fairy Resistance Hideout',
      npc: 'Fairy Queen',
      requiredItems: ['Magic essence potion'],
      useOn: { item: 'Magic essence potion', target: 'Fairy Queen' },
      howToGetThere: {
        location: 'Hideout — Fairy Queen is in the NE area near Nuff.',
        fastestRoute: 'Same room as Fairy Nuff in hideout.',
        ifLost: 'Hideout NE room — Queen is lying down, use potion on her.',
      },
      completionChecks: {
        questJournalContains: ['awake', 'Queen', 'wake'],
      },
    }),

    questStep('ft2-28-complete', 'Talk to the Fairy Queen to complete the quest and claim rewards.', {
      objective: 'Talk to Fairy Queen — quest complete!',
      location: 'Fairy Resistance Hideout',
      npc: 'Fairy Queen',
      dialogueOptions: [
        'Listen to the Queen\'s dialogue after waking.',
        'Accept the antique lamp reward.',
      ],
      completionChecks: {
        questJournalContains: ['complete', 'Congratulations'],
      },
    }),

    questStep('ft2-29-martin-return', 'Return to Martin in Draynor to confirm crops will grow.', {
      objective: 'Return to Martin the Master Gardener (optional)',
      location: 'Draynor Village',
      npc: 'Martin the Master Gardener',
      travelRoutes: ROUTES.draynorVillage(),
      dialogueOptions: [
        'Talk about farming problems and fairies.',
        '"I\'ve woken up the Fairy Queen!"',
      ],
      howToGetThere: MARTIN_HOW_TO,
      cantFindNpc: MARTIN_CANT_FIND,
      lostHelp: MARTIN_LOST,
      waitNote: 'Martin wants crops to grow before giving reward — wait and return later.',
      completionChecks: {
        chatContains: ['Martin', 'crops'],
      },
    }),
  ],
};

export default quest;
