/// <reference types="../forge.env.d.ts" />

import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import Store from 'electron-store';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// 初始化 electron-store
const store = new Store({
  name: 'free-fs-storage',
  encryptionKey: 'your-encryption-key-here', // 生产环境请使用环境变量
});

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../../public/256x256.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // 安全起见，禁用 node 集成
      contextIsolation: true, // 启用上下文隔离
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// IPC handlers for electron-store
ipcMain.handle('store:get', (_event, key: string) => {
  return store.get(key);
});

ipcMain.handle('store:set', (_event, key: string, value: any) => {
  store.set(key, value);
});

ipcMain.handle('store:delete', (_event, key: string) => {
  store.delete(key);
});

ipcMain.handle('store:clear', () => {
  store.clear();
});

ipcMain.handle('store:has', (_event, key: string) => {
  return store.has(key);
});
