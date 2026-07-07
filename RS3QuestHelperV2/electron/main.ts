import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { GameWindowTracker, findGameWindow } from './game-window';
import { renderHighlightPlan, clearGameHighlights, syncHighlightToGame } from './highlight-overlay';
import { buildHighlightPlan } from './highlight-engine';
import type { HighlightConfig } from './highlight-engine';
import { openCalibrationOverlay, resolveCalibration, closeCalibrationOverlay } from './calibration-overlay';
import { scanGameScreen, disposeScreenReader, extractStepKeywords, resetBankScanCache, createEmptyScanResult } from './screen-reader';
import { fetchPlayerQuestsFromApi } from './player-api';
import type { ScreenReaderConfig } from './screen-reader';

const isDev = !app.isPackaged;
export const APP_VERSION = 'v0.7.3-GAME-FIX';
const DEV_PORT = 5174;

let mainWindow: BrowserWindow | null = null;
let gameTracker: GameWindowTracker | null = null;
let screenReaderTimer: ReturnType<typeof setInterval> | null = null;
let screenReaderConfig: ScreenReaderConfig | null = null;

const SCREEN_READER_INTERVAL_MS = 1500;

function getDataDir(): string {
  return path.join(app.getPath('userData'), 'quest-data');
}

function ensureDataDir(): void {
  const dir = getDataDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 520,
    height: 700,
    minWidth: 420,
    minHeight: 520,
    title: `RS3 Quest Helper V2 ${APP_VERSION}`,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: false,
    hasShadow: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL(`http://localhost:${DEV_PORT}`);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    stopScreenReader();
    clearGameHighlights();
    gameTracker?.detach();
    mainWindow = null;
    gameTracker = null;
  });

  gameTracker = new GameWindowTracker(mainWindow);
}

function stopScreenReader(): void {
  if (screenReaderTimer) {
    clearInterval(screenReaderTimer);
    screenReaderTimer = null;
  }
  screenReaderConfig = null;
}

function startScreenReader(config: ScreenReaderConfig): void {
  stopScreenReader();
  resetBankScanCache();
  screenReaderConfig = {
    ...config,
    stepKeywords: config.stepKeywords.length > 0
      ? config.stepKeywords
      : extractStepKeywords(config.currentStepText),
  };

  const runScan = async () => {
    if (!mainWindow || mainWindow.isDestroyed() || !screenReaderConfig) return;

    const cached = gameTracker?.getLastGameInfo();
    const gameInfo = cached?.found ? cached : await findGameWindow();

    if (!gameInfo.found || !gameInfo.bounds) {
      mainWindow.webContents.send('screen-reader:result', createEmptyScanResult(null));
      return;
    }

    try {
      const result = await scanGameScreen(gameInfo, screenReaderConfig);
      if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.send('screen-reader:result', result);
      }
    } catch {
      if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.send('screen-reader:result', createEmptyScanResult(gameInfo.bounds));
      }
    }
  };

  runScan();
  screenReaderTimer = setInterval(runScan, SCREEN_READER_INTERVAL_MS);
}

app.whenReady().then(() => {
  ensureDataDir();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopScreenReader();
  clearGameHighlights();
  disposeScreenReader();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('window:close', () => {
  mainWindow?.close();
});

ipcMain.handle('window:toggle-always-on-top', (_event, value: boolean) => {
  mainWindow?.setAlwaysOnTop(value);
  return value;
});

ipcMain.handle('window:set-opacity', (_event, opacity: number) => {
  mainWindow?.setOpacity(opacity);
});

ipcMain.handle('window:set-size', (_event, width: number, height: number) => {
  if (!mainWindow) return;
  mainWindow.setSize(Math.max(420, width), Math.max(520, height));
});

ipcMain.handle('shell:open-external', (_event, url: string) => {
  shell.openExternal(url);
});

ipcMain.handle('storage:read', (_event, filename: string) => {
  ensureDataDir();
  const filePath = path.join(getDataDir(), filename);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
});

ipcMain.handle('storage:write', (_event, filename: string, data: unknown) => {
  ensureDataDir();
  const filePath = path.join(getDataDir(), filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return true;
});

ipcMain.handle('storage:read-bundled', (_event, filename: string) => {
  const bundledPath = isDev
    ? path.join(__dirname, '..', 'data', filename)
    : path.join(process.resourcesPath, 'data', filename);
  if (!fs.existsSync(bundledPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(bundledPath, 'utf-8'));
  } catch {
    return null;
  }
});

// Game window attach
ipcMain.handle('game:find', async () => {
  return findGameWindow();
});

ipcMain.handle('game:attach', async () => {
  if (!gameTracker) return { attached: false };
  await gameTracker.attach();
  return { attached: true, game: gameTracker.getLastGameInfo() };
});

ipcMain.handle('game:detach', async () => {
  gameTracker?.detach();
  return { attached: false };
});

ipcMain.handle('game:status', async () => {
  return {
    attached: gameTracker?.isAttached() ?? false,
    game: gameTracker?.getLastGameInfo() ?? null,
  };
});

// Screen reader
ipcMain.handle('screen-reader:start', async (_event, config: ScreenReaderConfig) => {
  startScreenReader(config);
  return true;
});

ipcMain.handle('screen-reader:stop', async () => {
  stopScreenReader();
  return true;
});

ipcMain.handle('player:fetch-quests', async (_event, rsn: string) => {
  return fetchPlayerQuestsFromApi(rsn);
});

ipcMain.handle('highlight:update', async (_event, config: HighlightConfig) => {
  const game = await findGameWindow();
  if (!game.found || !game.bounds) {
    clearGameHighlights();
    return { ok: false, reason: 'RS3 window not found' };
  }

  const plan = buildHighlightPlan({
    mode: config.mode,
    debugOverlay: config.debugOverlay,
    gameBounds: game.bounds,
    targets: config.targets,
    inventoryItems: config.inventoryItems,
    useOnPairs: config.useOnPairs,
    dialogueNext: config.dialogueNext,
    inventorySlots: config.inventorySlots,
    inventoryCalibration: config.inventoryCalibration,
    ocrBoxes: config.ocrDebugBoxes,
  });

  renderHighlightPlan(plan, game.bounds);
  return { ok: true, debugLog: plan?.debugLog ?? [] };
});

ipcMain.handle('highlight:clear', async () => {
  clearGameHighlights();
  return { ok: true };
});

ipcMain.handle('calibration:start', async () => {
  return openCalibrationOverlay();
});

ipcMain.on('calibration:result', (_event, cal) => {
  resolveCalibration(cal);
});

ipcMain.handle('calibration:cancel', async () => {
  closeCalibrationOverlay();
  resolveCalibration(null);
  return { ok: true };
});
