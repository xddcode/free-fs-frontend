/**
 * 应用全局状态管理
 * 管理应用级别的配置和状态
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { electronStorage } from '../storage';

export interface AppState {
  // 应用配置
  config: {
    autoUpdate: boolean;
    startOnBoot: boolean;
    minimizeToTray: boolean;
    closeToTray: boolean;
  };
  
  // UI 状态
  ui: {
    sidebarCollapsed: boolean;
    sidebarWidth: number;
  };
  
  // 窗口状态
  window: {
    isMaximized: boolean;
    isFullscreen: boolean;
  };
  
  // 网络状态
  network: {
    isOnline: boolean;
    latency: number;
  };
  
  // 操作
  updateConfig: (config: Partial<AppState['config']>) => void;
  updateUI: (ui: Partial<AppState['ui']>) => void;
  updateWindow: (window: Partial<AppState['window']>) => void;
  updateNetwork: (network: Partial<AppState['network']>) => void;
  toggleSidebar: () => void;
  resetConfig: () => void;
}

const defaultConfig: AppState['config'] = {
  autoUpdate: true,
  startOnBoot: false,
  minimizeToTray: true,
  closeToTray: false,
};

const defaultUI: AppState['ui'] = {
  sidebarCollapsed: false,
  sidebarWidth: 240,
};

const defaultWindow: AppState['window'] = {
  isMaximized: false,
  isFullscreen: false,
};

const defaultNetwork: AppState['network'] = {
  isOnline: true,
  latency: 0,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始状态
      config: defaultConfig,
      ui: defaultUI,
      window: defaultWindow,
      network: defaultNetwork,
      
      // 更新配置
      updateConfig: (config) => {
        set((state) => ({
          config: { ...state.config, ...config },
        }));
      },
      
      // 更新 UI 状态
      updateUI: (ui) => {
        set((state) => ({
          ui: { ...state.ui, ...ui },
        }));
      },
      
      // 更新窗口状态
      updateWindow: (window) => {
        set((state) => ({
          window: { ...state.window, ...window },
        }));
      },
      
      // 更新网络状态
      updateNetwork: (network) => {
        set((state) => ({
          network: { ...state.network, ...network },
        }));
      },
      
      // 切换侧边栏
      toggleSidebar: () => {
        set((state) => ({
          ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed },
        }));
      },
      
      // 重置配置
      resetConfig: () => {
        set({ config: defaultConfig });
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => electronStorage),
      // 持久化配置和 UI 状态
      partialize: (state) => ({
        config: state.config,
        ui: state.ui,
      }),
    }
  )
);
