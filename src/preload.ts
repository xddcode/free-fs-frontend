/**
 * Preload Script
 * 在渲染进程中暴露安全的 Electron API
 */

import { contextBridge, ipcRenderer } from 'electron';

// 暴露 electron-store API
contextBridge.exposeInMainWorld('electron', {
  store: {
    get: (key: string) => ipcRenderer.invoke('store:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('store:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('store:delete', key),
    clear: () => ipcRenderer.invoke('store:clear'),
    has: (key: string) => ipcRenderer.invoke('store:has', key),
  },
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
});
