import { BrowserWindow } from 'electron';

export interface HighlightTargetPayload {
  type: string;
  label: string;
  action: string;
  itemName?: string;
}

export interface HighlightConfig {
  targets: HighlightTargetPayload[];
  highlightInventory: boolean;
  inventoryItems: string[];
}

let highlightWindow: BrowserWindow | null = null;

function buildOverlayHtml(config: HighlightConfig): string {
  const npcTarget = config.targets.find((t) => t.type === 'npc');
  const objectTarget = config.targets.find((t) => t.type === 'object');
  const invItems = config.inventoryItems.map((i) => i.replace(/'/g, "\\'")).join(', ');

  const npcBanner = npcTarget
    ? `<div class="npc-banner blue-aura-pulse">🔵 ${npcTarget.action}: <strong>${npcTarget.label}</strong></div>`
    : '';

  const objectBanner = objectTarget && !npcTarget
    ? `<div class="npc-banner blue-aura-pulse">🔵 ${objectTarget.action}: <strong>${objectTarget.label}</strong></div>`
    : '';

  const invHighlight = config.highlightInventory
    ? `<div class="inventory-aura blue-aura-pulse" title="Use: ${invItems}">
         <span class="inv-label">🔵 ${config.inventoryItems.length > 0 ? `Use: ${config.inventoryItems[0]}` : 'Check inventory'}</span>
       </div>`
    : '';

  return `<!DOCTYPE html><html><head><style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:100%; height:100%; overflow:hidden; background:transparent; pointer-events:none; font-family:Segoe UI,sans-serif; }
    .npc-banner {
      position:absolute; top:8%; left:50%; transform:translateX(-50%);
      padding:8px 16px; border-radius:8px;
      background:rgba(20,40,80,0.85); border:2px solid #4a90ff;
      color:#8ec4ff; font-size:14px; font-weight:600;
      box-shadow:0 0 20px rgba(74,144,255,0.6), 0 0 40px rgba(74,144,255,0.3);
      white-space:nowrap; z-index:10;
    }
    .inventory-aura {
      position:absolute; right:2%; top:14%; width:46%; height:58%;
      border:3px solid #4a90ff; border-radius:12px;
      box-shadow:0 0 24px rgba(74,144,255,0.7), inset 0 0 20px rgba(74,144,255,0.15);
      z-index:5;
    }
    .inv-label {
      position:absolute; bottom:-28px; left:50%; transform:translateX(-50%);
      padding:4px 10px; background:rgba(20,40,80,0.9); border:1px solid #4a90ff;
      border-radius:6px; color:#8ec4ff; font-size:11px; font-weight:700;
      white-space:nowrap;
    }
    .blue-aura-pulse { animation: pulse 2s ease-in-out infinite; }
    @keyframes pulse {
      0%, 100% { box-shadow:0 0 20px rgba(74,144,255,0.6), 0 0 40px rgba(74,144,255,0.3); }
      50% { box-shadow:0 0 30px rgba(74,144,255,0.9), 0 0 60px rgba(74,144,255,0.5); }
    }
  </style></head><body>${npcBanner}${objectBanner}${invHighlight}</body></html>`;
}

export function updateGameHighlights(bounds: { x: number; y: number; width: number; height: number }, config: HighlightConfig): void {
  if (config.targets.length === 0) {
    clearGameHighlights();
    return;
  }

  if (!highlightWindow || highlightWindow.isDestroyed()) {
    highlightWindow = new BrowserWindow({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      focusable: false,
      skipTaskbar: true,
      hasShadow: false,
      resizable: false,
      movable: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });
    highlightWindow.setIgnoreMouseEvents(true);
    highlightWindow.setAlwaysOnTop(true, 'screen-saver');
  } else {
    highlightWindow.setBounds(bounds);
  }

  const html = buildOverlayHtml(config);
  highlightWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
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
