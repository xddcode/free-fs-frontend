/**
 * Electron API 类型定义
 * 扩展 Window 接口以支持 Electron IPC
 */

export interface ElectronStore {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
  delete: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  has: (key: string) => Promise<boolean>;
}

export interface ElectronAPI {
  store: ElectronStore;
  // 可以添加其他 Electron API
  platform: string;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
