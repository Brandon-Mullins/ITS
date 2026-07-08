import type { AdapterMode, PluginAdapters } from './types';
import {
  MockBankProvider,
  MockInventoryProvider,
  MockLocationProvider,
  MockMarkerProvider,
  MockNpcProvider,
  MockObjectProvider,
  MockOverlayProvider,
  MockQuestStateProvider,
} from './mock/providers';
import { DEMO_BANK, DEMO_INVENTORY, DEMO_LOCATION, DEMO_QUEST_STATES } from './mock/demo-data';

let currentAdapters: PluginAdapters | null = null;
let currentMode: AdapterMode = 'mock';

export function createMockAdapters(): PluginAdapters {
  return {
    questState: new MockQuestStateProvider(DEMO_QUEST_STATES),
    inventory: new MockInventoryProvider(DEMO_INVENTORY),
    bank: new MockBankProvider(DEMO_BANK),
    location: new MockLocationProvider(DEMO_LOCATION),
    npc: new MockNpcProvider([
      { id: 1, name: 'Martin the Master Gardener', x: 3078, y: 3256, plane: 0 },
    ]),
    object: new MockObjectProvider([]),
    marker: new MockMarkerProvider(),
    overlay: new MockOverlayProvider(),
  };
}

/** OCR mode uses mock for most providers; inventory/bank fed by Electron screen reader. */
export function createOcrAdapters(): PluginAdapters {
  return createMockAdapters();
}

/** Placeholder for future Jagex official API bindings. */
export function createJagexAdapters(): PluginAdapters {
  console.warn('[plugin-api] Jagex adapters not yet available — using mock');
  return createMockAdapters();
}

export function initAdapters(mode: AdapterMode = 'mock'): PluginAdapters {
  currentMode = mode;
  switch (mode) {
    case 'ocr':
      currentAdapters = createOcrAdapters();
      break;
    case 'jagex':
      currentAdapters = createJagexAdapters();
      break;
    default:
      currentAdapters = createMockAdapters();
  }
  return currentAdapters;
}

export function getAdapters(): PluginAdapters {
  if (!currentAdapters) return initAdapters('mock');
  return currentAdapters;
}

export function getAdapterMode(): AdapterMode {
  return currentMode;
}

export function markersFromStep(step: {
  markers?: {
    npc?: string | null;
    object?: string | null;
    area?: string | null;
    tile?: { x: number; y: number; plane?: number } | null;
    minimapHint?: string;
    worldMapHint?: string;
  };
  location?: string;
  npc?: string;
}): import('./types').MapMarker[] {
  const markers: import('./types').MapMarker[] = [];
  const m = step.markers;
  if (m?.npc || step.npc) {
    markers.push({
      id: 'npc',
      type: 'npc',
      label: m?.npc ?? step.npc ?? 'NPC',
      x: m?.tile?.x,
      y: m?.tile?.y,
      plane: m?.tile?.plane ?? 0,
      area: m?.area ?? step.location,
      color: '#6ab0ff',
      minimap: true,
      worldMap: true,
    });
  }
  if (m?.object) {
    markers.push({
      id: 'object',
      type: 'object',
      label: m.object,
      area: m.area ?? step.location,
      color: '#f0c040',
      minimap: true,
      worldMap: true,
    });
  }
  if (m?.area || step.location) {
    markers.push({
      id: 'area',
      type: 'area',
      label: m?.area ?? step.location ?? 'Area',
      area: m?.area ?? step.location,
      color: '#8fd87a',
      minimap: !!m?.minimapHint,
      worldMap: !!m?.worldMapHint,
    });
  }
  return markers;
}

export * from './types';
export { DEMO_RSN } from './mock/demo-data';
