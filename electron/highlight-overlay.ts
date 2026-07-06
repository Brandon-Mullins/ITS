import { BrowserWindow } from 'electron';
import type { HighlightRenderPlan, OcrDebugBox } from './highlight-engine';

let highlightWindow: BrowserWindow | null = null;

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/'/g, "\\'");
}

function relBox(
  box: { x: number; y: number; width: number; height: number },
  game: { x: number; y: number; width: number; height: number },
): string {
  const left = ((box.x - game.x) / game.width) * 100;
  const top = ((box.y - game.y) / game.height) * 100;
  const w = (box.width / game.width) * 100;
  const h = (box.height / game.height) * 100;
  return `left:${left.toFixed(2)}%;top:${top.toFixed(2)}%;width:${w.toFixed(2)}%;height:${h.toFixed(2)}%;`;
}

function buildOverlayHtml(plan: HighlightRenderPlan): string {
  const g = plan.gameBounds;
  let yOffset = 6;

  const bannerEls = plan.banners.map((text) => {
    const el = `<div class="safe-banner" style="top:${yOffset}%">${esc(text)}</div>`;
    yOffset += 5;
    return el;
  }).join('');

  const invBannerEl = plan.inventoryBanner
    ? `<div class="safe-banner inv-hint" style="top:${yOffset}%">${esc(plan.inventoryBanner)}</div>`
    : '';

  const slotEls = plan.slotHighlights.map((s) => {
    const style = relBox(s, g);
    return `<div class="slot-highlight" style="${style}" title="${esc(s.item)} ${Math.round(s.confidence * 100)}%"></div>`;
  }).join('');

  const experimentalEls = plan.experimentalWorldRects.map((r) => {
    const style = relBox(r, g);
    return `<div class="experimental-rect" style="${style}"></div>`;
  }).join('');

  let debugEls = '';
  if (plan.debugOverlay) {
    const invStyle = relBox(plan.debugRegions.inventory, g);
    debugEls += `<div class="debug-inv-region" style="${invStyle}"></div>`;
    debugEls += plan.debugRegions.ocrBoxes.map((b: OcrDebugBox) => {
      const style = relBox(b, g);
      return `<div class="debug-ocr-box" style="${style}" title="${esc(b.label)} ${Math.round(b.confidence * 100)}%"></div>`;
    }).join('');
    const logLines = plan.debugLog.map((l) => `<div>${esc(l)}</div>`).join('');
    debugEls += `<div class="debug-log">${logLines}</div>`;
    debugEls += `<div class="debug-game-bounds">RS3 ${g.width}×${g.height}</div>`;
  }

  return `<!DOCTYPE html><html><head><style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:100%; height:100%; overflow:hidden; background:transparent; pointer-events:none; font-family:Segoe UI,sans-serif; }
    .safe-banner {
      position:absolute; left:50%; transform:translateX(-50%);
      padding:6px 14px; border-radius:8px; max-width:90%;
      background:rgba(12,28,56,0.92); border:2px solid #4a90ff;
      color:#a8d4ff; font-size:13px; font-weight:600;
      box-shadow:0 0 12px rgba(74,144,255,0.45);
      white-space:nowrap; z-index:20; text-align:center;
      animation: subtle-pulse 2.5s ease-in-out infinite;
    }
    .inv-hint { border-color:#6ab0ff; font-size:12px; }
    .slot-highlight {
      position:absolute; border:2px solid #4a90ff; border-radius:4px;
      box-shadow:0 0 10px rgba(74,144,255,0.8), inset 0 0 6px rgba(74,144,255,0.2);
      z-index:15; animation: subtle-pulse 2s ease-in-out infinite;
    }
    .experimental-rect {
      position:absolute; border:2px dashed rgba(255,120,0,0.7); border-radius:8px;
      background:rgba(255,120,0,0.06); z-index:5;
    }
    .debug-inv-region {
      position:absolute; border:2px dashed rgba(0,255,120,0.8); z-index:3;
      background:rgba(0,255,120,0.04);
    }
    .debug-ocr-box {
      position:absolute; border:1px solid rgba(255,255,0,0.7); z-index:4;
      background:rgba(255,255,0,0.08);
    }
    .debug-log {
      position:absolute; left:4px; bottom:4px; max-width:48%; max-height:35%;
      overflow:auto; padding:6px 8px; font-size:9px; line-height:1.35;
      background:rgba(0,0,0,0.75); color:#9f9; border:1px solid #363; z-index:30;
    }
    .debug-game-bounds {
      position:absolute; right:4px; bottom:4px; padding:4px 8px; font-size:9px;
      background:rgba(0,0,0,0.7); color:#8cf; z-index:30;
    }
    @keyframes subtle-pulse {
      0%, 100% { opacity:1; }
      50% { opacity:0.88; }
    }
  </style></head><body>${bannerEls}${invBannerEl}${slotEls}${experimentalEls}${debugEls}</body></html>`;
}

export function renderHighlightPlan(plan: HighlightRenderPlan | null, gameBounds: { x: number; y: number; width: number; height: number }): void {
  if (!plan) {
    clearGameHighlights();
    return;
  }

  if (!highlightWindow || highlightWindow.isDestroyed()) {
    highlightWindow = new BrowserWindow({
      x: gameBounds.x,
      y: gameBounds.y,
      width: gameBounds.width,
      height: gameBounds.height,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      focusable: false,
      skipTaskbar: true,
      hasShadow: false,
      resizable: false,
      movable: false,
      webPreferences: { nodeIntegration: false, contextIsolation: true },
    });
    highlightWindow.setIgnoreMouseEvents(true);
    highlightWindow.setAlwaysOnTop(true, 'screen-saver');
  } else {
    highlightWindow.setBounds(gameBounds);
  }

  highlightWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(buildOverlayHtml(plan))}`);
  if (!highlightWindow.isVisible()) highlightWindow.show();
}

export function clearGameHighlights(): void {
  if (highlightWindow && !highlightWindow.isDestroyed()) {
    highlightWindow.close();
    highlightWindow = null;
  }
}

export function syncHighlightToGame(gameBounds: { x: number; y: number; width: number; height: number } | null): void {
  if (!highlightWindow || highlightWindow.isDestroyed() || !gameBounds) return;
  highlightWindow.setBounds(gameBounds);
}
