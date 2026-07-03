import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import fs from 'fs';

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

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
    width: 380,
    height: 620,
    minWidth: 320,
    minHeight: 400,
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
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
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
