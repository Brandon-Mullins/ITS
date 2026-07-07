import type {
  InventoryCalibration,
  InventorySlotHighlight,
  PixelRect,
} from './inventory-slots';
import {
  HIGHLIGHT_CONFIDENCE_MIN,
  inventoryRectInGame,
} from './inventory-slots';

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
  inventoryCalibration?: import('./inventory-slots').InventoryCalibration | null;
  ocrDebugBoxes?: OcrDebugBox[];
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
  /** Small top-center callout lines (always safe) */
  banners: string[];
  /** Precise slot rects — only when confidence >= threshold */
  slotHighlights: InventorySlotHighlight[];
  /** Inventory use hint when slot unknown */
  inventoryBanner: string | null;
  /** Experimental world markers (disabled by default) */
  experimentalWorldRects: PixelRect[];
  debugLog: string[];
  debugRegions: {
    inventory: PixelRect;
    ocrBoxes: OcrDebugBox[];
  };
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
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

export function buildHighlightPlan(input: BuildHighlightPlanInput): HighlightRenderPlan | null {
  const {
    mode,
    debugOverlay,
    gameBounds,
    targets,
    inventoryItems,
    useOnPairs,
    dialogueNext,
    inventorySlots = [],
    inventoryCalibration,
    ocrBoxes = [],
  } = input;

  const debugLog: string[] = [];
  const banners: string[] = [];
  const invRect = inventoryRectInGame(gameBounds, inventoryCalibration);

  if (mode === 'off') {
    debugLog.push('Mode=off → no in-game highlights drawn');
    return null;
  }

  const npc = targets.find((t) => t.type === 'npc');
  const object = targets.find((t) => t.type === 'object');
  const usePair = useOnPairs?.[0];

  // ── Safe UI banners (ui-only, inventory-only, experimental) ──
  if (mode !== 'inventory-only') {
    if (usePair) {
      banners.push(`Use ${usePair.item} → on ${usePair.target}`);
      debugLog.push(`Banner: use-on pair "${usePair.item}" → "${usePair.target}"`);
    } else if (npc) {
      banners.push(`${npc.action}: ${npc.label}`);
      debugLog.push(`Banner: NPC "${npc.label}" (no world rect — API lacks coordinates)`);
    } else if (object) {
      banners.push(`${object.action}: ${object.label}`);
      debugLog.push(`Banner: object "${object.label}" (helper panel only for position)`);
    }
    if (dialogueNext) {
      banners.push(`Say: ${dialogueNext}`);
      debugLog.push(`Banner: dialogue next option`);
    }
  }

  // ── Inventory slot highlights ──
  let slotHighlights: InventorySlotHighlight[] = [];
  let inventoryBanner: string | null = null;

  const needsInventory = inventoryItems.length > 0 || Boolean(usePair);

  if (needsInventory && (mode === 'inventory-only' || mode === 'ui-only' || mode === 'experimental-world')) {
    const wantedItems = usePair ? [usePair.item] : inventoryItems;
    const qualified = inventorySlots.filter(
      (s) => wantedItems.some((w) => itemNamesMatch(w, s.item)) && s.confidence >= HIGHLIGHT_CONFIDENCE_MIN,
    );

    if (qualified.length > 0 && (mode === 'inventory-only' || mode === 'experimental-world')) {
      slotHighlights = qualified;
      for (const s of qualified) {
        debugLog.push(
          `Slot highlight: "${s.item}" slot ${s.slotIndex} confidence ${pct(s.confidence)}`,
        );
      }
    } else {
      const label = wantedItems[0] ?? 'item';
      inventoryBanner = `Use ${label} from inventory`;
      if (qualified.length === 0 && inventorySlots.length > 0) {
        debugLog.push(
          `No slot drawn: best confidence below ${pct(HIGHLIGHT_CONFIDENCE_MIN)} — showing banner only`,
        );
      } else if (inventorySlots.length === 0) {
        debugLog.push('No slot OCR match — showing inventory banner only (no giant rectangle)');
      } else {
        debugLog.push('ui-only mode: inventory banner only, no slot rect');
      }
    }

    if (mode === 'ui-only' && inventoryBanner) {
      banners.push(inventoryBanner);
      inventoryBanner = null;
    }
  }

  // ── Experimental world markers (opt-in only) ──
  const experimentalWorldRects: PixelRect[] = [];
  if (mode === 'experimental-world') {
    debugLog.push('WARNING: experimental world markers enabled — may be inaccurate');
    if (usePair) {
      experimentalWorldRects.push({
        x: gameBounds.x + gameBounds.width * 0.28,
        y: gameBounds.y + gameBounds.height * 0.32,
        width: gameBounds.width * 0.36,
        height: gameBounds.height * 0.36,
      });
    }
    if (needsInventory && slotHighlights.length === 0) {
      experimentalWorldRects.push(invRect);
      debugLog.push('Experimental: full inventory rect (low accuracy fallback)');
    }
  } else {
    debugLog.push('World-space rectangles disabled (not experimental mode)');
  }

  if (banners.length === 0 && slotHighlights.length === 0 && !inventoryBanner && experimentalWorldRects.length === 0) {
    debugLog.push('Nothing to draw');
    return null;
  }

  return {
    mode,
    debugOverlay,
    gameBounds,
    banners,
    slotHighlights,
    inventoryBanner,
    experimentalWorldRects,
    debugLog,
    debugRegions: { inventory: invRect, ocrBoxes },
  };
}

function itemNamesMatch(a: string, b: string): boolean {
  const na = a.toLowerCase().replace(/[^a-z0-9]/g, '');
  const nb = b.toLowerCase().replace(/[^a-z0-9]/g, '');
  return na.includes(nb) || nb.includes(na);
}
