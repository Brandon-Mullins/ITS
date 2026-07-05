/** Shared inventory grid + calibration math (Electron main process) */

export const INV_COLS = 4;
export const INV_ROWS = 7;
export const HIGHLIGHT_CONFIDENCE_MIN = 0.85;

export interface InventoryCalibration {
  /** Fractions 0–1 relative to RS3 game window */
  left: number;
  top: number;
  width: number;
  height: number;
  cols?: number;
  rows?: number;
}

export interface PixelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface InventorySlotHighlight {
  item: string;
  confidence: number;
  slotIndex: number;
  col: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const DEFAULT_INVENTORY_CALIBRATION: InventoryCalibration = {
  left: 0.58,
  top: 0.58,
  width: 0.40,
  height: 0.38,
  cols: INV_COLS,
  rows: INV_ROWS,
};

export function inventoryRectInGame(
  game: PixelRect,
  calibration?: InventoryCalibration | null,
): PixelRect {
  const cal = calibration ?? DEFAULT_INVENTORY_CALIBRATION;
  return {
    x: game.x + cal.left * game.width,
    y: game.y + cal.top * game.height,
    width: cal.width * game.width,
    height: cal.height * game.height,
  };
}

export function slotRectInInventory(
  inv: PixelRect,
  col: number,
  row: number,
  cols = INV_COLS,
  rows = INV_ROWS,
): PixelRect {
  const cellW = inv.width / cols;
  const cellH = inv.height / rows;
  return {
    x: inv.x + col * cellW,
    y: inv.y + row * cellH,
    width: cellW,
    height: cellH,
  };
}

export function pointToSlot(
  localX: number,
  localY: number,
  invWidth: number,
  invHeight: number,
  cols = INV_COLS,
  rows = INV_ROWS,
): { col: number; row: number; slotIndex: number } | null {
  if (localX < 0 || localY < 0 || localX > invWidth || localY > invHeight) return null;
  const col = Math.min(cols - 1, Math.max(0, Math.floor((localX / invWidth) * cols)));
  const row = Math.min(rows - 1, Math.max(0, Math.floor((localY / invHeight) * rows)));
  return { col, row, slotIndex: row * cols + col };
}

/** Convert calibration drag rect (screen pixels) to fractions within game window */
export function screenRectToCalibration(
  drag: PixelRect,
  game: PixelRect,
): InventoryCalibration {
  return {
    left: (drag.x - game.x) / game.width,
    top: (drag.y - game.y) / game.height,
    width: drag.width / game.width,
    height: drag.height / game.height,
    cols: INV_COLS,
    rows: INV_ROWS,
  };
}
