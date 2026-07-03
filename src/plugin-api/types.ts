/**
 * Plugin API — provider interfaces for RS3 Quest Helper.
 * Prototype uses OCR/mock adapters; production uses Jagex-approved APIs.
 */

// ─── Shared types ───────────────────────────────────────────────────────────

export interface PlayerQuestState {
  questId: string;
  name: string;
  status: 'NOT_STARTED' | 'STARTED' | 'COMPLETED';
  currentStep?: number;
  eligible: boolean;
}

export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
}

export interface BankItem {
  id: number;
  name: string;
  quantity: number;
}

export interface PlayerLocation {
  x: number;
  y: number;
  plane: number;
  regionName?: string;
  areaName?: string;
}

export interface NpcInfo {
  id: number;
  name: string;
  x: number;
  y: number;
  plane: number;
}

export interface WorldObject {
  id: number;
  name: string;
  x: number;
  y: number;
  plane: number;
}

export interface MapMarker {
  id: string;
  type: 'npc' | 'object' | 'tile' | 'area';
  label: string;
  x?: number;
  y?: number;
  plane?: number;
  area?: string;
  color?: string;
  minimap?: boolean;
  worldMap?: boolean;
}

export interface OverlayPanel {
  id: string;
  title: string;
  visible: boolean;
  position: 'top-left' | 'top-right' | 'sidebar';
}

// ─── Provider interfaces ────────────────────────────────────────────────────

export interface QuestStateProvider {
  readonly name: string;
  getQuestStates(): Promise<PlayerQuestState[]>;
  getQuestState(questId: string): Promise<PlayerQuestState | null>;
  onQuestStateChange?(callback: (state: PlayerQuestState) => void): () => void;
}

export interface InventoryProvider {
  readonly name: string;
  getInventory(): Promise<InventoryItem[]>;
  hasItem(itemName: string): Promise<boolean>;
  onInventoryChange?(callback: (items: InventoryItem[]) => void): () => void;
}

export interface BankProvider {
  readonly name: string;
  isBankOpen(): Promise<boolean>;
  getBankItems(): Promise<BankItem[]>;
  hasItemInBank(itemName: string): Promise<boolean>;
}

export interface PlayerLocationProvider {
  readonly name: string;
  getLocation(): Promise<PlayerLocation | null>;
  isInArea(areaName: string): Promise<boolean>;
}

export interface NpcProvider {
  readonly name: string;
  findNearbyNpcs(nameFilter?: string): Promise<NpcInfo[]>;
  highlightNpc?(npcId: number): void;
  clearHighlights?(): void;
}

export interface ObjectProvider {
  readonly name: string;
  findNearbyObjects(nameFilter?: string): Promise<WorldObject[]>;
  highlightObject?(objectId: number): void;
  clearHighlights?(): void;
}

export interface MarkerProvider {
  readonly name: string;
  setMarkers(markers: MapMarker[]): void;
  clearMarkers(): void;
  setMinimapMarker?(marker: MapMarker | null): void;
  setWorldMapMarker?(marker: MapMarker | null): void;
}

export interface OverlayProvider {
  readonly name: string;
  showPanel(panel: OverlayPanel): void;
  hidePanel(panelId: string): void;
  setPanelContent(panelId: string, html: string): void;
}

// ─── Adapter bundle ─────────────────────────────────────────────────────────

export interface PluginAdapters {
  questState: QuestStateProvider;
  inventory: InventoryProvider;
  bank: BankProvider;
  location: PlayerLocationProvider;
  npc: NpcProvider;
  object: ObjectProvider;
  marker: MarkerProvider;
  overlay: OverlayProvider;
}

export type AdapterMode = 'mock' | 'ocr' | 'jagex';
