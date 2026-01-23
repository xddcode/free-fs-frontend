import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserInfo } from '@/types/user';
import { setToken as saveToken, clearToken as removeToken, getToken } from '@/utils/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  login: (token: string, userInfo: UserInfo, remember?: boolean) => Promise<void>;
  logout: () => void;
  updateUser: (userInfo: UserInfo) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时检查本地存储的认证信息
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = getToken();
        const storedUser = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
        
        if (storedToken && storedUser) {
          const userInfo = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(userInfo);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('初始化认证信息失败:', error);
        // 清除可能损坏的数据
        removeToken();
        localStorage.removeItem('userInfo');
        sessionStorage.removeItem('userInfo');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (accessToken: string, userInfo: UserInfo, remember = false) => {
    try {
      // 保存 token（使用 auth.ts 的方法）
      saveToken(accessToken, remember);
      setToken(accessToken);
      setUser(userInfo);
      setIsAuthenticated(true);
      
      // 根据remember参数决定存储位置
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('userInfo', JSON.stringify(userInfo));
      
      // 清除另一个存储中的数据
      if (remember) {
        sessionStorage.removeItem('userInfo');
      } else {
        localStorage.removeItem('userInfo');
      }
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    // 清除所有存储的认证信息
    removeToken();
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('userInfo');
    
    // 跳转到登录页
    window.location.hash = '#/login';
  };

  const updateUser = (userInfo: UserInfo) => {
    setUser(userInfo);
    
    // 更新存储的用户信息
    const storage = localStorage.getItem('accessToken') ? localStorage : sessionStorage;
    storage.setItem('userInfo', JSON.stringify(userInfo));
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    token,
    login,
    logout,
    updateUser,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}