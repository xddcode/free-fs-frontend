/**
 * Electron 持久化存储适配器
 * 使用 electron-store 在主进程中存储数据
 */

import { StateStorage } from 'zustand/middleware';

// 检测是否在 Electron 环境中
const isElectron = typeof window !== 'undefined' && 
                   typeof (window as any).electron !== 'undefined' &&
                   typeof (window as any).electron.store !== 'undefined';

/**
 * Electron Store 适配器
 * 通过 IPC 与主进程通信进行数据持久化
 */
export const electronStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (!isElectron) {
      // 降级到 localStorage
      return localStorage.getItem(name);
    }
    
    try {
      const value = await (window as any).electron.store.get(name);
      return value ? JSON.stringify(value) : null;
    } catch (error) {
      console.error(`Failed to get item ${name}:`, error);
      return null;
    }
  },
  
  setItem: async (name: string, value: string): Promise<void> => {
    if (!isElectron) {
      // 降级到 localStorage
      localStorage.setItem(name, value);
      return;
    }
    
    try {
      await (window as any).electron.store.set(name, JSON.parse(value));
    } catch (error) {
      console.error(`Failed to set item ${name}:`, error);
    }
  },
  
  removeItem: async (name: string): Promise<void> => {
    if (!isElectron) {
      // 降级到 localStorage
      localStorage.removeItem(name);
      return;
    }
    
    try {
      await (window as any).electron.store.delete(name);
    } catch (error) {
      console.error(`Failed to remove item ${name}:`, error);
    }
  },
};

/**
 * 内存存储适配器（不持久化）
 */
const memoryStorage = new Map<string, string>();

export const memoryStorageAdapter: StateStorage = {
  getItem: (name: string): string | null => {
    return memoryStorage.get(name) || null;
  },
  setItem: (name: string, value: string): void => {
    memoryStorage.set(name, value);
  },
  removeItem: (name: string): void => {
    memoryStorage.delete(name);
  },
};
