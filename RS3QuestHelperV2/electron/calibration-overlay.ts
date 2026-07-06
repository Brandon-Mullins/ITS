import { BrowserWindow } from 'electron';
import { findGameWindow } from './game-window';
import type { InventoryCalibration } from './inventory-slots';
import { INV_COLS, INV_ROWS } from './inventory-slots';

let calibrationWindow: BrowserWindow | null = null;
let calibrationResolve: ((v: InventoryCalibration | null) => void) | null = null;

export function closeCalibrationOverlay(): void {
  if (calibrationWindow && !calibrationWindow.isDestroyed()) {
    calibrationWindow.close();
  }
  calibrationWindow = null;
}

export function resolveCalibration(cal: InventoryCalibration | null): void {
  calibrationResolve?.(cal);
  calibrationResolve = null;
  closeCalibrationOverlay();
}

/** Opens drag-to-select overlay on RS3 window. Drag coords are relative to game window. */
export async function openCalibrationOverlay(): Promise<InventoryCalibration | null> {
  closeCalibrationOverlay();

  const game = await findGameWindow();
  if (!game.found || !game.bounds) return null;

  const b = game.bounds;

  return new Promise((resolve) => {
    calibrationResolve = resolve;

    calibrationWindow = new BrowserWindow({
      x: b.x,
      y: b.y,
      width: b.width,
      height: b.height,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      focusable: true,
      skipTaskbar: true,
      hasShadow: false,
      resizable: false,
      movable: false,
      webPreferences: { preload: undefined, nodeIntegration: true, contextIsolation: false },
    });

    calibrationWindow.setAlwaysOnTop(true, 'screen-saver');

    const html = `<!DOCTYPE html><html><head><style>
      * { margin:0; padding:0; box-sizing:border-box; }
      html, body { width:100%; height:100%; overflow:hidden; cursor:crosshair; background:rgba(0,0,0,0.18); }
      #hint {
        position:fixed; top:12px; left:50%; transform:translateX(-50%);
        padding:10px 16px; background:rgba(0,0,0,0.88); color:#fff;
        border:2px solid #4a90ff; border-radius:8px; font:600 14px Segoe UI,sans-serif;
        z-index:10; pointer-events:none;
      }
      #box {
        position:absolute; border:2px solid #4a90ff; background:rgba(74,144,255,0.18);
        display:none; pointer-events:none; box-shadow:0 0 16px rgba(74,144,255,0.55);
      }
      #cancel {
        position:fixed; bottom:16px; right:16px; padding:8px 16px;
        background:#333; color:#fff; border:1px solid #666; border-radius:6px;
        font:600 13px Segoe UI,sans-serif; cursor:pointer; z-index:11;
      }
    </style></head><body>
      <div id="hint">Drag a box around your inventory · Esc to cancel</div>
      <div id="box"></div>
      <button id="cancel">Cancel</button>
      <script>
        const { ipcRenderer } = require('electron');
        const box = document.getElementById('box');
        let start = null, dragging = false;
        const gw = ${b.width}, gh = ${b.height};
        const finish = (cal) => { ipcRenderer.send('calibration:result', cal); };
        document.getElementById('cancel').onclick = () => finish(null);
        document.onkeydown = (e) => { if (e.key === 'Escape') finish(null); };
        document.onmousedown = (e) => {
          start = { x: e.clientX, y: e.clientY };
          dragging = true;
          box.style.display = 'block';
          box.style.left = start.x + 'px';
          box.style.top = start.y + 'px';
          box.style.width = '0';
          box.style.height = '0';
        };
        document.onmousemove = (e) => {
          if (!dragging || !start) return;
          const x = Math.min(start.x, e.clientX);
          const y = Math.min(start.y, e.clientY);
          box.style.left = x + 'px';
          box.style.top = y + 'px';
          box.style.width = Math.abs(e.clientX - start.x) + 'px';
          box.style.height = Math.abs(e.clientY - start.y) + 'px';
        };
        document.onmouseup = (e) => {
          if (!dragging || !start) return;
          dragging = false;
          const x = Math.min(start.x, e.clientX);
          const y = Math.min(start.y, e.clientY);
          const w = Math.abs(e.clientX - start.x);
          const h = Math.abs(e.clientY - start.y);
          if (w < 24 || h < 24) { finish(null); return; }
          finish({ left: x/gw, top: y/gh, width: w/gw, height: h/gh, cols: ${INV_COLS}, rows: ${INV_ROWS} });
        };
      </script>
    </body></html>`;

    calibrationWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    calibrationWindow.on('closed', () => {
      calibrationWindow = null;
      if (calibrationResolve) {
        calibrationResolve(null);
        calibrationResolve = null;
      }
    });
    calibrationWindow.show();
    calibrationWindow.focus();
  });
}
