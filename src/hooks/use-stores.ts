/**
 * Store Hooks
 * 提供便捷的 hooks 组合和常用操作
 */

import { useEffect } from 'react';
import { useAuthStore, useUserStore, useTransferStore, useAppStore } from '@/stores';
import { getUserInfo, getTransferSetting } from '@/api/user';

/**
 * 初始化应用状态
 * 在应用启动时调用，用于恢复状态和设置监听
 */
export function useInitializeStores() {
  const { isAuthenticated, token } = useAuthStore();
  const { setInfo, username } = useUserStore();
  const { updateNetwork } = useAppStore();
  
  useEffect(() => {
    // 监听网络状态
    const handleOnline = () => updateNetwork({ isOnline: true });
    const handleOffline = () => updateNetwork({ isOnline: false });
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateNetwork]);
  
  useEffect(() => {
    // 如果已登录但没有用户信息，尝试获取
    if (isAuthenticated && token && !username) {
      const fetchUserInfo = async () => {
        try {
          const response = await getUserInfo();
          const userData = (response.data as any).data;
          setInfo(userData);
          
          // 同时加载传输设置
          try {
            const transferResponse = await getTransferSetting();
            const transferData = (transferResponse.data as any).data;
            setInfo({ transferSetting: transferData });
          } catch (error) {
            console.error('加载传输设置失败:', error);
          }
        } catch (error) {
          console.error('获取用户信息失败:', error);
          // Token 可能无效，拦截器会自动处理登出
        }
      };
      
      fetchUserInfo();
    }
  }, [isAuthenticated, token, username, setInfo]);
}

/**
 * 清除所有应用数据
 * 用于退出登录或重置应用
 */
export function useClearAllData() {
  const clearAuth = useAuthStore(state => state.clearAuth);
  const resetInfo = useUserStore(state => state.resetInfo);
  const clearAllTasks = useTransferStore(state => state.clearAllTasks);
  
  return () => {
    clearAuth();
    resetInfo();
    clearAllTasks();
    // 注意：不重置 app config，保留用户的应用偏好设置
  };
}

/**
 * 获取当前用户信息
 * 从 user store 获取
 */
export function useCurrentUser() {
  return useUserStore();
}

/**
 * 监听传输任务状态
 * 返回当前正在进行的任务数量和总进度
 */
export function useTransferStatus() {
  const tasks = useTransferStore(state => state.tasks);
  
  const runningTasks = tasks.filter(t => t.status === 'running');
  const totalProgress = tasks.length > 0
    ? tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length
    : 0;
  
  return {
    runningCount: runningTasks.length,
    totalCount: tasks.length,
    totalProgress,
    hasRunningTasks: runningTasks.length > 0,
  };
}

/**
 * 应用主题 hook
 * 结合用户偏好和系统主题
 */
export function useTheme() {
  const theme = useUserStore(state => state.preferences.theme);
  const updatePreferences = useUserStore(state => state.updatePreferences);
  
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);
  
  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    updatePreferences({ theme: newTheme });
  };
  
  return { theme, setTheme };
}

/**
 * 窗口控制 hook
 * 提供窗口最大化、最小化等操作
 */
export function useWindowControls() {
  const { isMaximized, isFullscreen } = useAppStore(state => state.window);
  const updateWindow = useAppStore(state => state.updateWindow);
  
  const toggleMaximize = () => {
    if (window.electron) {
      // 调用 Electron API
      updateWindow({ isMaximized: !isMaximized });
    }
  };
  
  const toggleFullscreen = () => {
    if (window.electron) {
      updateWindow({ isFullscreen: !isFullscreen });
    }
  };
  
  return {
    isMaximized,
    isFullscreen,
    toggleMaximize,
    toggleFullscreen,
  };
}
