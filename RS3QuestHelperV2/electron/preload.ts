import { contextBridge, ipcRenderer } from 'electron';

const api = {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  close: () => ipcRenderer.invoke('window:close'),
  toggleAlwaysOnTop: (value: boolean) => ipcRenderer.invoke('window:toggle-always-on-top', value),
  setOpacity: (opacity: number) => ipcRenderer.invoke('window:set-opacity', opacity),
  setWindowSize: (width: number, height: number) => ipcRenderer.invoke('window:set-size', width, height),
  openExternal: (url: string) => ipcRenderer.invoke('shell:open-external', url),
  storageRead: <T>(filename: string) => ipcRenderer.invoke('storage:read', filename),
  storageWrite: (filename: string, data: unknown) =>
    ipcRenderer.invoke('storage:write', filename, data),
  storageReadBundled: <T>(filename: string) =>
    ipcRenderer.invoke('storage:read-bundled', filename),
  gameFind: () => ipcRenderer.invoke('game:find'),
  gameAttach: () => ipcRenderer.invoke('game:attach'),
  gameDetach: () => ipcRenderer.invoke('game:detach'),
  gameStatus: () => ipcRenderer.invoke('game:status'),
  screenReaderStart: (config: unknown) => ipcRenderer.invoke('screen-reader:start', config),
  screenReaderStop: () => ipcRenderer.invoke('screen-reader:stop'),
  onScreenReaderResult: (callback: (result: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, result: unknown) => callback(result);
    ipcRenderer.on('screen-reader:result', handler);
    return () => ipcRenderer.removeListener('screen-reader:result', handler);
  },
  fetchPlayerQuests: (rsn: string) => ipcRenderer.invoke('player:fetch-quests', rsn),
  updateHighlights: (config: unknown) => ipcRenderer.invoke('highlight:update', config),
  clearHighlights: () => ipcRenderer.invoke('highlight:clear'),
  startInventoryCalibration: () => ipcRenderer.invoke('calibration:start'),
  cancelInventoryCalibration: () => ipcRenderer.invoke('calibration:cancel'),
};

contextBridge.exposeInMainWorld('electronAPI', api);
