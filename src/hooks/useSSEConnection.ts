import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useTransferStore } from '@/store/transfer'
import { useWorkspaceStore } from '@/store/workspace'

/**
 * SSE 连接 Hook
 * 自动管理 SSE 连接的生命周期
 * 需要认证且工作空间已激活后才初始化
 */
export function useSSEConnection() {
  const { user, isAuthenticated } = useAuth()
  const { initSSE, disconnectSSE, sseConnected } = useTransferStore()
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)
  const currentRole = useWorkspaceStore((s) => s.currentRole)
  const isInitializedRef = useRef(false)
  const contextRef = useRef<string | null>(null)

  useEffect(() => {
    const contextKey = `${user?.id}:${currentWorkspaceId}`

    if (isAuthenticated && user?.id && currentWorkspaceId && currentRole) {
      if (isInitializedRef.current && contextRef.current === contextKey) {
        return
      }

      if (isInitializedRef.current) {
        disconnectSSE()
      }

      initSSE(user.id)
      isInitializedRef.current = true
      contextRef.current = contextKey
    }

    return () => {
      if (!isAuthenticated || !user?.id) {
        disconnectSSE()
        isInitializedRef.current = false
        contextRef.current = null
      }
    }
  }, [isAuthenticated, user?.id, currentWorkspaceId, currentRole])

  return { sseConnected }
}
