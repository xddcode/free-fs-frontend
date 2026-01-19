import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserInfo } from '@/types/modules/user';

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
        const storedToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
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
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userInfo');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('userInfo');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (accessToken: string, userInfo: UserInfo, remember = false) => {
    try {
      setToken(accessToken);
      setUser(userInfo);
      setIsAuthenticated(true);
      
      // 根据remember参数决定存储位置
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('accessToken', accessToken);
      storage.setItem('userInfo', JSON.stringify(userInfo));
      
      // 如果选择记住我，清除sessionStorage中的数据
      if (remember) {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('userInfo');
      } else {
        // 如果不记住我，清除localStorage中的数据
        localStorage.removeItem('accessToken');
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('userInfo');
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