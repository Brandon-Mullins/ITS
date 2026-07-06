import type {
  BankItem,
  BankProvider,
  InventoryItem,
  InventoryProvider,
  MapMarker,
  MarkerProvider,
  NpcInfo,
  NpcProvider,
  OverlayPanel,
  OverlayProvider,
  PlayerLocation,
  PlayerLocationProvider,
  PlayerQuestState,
  QuestStateProvider,
  WorldObject,
  ObjectProvider,
} from '../types';

/** Mock quest states for demo mode and offline development. */
export class MockQuestStateProvider implements QuestStateProvider {
  readonly name = 'mock-quest-state';

  constructor(private states: PlayerQuestState[] = []) {}

  async getQuestStates(): Promise<PlayerQuestState[]> {
    return this.states;
  }

  async getQuestState(questId: string): Promise<PlayerQuestState | null> {
    return this.states.find((s) => s.questId === questId) ?? null;
  }
}

export class MockInventoryProvider implements InventoryProvider {
  readonly name = 'mock-inventory';

  constructor(private items: InventoryItem[] = []) {}

  async getInventory(): Promise<InventoryItem[]> {
    return this.items;
  }

  async hasItem(itemName: string): Promise<boolean> {
    return this.items.some((i) => i.name.toLowerCase().includes(itemName.toLowerCase()));
  }
}

export class MockBankProvider implements BankProvider {
  readonly name = 'mock-bank';

  constructor(private items: BankItem[] = [], private open = false) {}

  async isBankOpen(): Promise<boolean> {
    return this.open;
  }

  async getBankItems(): Promise<BankItem[]> {
    return this.items;
  }

  async hasItemInBank(itemName: string): Promise<boolean> {
    return this.items.some((i) => i.name.toLowerCase().includes(itemName.toLowerCase()));
  }
}

export class MockLocationProvider implements PlayerLocationProvider {
  readonly name = 'mock-location';

  constructor(private location: PlayerLocation | null = null) {}

  async getLocation(): Promise<PlayerLocation | null> {
    return this.location;
  }

  async isInArea(areaName: string): Promise<boolean> {
    return this.location?.areaName?.toLowerCase().includes(areaName.toLowerCase()) ?? false;
  }
}

export class MockNpcProvider implements NpcProvider {
  readonly name = 'mock-npc';
  private highlighted: number[] = [];

  constructor(private npcs: NpcInfo[] = []) {}

  async findNearbyNpcs(nameFilter?: string): Promise<NpcInfo[]> {
    if (!nameFilter) return this.npcs;
    const f = nameFilter.toLowerCase();
    return this.npcs.filter((n) => n.name.toLowerCase().includes(f));
  }

  highlightNpc(npcId: number): void {
    this.highlighted.push(npcId);
  }

  clearHighlights(): void {
    this.highlighted = [];
  }
}

export class MockObjectProvider implements ObjectProvider {
  readonly name = 'mock-object';

  constructor(private objects: WorldObject[] = []) {}

  async findNearbyObjects(nameFilter?: string): Promise<WorldObject[]> {
    if (!nameFilter) return this.objects;
    const f = nameFilter.toLowerCase();
    return this.objects.filter((o) => o.name.toLowerCase().includes(f));
  }

  highlightObject(): void {}
  clearHighlights(): void {}
}

export class MockMarkerProvider implements MarkerProvider {
  readonly name = 'mock-marker';
  private markers: MapMarker[] = [];

  setMarkers(markers: MapMarker[]): void {
    this.markers = markers;
  }

  clearMarkers(): void {
    this.markers = [];
  }

  setMinimapMarker(): void {}
  setWorldMapMarker(): void {}

  getMarkers(): MapMarker[] {
    return this.markers;
  }
}

export class MockOverlayProvider implements OverlayProvider {
  readonly name = 'mock-overlay';
  private panels = new Map<string, OverlayPanel>();

  showPanel(panel: OverlayPanel): void {
    this.panels.set(panel.id, panel);
  }

  hidePanel(panelId: string): void {
    this.panels.delete(panelId);
  }

  setPanelContent(): void {}

  getPanels(): OverlayPanel[] {
    return Array.from(this.panels.values());
  }
}
