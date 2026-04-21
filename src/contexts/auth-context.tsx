import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react'
import type { UserInfo } from '@/types/user'
import { mergeUserInfo } from '@/utils/merge-user-info'
import { getActiveStoragePlatforms } from '@/api/storage'
import { workspaceApi } from '@/api/workspace'
import { useWorkspaceStore } from '@/store/workspace'
import {
  setToken as saveToken,
  clearToken as removeToken,
  getToken,
} from '@/utils/auth'

interface AuthContextType {
  isAuthenticated: boolean
  user: UserInfo | null
  token: string | null
  needsWorkspaceSetup: boolean
  login: (
    token: string,
    userInfo: UserInfo,
    remember?: boolean
  ) => Promise<void>
  logout: () => void
  updateUser: (patch: Partial<UserInfo>) => void
  /** 加载工作空间列表（不激活） */
  loadWorkspaces: () => Promise<boolean>
  /** 激活指定工作空间：设置 ID、加载角色权限、加载存储配置 */
  activateWorkspace: (workspaceId: string) => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [needsWorkspaceSetup, setNeedsWorkspaceSetup] = useState(false)

  const wsStore = useWorkspaceStore

  const loadStoragePlatform = async () => {
    try {
      const activePlatforms = await getActiveStoragePlatforms()
      const enabledPlatform = activePlatforms?.find((p) => p.isEnabled)
      if (enabledPlatform) {
        localStorage.setItem(
          'current-storage-platform',
          JSON.stringify({
            settingId: enabledPlatform.settingId,
            platformName: enabledPlatform.platformName,
          })
        )
      } else {
        localStorage.removeItem('current-storage-platform')
      }
    } catch (error) {
      localStorage.removeItem('current-storage-platform')
      console.error('获取存储平台配置失败:', error)
    }
  }

  const loadWorkspaces = useCallback(async (): Promise<boolean> => {
    try {
      const workspaces = await workspaceApi.list()
      wsStore.getState().setWorkspaces(workspaces)

      if (workspaces.length === 0) {
        setNeedsWorkspaceSetup(true)
        return false
      }

      setNeedsWorkspaceSetup(false)
      return true
    } catch (error) {
      console.error('加载工作空间列表失败:', error)
      return false
    }
  }, [])

  const activateWorkspace = useCallback(async (workspaceId: string) => {
    wsStore.getState().setCurrentWorkspaceId(workspaceId)
    localStorage.removeItem('current-storage-platform')

    const detail = await workspaceApi.getCurrent()
    wsStore.getState().setCurrentRole({
      roleCode: detail.roleCode,
      roleName: detail.roleName,
      permissions: detail.permissions,
    })

    await Promise.all([
      loadStoragePlatform(),
      import('@/store/user')
        .then(({ useUserStore }) => useUserStore.getState().loadTransferSetting())
        .catch(() => {}),
    ])
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = getToken()

        if (storedToken) {
          const { useUserStore } = await import('@/store/user')
          const userStore = useUserStore.getState()

          let userInfo: UserInfo | null = null

          try {
            const { userApi } = await import('@/api/user')
            userInfo = await userApi.getUserInfo()
            userStore.setUserInfo(userInfo)
          } catch {
            if (userStore.id) {
              userInfo = {
                id: userStore.id,
                username: userStore.username,
                nickname: userStore.nickname,
                email: userStore.email,
                avatar: userStore.avatar,
                status: userStore.status,
                createdAt: userStore.createdAt,
                updatedAt: userStore.updatedAt,
                lastLoginAt: userStore.lastLoginAt,
                isSetPassword: userStore.isSetPassword,
              }
            }
          }

          if (userInfo) {
            setToken(storedToken)
            setUser(userInfo)
            setIsAuthenticated(true)
            await loadWorkspaces()
          }
        }
      } catch (error) {
        console.error('初始化认证信息失败:', error)
        removeToken()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [loadWorkspaces])

  const login = useCallback(
    async (accessToken: string, userInfo: UserInfo, remember = false) => {
      try {
        saveToken(accessToken, remember)
        setToken(accessToken)
        setUser(userInfo)
        setIsAuthenticated(true)

        const { useUserStore } = await import('@/store/user')
        const userStore = useUserStore.getState()
        userStore.setUserInfo(userInfo)

        await loadWorkspaces()
      } catch (error) {
        console.error('登录失败:', error)
        throw error
      }
    },
    [loadWorkspaces]
  )

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    setNeedsWorkspaceSetup(false)

    removeToken()
    localStorage.removeItem('current-storage-platform')

    import('@/store/user').then(({ useUserStore }) => {
      useUserStore.getState().clearUserInfo()
    })

    wsStore.getState().clear()
  }, [])

  const updateUser = useCallback((patch: Partial<UserInfo>) => {
    setUser((prev) => {
      if (!prev) {
        return patch as UserInfo
      }
      const merged = mergeUserInfo(prev, patch)
      import('@/store/user').then(({ useUserStore }) => {
        useUserStore.getState().setUserInfo(merged)
      })
      return merged
    })
  }, [])

  const value = useMemo<AuthContextType>(
    () => ({
      isAuthenticated,
      user,
      token,
      needsWorkspaceSetup,
      login,
      logout,
      updateUser,
      loadWorkspaces,
      activateWorkspace,
      isLoading,
    }),
    [
      isAuthenticated,
      user,
      token,
      needsWorkspaceSetup,
      login,
      logout,
      updateUser,
      loadWorkspaces,
      activateWorkspace,
      isLoading,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
