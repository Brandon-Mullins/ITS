/** Structured travel database — scalable location + teleport model */

export type TeleportCategory =
  | 'lodestone'
  | 'jewellery'
  | 'spell'
  | 'fairy-ring'
  | 'spirit-tree'
  | 'gnome-glider'
  | 'eagle'
  | 'poh'
  | 'max-guild'
  | 'passage-abyss'
  | 'grace-elves'
  | 'archaeology'
  | 'portable-fairy'
  | 'tablet'
  | 'quest-item'
  | 'walk'
  | 'other';

export type TravelUnlockId = string;

export interface TeleportMethod {
  id: string;
  name: string;
  icon: string;
  category: TeleportCategory;
  /** Teleport time in seconds (cast/rub animation) */
  teleportSeconds: number;
  membersOnly?: boolean;
  ironmanFriendly?: boolean;
  consumed?: boolean;
  requiredUnlocks: TravelUnlockId[];
}

export interface LocationRoute {
  methodId: string;
  walkDirection?: string;
  walkSeconds?: number;
  walkDescription?: string;
  routeType?: 'fastest' | 'cheapest' | 'ironman' | 'no-teleport' | 'alternative';
}

export interface LocationTravelData {
  id: string;
  displayName: string;
  aliases: string[];
  areaDescription?: string;
  routes: LocationRoute[];
}

export interface NpcTravelInfo {
  name: string;
  aliases: string[];
  location: string;
  area: string;
  examine: string;
  wikiPage: string;
  portraitIcon: string;
  compassDirection?: string;
  tilesAway?: number;
}

export interface RankedTravelRoute {
  type: 'fastest' | 'cheapest' | 'ironman' | 'no-teleport' | 'alternative';
  label: string;
  methodName: string;
  methodIcon: string;
  estimatedSeconds: number;
  estimatedTime: string;
  walkDirection?: string;
  walkDescription?: string;
  description: string;
  requirements: Array<{ text: string; met: boolean }>;
  locked: boolean;
  lockReason?: string;
  available: boolean;
  visualSteps: VisualRouteStep[];
}

export interface VisualRouteStep {
  icon: string;
  label: string;
  detail?: string;
}

export interface TravelDestination {
  npc?: string;
  location: string;
  area?: string;
}

export interface TravelBrainResult {
  destination: TravelDestination;
  fastestAvailable: RankedTravelRoute | null;
  rankedRoutes: RankedTravelRoute[];
  alternatives: RankedTravelRoute[];
  ironmanRoute: RankedTravelRoute | null;
  noTeleportRoute: RankedTravelRoute | null;
  newbieInstructions: string[];
  locationId: string | null;
}
