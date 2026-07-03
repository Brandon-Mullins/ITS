import { contextBridge, ipcRenderer } from 'electron';

const api = {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  close: () => ipcRenderer.invoke('window:close'),
  toggleAlwaysOnTop: (value: boolean) => ipcRenderer.invoke('window:toggle-always-on-top', value),
  setOpacity: (opacity: number) => ipcRenderer.invoke('window:set-opacity', opacity),
  openExternal: (url: string) => ipcRenderer.invoke('shell:open-external', url),
  storageRead: <T>(filename: string) => ipcRenderer.invoke('storage:read', filename),
  storageWrite: (filename: string, data: unknown) =>
    ipcRenderer.invoke('storage:write', filename, data),
  storageReadBundled: <T>(filename: string) =>
    ipcRenderer.invoke('storage:read-bundled', filename),
};

contextBridge.exposeInMainWorld('electronAPI', api);
