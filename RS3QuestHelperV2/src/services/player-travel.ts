import type { PlayerQuestData } from '../utils/quest-match';
import { normalizeQuestName } from '../utils/quest-match';
import { QUEST_DEPENDENCIES } from '../data/quest-dependencies';
import type { AppSettings } from '../types/quest';
import type { TravelUnlockId } from '../data/travel/types';

export interface PlayerTravelProfile {
  completedQuests: Set<string>;
  unlockedLodestones: Set<string>;
  assumedItems: Set<string>;
  assumedSpells: Set<string>;
  assumedDiaries: Set<string>;
  ironmanMode: boolean;
  membersAccount: boolean;
}

/** F2P lodestones unlocked by default for most accounts */
const DEFAULT_LODESTONES: TravelUnlockId[] = [
  'lodestone:lumbridge',
  'lodestone:varrock',
  'lodestone:falador',
  'lodestone:draynor',
  'lodestone:al-kharid',
  'lodestone:port-sarim',
  'lodestone:burthorpe',
  'lodestone:edgeville',
];

/** Items assumed available unless ironman mode */
const DEFAULT_ITEMS: TravelUnlockId[] = [
  'item:amulet-of-glory',
  'item:ring-of-wealth',
  'item:games-necklace',
  'item:combat-bracelet',
  'item:passage-of-the-abyss',
  'item:grace-of-the-elves',
];

const DEFAULT_SPELLS: TravelUnlockId[] = [
  'spell:varrock-teleport',
  'spell:camelot-teleport',
  'spell:falador-teleport',
];

function questCompleted(profile: PlayerTravelProfile, questName: string): boolean {
  const norm = normalizeQuestName(questName);
  for (const q of profile.completedQuests) {
    if (normalizeQuestName(q) === norm) return true;
    if (normalizeQuestName(q).includes(norm) || norm.includes(normalizeQuestName(q))) return true;
  }
  return false;
}

function inferLodestonesFromQuests(profile: PlayerTravelProfile): void {
  for (const dep of QUEST_DEPENDENCIES) {
    if (!questCompleted(profile, dep.pageName)) continue;
    for (const unlock of dep.unlocks) {
      const lower = unlock.toLowerCase();
      if (lower.includes('lodestone')) {
        const name = lower.replace(/\s*lodestone\s*/g, '').trim();
        profile.unlockedLodestones.add(`lodestone:${name.replace(/\s+/g, '-')}`);
      }
      if (lower.includes('fairy ring') || lower.includes('zanaris')) {
        profile.assumedItems.add('item:dramen-staff');
      }
    }
  }
}

export function buildPlayerTravelProfile(
  playerData: PlayerQuestData | null,
  settings?: AppSettings,
): PlayerTravelProfile {
  const profile: PlayerTravelProfile = {
    completedQuests: new Set(),
    unlockedLodestones: new Set(DEFAULT_LODESTONES),
    assumedItems: new Set(DEFAULT_ITEMS),
    assumedSpells: new Set(DEFAULT_SPELLS),
    assumedDiaries: new Set(['diary:falador-medium']),
    ironmanMode: false,
    membersAccount: true,
  };

  if (playerData) {
    for (const q of playerData.quests) {
      if (q.status === 'COMPLETED') {
        profile.completedQuests.add(q.title);
      }
    }
    inferLodestonesFromQuests(profile);

    if (questCompleted(profile, 'Lost City')) {
      profile.assumedItems.add('item:dramen-staff');
    }
    if (questCompleted(profile, "Plague's End")) {
      profile.unlockedLodestones.add('lodestone:prifddinas');
    }
    if (questCompleted(profile, 'City of Senntisten')) {
      profile.unlockedLodestones.add('lodestone:senntisten');
    }
  }

  if (settings?.demoMode) {
    profile.assumedItems.add('item:passage-of-the-abyss');
    profile.unlockedLodestones.add('lodestone:senntisten');
    profile.completedQuests.add('City of Senntisten');
    profile.completedQuests.add('Lost City');
  }

  return profile;
}

export function isUnlockMet(profile: PlayerTravelProfile, unlockId: TravelUnlockId): boolean {
  if (unlockId.startsWith('lodestone:')) {
    return profile.unlockedLodestones.has(unlockId);
  }
  if (unlockId.startsWith('quest:')) {
    return questCompleted(profile, unlockId.replace('quest:', ''));
  }
  if (unlockId.startsWith('item:')) {
    if (profile.ironmanMode) return false;
    return profile.assumedItems.has(unlockId);
  }
  if (unlockId.startsWith('spell:')) {
    if (profile.ironmanMode) return false;
    return profile.assumedSpells.has(unlockId);
  }
  if (unlockId.startsWith('diary:')) {
    if (profile.ironmanMode) return profile.assumedDiaries.has(unlockId);
    return profile.assumedDiaries.has(unlockId);
  }
  if (unlockId.startsWith('skill:')) return true;
  if (unlockId.startsWith('achievement:')) {
    if (profile.ironmanMode) return false;
    return true;
  }
  return true;
}

export function unlockLabel(unlockId: TravelUnlockId): string {
  if (unlockId.startsWith('lodestone:')) {
    const name = unlockId.replace('lodestone:', '').replace(/-/g, ' ');
    return `${name.charAt(0).toUpperCase()}${name.slice(1)} lodestone`;
  }
  if (unlockId.startsWith('quest:')) return unlockId.replace('quest:', '');
  if (unlockId.startsWith('item:')) {
    return unlockId.replace('item:', '').replace(/-/g, ' ');
  }
  if (unlockId.startsWith('spell:')) {
    return unlockId.replace('spell:', '').replace(/-/g, ' ');
  }
  if (unlockId.startsWith('diary:')) {
    return unlockId.replace('diary:', '').replace(/-/g, ' ') + ' diary';
  }
  return unlockId;
}
