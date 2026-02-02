import { useEffect, useRef } from 'react';
import { useTransferStore } from '@/store/transfer';
import { useAuth } from '@/contexts/auth-context';

/**
 * SSE 连接 Hook
 * 自动管理 SSE 连接的生命周期
 * 注意：必须在 AuthProvider 内部使用
 */
export function useSSEConnection() {
  const { user, isAuthenticated } = useAuth();
  const { initSSE, disconnectSSE, sseConnected } = useTransferStore();
  const isInitializedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // 如果已经为当前用户初始化过，跳过
      if (isInitializedRef.current && userIdRef.current === user.id) {
        return;
      }

      initSSE(user.id);
      isInitializedRef.current = true;
      userIdRef.current = user.id;
    }

    return () => {
      // 只在用户登出或组件真正卸载时断开
      if (!isAuthenticated || !user?.id) {
        disconnectSSE();
        isInitializedRef.current = false;
        userIdRef.current = null;
      }
    };
  }, [isAuthenticated, user?.id]);

  return { sseConnected };
}
