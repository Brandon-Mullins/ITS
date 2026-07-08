import type {
  InventoryCalibration,
  InventorySlotHighlight,
  PixelRect,
} from './inventory-slots';
import { inventoryRectInGame } from './inventory-slots';

export type HighlightMode = 'off' | 'ui-only' | 'inventory-only' | 'experimental-world';

export interface HighlightTargetPayload {
  type: string;
  label: string;
  action: string;
  itemName?: string;
  targetName?: string;
}

export interface HighlightConfig {
  mode: HighlightMode;
  debugOverlay: boolean;
  targets: HighlightTargetPayload[];
  inventoryItems: string[];
  useOnPairs?: Array<{ item: string; target: string }>;
  dialogueNext?: string;
  inventorySlots?: import('./inventory-slots').InventorySlotHighlight[];
  inventoryCalibration?: InventoryCalibration | null;
  ocrDebugBoxes?: OcrDebugBox[];
  navigation?: {
    npcName: string;
    compassLabel: string;
    compassAngle: number;
    landmark: string;
    minimapX: number;
    minimapY: number;
  };
}

export interface OcrDebugBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
}

export interface HighlightRenderPlan {
  mode: HighlightMode;
  debugOverlay: boolean;
  gameBounds: PixelRect;
  banners: string[];
  experimentalWarning: boolean;
  debugLog: string[];
  debugRegions: {
    inventory: PixelRect;
    ocrBoxes: OcrDebugBox[];
  };
  navigation?: HighlightConfig['navigation'];
}

export interface BuildHighlightPlanInput {
  mode: HighlightMode;
  debugOverlay: boolean;
  gameBounds: PixelRect;
  targets: HighlightTargetPayload[];
  inventoryItems: string[];
  useOnPairs?: Array<{ item: string; target: string }>;
  dialogueNext?: string;
  inventorySlots?: InventorySlotHighlight[];
  inventoryCalibration?: InventoryCalibration | null;
  ocrBoxes?: OcrDebugBox[];
  navigation?: HighlightConfig['navigation'];
}

/** v0.6.4-HIGHLIGHT-FIX: rectangles permanently disabled — text callouts only */
const RECTANGLES_ENABLED = false;

export function buildHighlightPlan(input: BuildHighlightPlanInput): HighlightRenderPlan | null {
  const {
    mode,
    debugOverlay,
    gameBounds,
    targets,
    inventoryItems,
    useOnPairs,
    dialogueNext,
    inventoryCalibration,
    ocrBoxes = [],
    navigation,
  } = input;

  const debugLog: string[] = [
    'v0.6.4-HIGHLIGHT-FIX: in-game rectangles DISABLED (text callouts only)',
  ];
  const banners: string[] = [];
  const invRect = inventoryRectInGame(gameBounds, inventoryCalibration);

  if (mode === 'off') {
    debugLog.push('Mode=off → no in-game overlay');
    return null;
  }

  const npc = targets.find((t) => t.type === 'npc');
  const object = targets.find((t) => t.type === 'object');
  const usePair = useOnPairs?.[0];
  const experimentalWarning = mode === 'experimental-world';

  if (experimentalWarning) {
    debugLog.push('WARNING: Experimental mode — rectangles still disabled in this build');
  }

  if (usePair) {
    banners.push(`Use ${usePair.item} → on ${usePair.target}`);
  } else if (npc) {
    banners.push(`${npc.action}: ${npc.label}`);
    if (navigation) {
      banners.push(`→ Run ${navigation.compassLabel.toLowerCase()} — ${navigation.landmark}`);
    }
  } else if (object) {
    banners.push(`${object.action}: ${object.label}`);
  }

  const needsInventory = inventoryItems.length > 0 || Boolean(usePair);
  if (needsInventory) {
    const label = usePair?.item ?? inventoryItems[0] ?? 'item';
    banners.push(`Use ${label} from inventory`);
  }

  if (dialogueNext) {
    banners.push(`Say: ${dialogueNext}`);
  }

  if (!RECTANGLES_ENABLED) {
    debugLog.push('No inventory/world/minimap rectangles drawn');
  }

  if (banners.length === 0 && !experimentalWarning && !debugOverlay && !navigation) {
    return null;
  }

  return {
    mode,
    debugOverlay,
    gameBounds,
    banners,
    experimentalWarning,
    debugLog,
    debugRegions: { inventory: invRect, ocrBoxes },
    navigation,
  };
}
