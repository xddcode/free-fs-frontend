/**
 * 用户信息状态管理
 * 管理用户详细信息、偏好设置等
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { electronStorage } from '../storage';
import type { SecurityLog } from '@/types/modules/user';
import type { TransferSetting } from '@/types/modules/transfer-setting';

export interface UserState {
  // 用户信息
  id?: string;
  username?: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  
  // 传输设置
  transferSetting?: TransferSetting;
  
  // 安全日志
  securityLogs: SecurityLog[];
  securityLogsTotal: number;
  
  // 用户偏好设置
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'zh-CN' | 'en-US';
    notifications: boolean;
  };
  
  // 操作
  setInfo: (partial: Partial<UserState>) => void;
  resetInfo: () => void;
  setSecurityLogs: (logs: SecurityLog[], total: number) => void;
  addSecurityLog: (log: SecurityLog) => void;
  updatePreferences: (preferences: Partial<UserState['preferences']>) => void;
}

const defaultPreferences: UserState['preferences'] = {
  theme: 'system',
  language: 'zh-CN',
  notifications: true,
};

const initialState = {
  id: undefined,
  username: undefined,
  nickname: undefined,
  avatar: undefined,
  email: undefined,
  status: undefined,
  createdAt: undefined,
  updatedAt: undefined,
  lastLoginAt: undefined,
  transferSetting: undefined,
  securityLogs: [],
  securityLogsTotal: 0,
  preferences: defaultPreferences,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...initialState,
      
      // 设置用户信息（支持部分更新）
      setInfo: (partial) => {
        set((state) => ({ ...state, ...partial }));
      },
      
      // 重置用户信息
      resetInfo: () => {
        set(initialState);
      },
      
      // 设置安全日志
      setSecurityLogs: (logs, total) => {
        set({ securityLogs: logs, securityLogsTotal: total });
      },
      
      // 添加安全日志
      addSecurityLog: (log) => {
        set((state) => ({
          securityLogs: [log, ...state.securityLogs],
          securityLogsTotal: state.securityLogsTotal + 1,
        }));
      },
      
      // 更新偏好设置
      updatePreferences: (preferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...preferences },
        }));
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => electronStorage),
      // 只持久化偏好设置和传输设置
      partialize: (state) => ({
        preferences: state.preferences,
        transferSetting: state.transferSetting,
      }),
    }
  )
);
