import { BrowserWindow } from 'electron';

export interface HighlightTargetPayload {
  type: string;
  label: string;
  action: string;
  itemName?: string;
  targetName?: string;
}

export interface HighlightConfig {
  targets: HighlightTargetPayload[];
  highlightInventory: boolean;
  inventoryItems: string[];
  useOnPairs?: Array<{ item: string; target: string }>;
  dialogueNext?: string;
}

let highlightWindow: BrowserWindow | null = null;

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/'/g, "\\'");
}

function buildOverlayHtml(config: HighlightConfig): string {
  const npcTarget = config.targets.find((t) => t.type === 'npc');
  const usePair = config.useOnPairs?.[0];
  const objectTarget = usePair
    ? config.targets.find((t) => t.type === 'object' && t.label.toLowerCase().includes(usePair.target.toLowerCase().split(' ')[0]))
      ?? { label: usePair.target, action: 'Use' }
    : config.targets.find((t) => t.type === 'object');
  const invItems = config.inventoryItems.map((i) => esc(i)).join(', ');

  const useOnBanner = usePair
    ? `<div class="npc-banner blue-aura-pulse use-on-banner">🔵 Use <strong>${esc(usePair.item)}</strong> → on <strong>${esc(usePair.target)}</strong></div>`
    : '';

  const npcBanner = !useOnBanner && npcTarget
    ? `<div class="npc-banner blue-aura-pulse">🔵 ${esc(npcTarget.action)}: <strong>${esc(npcTarget.label)}</strong></div>`
    : '';

  const objectBanner = !useOnBanner && objectTarget && !npcTarget
    ? `<div class="npc-banner blue-aura-pulse">🔵 ${esc(objectTarget.action)}: <strong>${esc(objectTarget.label)}</strong></div>`
    : '';

  const dialogueBanner = config.dialogueNext
    ? `<div class="dialogue-banner blue-aura-pulse">💬 Say: <strong>${esc(config.dialogueNext)}</strong></div>`
    : '';

  const invLabel = usePair
    ? `Use: ${usePair.item}`
    : config.inventoryItems.length > 0
      ? `Use: ${config.inventoryItems[0]}`
      : 'Check inventory';

  const invHighlight = config.highlightInventory
    ? `<div class="inventory-aura blue-aura-pulse" title="Use: ${invItems}">
         <span class="inv-label">🔵 ${esc(invLabel)}</span>
       </div>`
    : '';

  const targetAura = usePair
    ? `<div class="world-target-aura blue-aura-pulse" title="${esc(usePair.target)}"></div>`
    : '';

  return `<!DOCTYPE html><html><head><style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:100%; height:100%; overflow:hidden; background:transparent; pointer-events:none; font-family:Segoe UI,sans-serif; }
    .npc-banner, .dialogue-banner {
      position:absolute; top:8%; left:50%; transform:translateX(-50%);
      padding:8px 16px; border-radius:8px;
      background:rgba(20,40,80,0.85); border:2px solid #4a90ff;
      color:#8ec4ff; font-size:14px; font-weight:600;
      box-shadow:0 0 20px rgba(74,144,255,0.6), 0 0 40px rgba(74,144,255,0.3);
      white-space:nowrap; z-index:10;
    }
    .dialogue-banner { top:14%; font-size:12px; border-color:#6ab0ff; }
    .use-on-banner { top:6%; font-size:13px; }
    .inventory-aura {
      position:absolute; right:2%; top:14%; width:46%; height:58%;
      border:3px solid #4a90ff; border-radius:12px;
      box-shadow:0 0 24px rgba(74,144,255,0.7), inset 0 0 20px rgba(74,144,255,0.15);
      z-index:5;
    }
    .world-target-aura {
      position:absolute; left:28%; top:32%; width:36%; height:36%;
      border:3px solid #4a90ff; border-radius:50%;
      box-shadow:0 0 28px rgba(74,144,255,0.75);
      z-index:4;
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
  </style></head><body>${useOnBanner}${npcBanner}${objectBanner}${dialogueBanner}${targetAura}${invHighlight}</body></html>`;
}

export function updateGameHighlights(bounds: { x: number; y: number; width: number; height: number }, config: HighlightConfig): void {
  if (config.targets.length === 0 && !config.highlightInventory) {
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
