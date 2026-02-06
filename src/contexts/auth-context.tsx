import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import type { UserInfo } from '@/types/user'
import { getActiveStoragePlatforms } from '@/api/storage'
import {
  setToken as saveToken,
  clearToken as removeToken,
  getToken,
} from '@/utils/auth'

interface AuthContextType {
  isAuthenticated: boolean
  user: UserInfo | null
  token: string | null
  login: (
    token: string,
    userInfo: UserInfo,
    remember?: boolean
  ) => Promise<void>
  logout: () => void
  updateUser: (userInfo: UserInfo) => void
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

  // 初始化时检查本地存储的认证信息
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = getToken()

        if (storedToken) {
          // 从 Zustand store 读取用户信息
          const { useUserStore } = await import('@/store/user')
          const userStore = useUserStore.getState()

          if (userStore.id) {
            setToken(storedToken)
            setUser({
              id: userStore.id,
              username: userStore.username,
              nickname: userStore.nickname,
              email: userStore.email,
              avatar: userStore.avatar,
              status: userStore.status,
            })
            setIsAuthenticated(true)
          }

          // 获取当前启用的存储平台配置
          try {
            const activePlatforms = await getActiveStoragePlatforms()
            if (activePlatforms && activePlatforms.length > 0) {
              // 找到已启用的平台
              const enabledPlatform = activePlatforms.find((p) => p.isEnabled)
              if (enabledPlatform) {
                localStorage.setItem(
                  'current-storage-platform',
                  JSON.stringify({
                    settingId: enabledPlatform.settingId,
                    platformName: enabledPlatform.platformName,
                  })
                )
              }
            }
          } catch (error) {
            console.error('获取存储平台配置失败:', error)
            // 不影响登录流程
          }
        }
      } catch (error) {
        console.error('初始化认证信息失败:', error)
        // 清除可能损坏的数据
        removeToken()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (
    accessToken: string,
    userInfo: UserInfo,
    remember = false
  ) => {
    try {
      // 保存 token（使用 auth.ts 的方法）
      saveToken(accessToken, remember)
      setToken(accessToken)
      setUser(userInfo)
      setIsAuthenticated(true)

      // 使用 Zustand store 统一管理用户信息和传输设置
      const { useUserStore } = await import('@/store/user')
      const userStore = useUserStore.getState()
      userStore.setUserInfo(userInfo)
      await userStore.loadTransferSetting()

      // 获取当前启用的存储平台配置
      try {
        const activePlatforms = await getActiveStoragePlatforms()
        if (activePlatforms && activePlatforms.length > 0) {
          // 找到已启用的平台
          const enabledPlatform = activePlatforms.find((p) => p.isEnabled)
          if (enabledPlatform) {
            localStorage.setItem(
              'current-storage-platform',
              JSON.stringify({
                settingId: enabledPlatform.settingId,
                platformName: enabledPlatform.platformName,
              })
            )
          }
        }
      } catch (error) {
        console.error('获取存储平台配置失败:', error)
        // 不影响登录流程
      }
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)

    // 清除所有存储的认证信息
    removeToken()
    localStorage.removeItem('current-storage-platform')

    // 清除 Zustand store
    import('@/store/user').then(({ useUserStore }) => {
      useUserStore.getState().clearUserInfo()
    })

    // 跳转到登录页
    window.location.hash = '#/login'
  }

  const updateUser = (userInfo: UserInfo) => {
    setUser(userInfo)

    // 同步更新 Zustand store
    import('@/store/user').then(({ useUserStore }) => {
      useUserStore.getState().setUserInfo(userInfo)
    })
  }

  const value: AuthContextType = {
    isAuthenticated,
    user,
    token,
    login,
    logout,
    updateUser,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
