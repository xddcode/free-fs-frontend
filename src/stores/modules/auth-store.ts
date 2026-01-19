/**
 * 认证状态管理
 * 管理用户登录状态、token 等认证信息
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { electronStorage } from '../storage';

export interface AuthState {
  // 状态
  isAuthenticated: boolean;
  token: string | null;
  isRemember: boolean;
  
  // 操作
  setToken: (token: string, remember?: boolean) => void;
  clearAuth: () => void;
  setRemember: (remember: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 初始状态
      isAuthenticated: false,
      token: null,
      isRemember: false,
      
      // 设置 token
      setToken: (token, remember = false) => {
        set({
          isAuthenticated: true,
          token,
          isRemember: remember,
        });
      },
      
      // 清除认证信息
      clearAuth: () => {
        set({
          isAuthenticated: false,
          token: null,
          isRemember: false,
        });
      },
      
      // 设置记住我
      setRemember: (remember) => {
        set({ isRemember: remember });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => electronStorage),
      // 持久化策略
      partialize: (state) => {
        if (state.isRemember) {
          return {
            isAuthenticated: state.isAuthenticated,
            token: state.token,
            isRemember: state.isRemember,
          };
        } else {
          return {
            isAuthenticated: state.isAuthenticated,
            token: state.token,
            isRemember: false,
          };
        }
      },
    }
  )
);
