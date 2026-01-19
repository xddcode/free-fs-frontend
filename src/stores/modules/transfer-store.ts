/**
 * 传输设置状态管理
 * 管理文件上传下载的配置和状态
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { electronStorage } from '../storage';
import type { TransferSetting } from '@/types/modules/transfer-setting';

export interface TransferTask {
  id: string;
  name: string;
  type: 'upload' | 'download';
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  size: number;
  speed: number;
  error?: string;
  createdAt: string;
}

export interface TransferState {
  // 传输设置
  settings: TransferSetting;
  
  // 传输任务
  tasks: TransferTask[];
  
  // 统计信息
  stats: {
    totalUploaded: number;
    totalDownloaded: number;
    uploadSpeed: number;
    downloadSpeed: number;
  };
  
  // 操作
  updateSettings: (settings: Partial<TransferSetting>) => void;
  resetSettings: () => void;
  addTask: (task: TransferTask) => void;
  updateTask: (id: string, updates: Partial<TransferTask>) => void;
  removeTask: (id: string) => void;
  clearCompletedTasks: () => void;
  clearAllTasks: () => void;
  updateStats: (stats: Partial<TransferState['stats']>) => void;
}

const defaultSettings: TransferSetting = {
  maxUploadSpeed: 0, // 0 表示不限速
  maxDownloadSpeed: 0,
  autoRetry: true,
  maxRetryCount: 3,
  chunkSize: 1024, // 1MB
  concurrentUploads: 3,
  concurrentDownloads: 3,
};

const defaultStats: TransferState['stats'] = {
  totalUploaded: 0,
  totalDownloaded: 0,
  uploadSpeed: 0,
  downloadSpeed: 0,
};

export const useTransferStore = create<TransferState>()(
  persist(
    (set, get) => ({
      // 初始状态
      settings: defaultSettings,
      tasks: [],
      stats: defaultStats,
      
      // 更新设置
      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },
      
      // 重置设置
      resetSettings: () => {
        set({ settings: defaultSettings });
      },
      
      // 添加任务
      addTask: (task) => {
        set((state) => ({
          tasks: [task, ...state.tasks],
        }));
      },
      
      // 更新任务
      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },
      
      // 移除任务
      removeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },
      
      // 清除已完成的任务
      clearCompletedTasks: () => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.status !== 'completed'),
        }));
      },
      
      // 清除所有任务
      clearAllTasks: () => {
        set({ tasks: [] });
      },
      
      // 更新统计信息
      updateStats: (stats) => {
        set((state) => ({
          stats: { ...state.stats, ...stats },
        }));
      },
    }),
    {
      name: 'transfer-storage',
      storage: createJSONStorage(() => electronStorage),
      // 持久化设置和统计信息，不持久化任务列表
      partialize: (state) => ({
        settings: state.settings,
        stats: state.stats,
      }),
    }
  )
);
