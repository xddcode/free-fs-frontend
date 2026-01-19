import { createHashRouter, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/login/page';
import HomePage from '@/pages/home/page';
import { AppLayout } from '@/components/layout/app-layout';
import { useAuthStore } from '@/stores';

// 受保护的路由组件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// 带布局的路由包装器
function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export const router = createHashRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <LayoutWrapper>
        <HomePage />
      </LayoutWrapper>
    ),
  },
  {
    path: '/files',
    element: (
      <LayoutWrapper>
        <div className="p-8">
          <h1 className="text-2xl font-bold">全部文件</h1>
          <p className="text-muted-foreground mt-2">文件列表页面开发中...</p>
        </div>
      </LayoutWrapper>
    ),
  },
  {
    path: '/recent',
    element: (
      <LayoutWrapper>
        <div className="p-8">
          <h1 className="text-2xl font-bold">最近使用</h1>
          <p className="text-muted-foreground mt-2">最近使用页面开发中...</p>
        </div>
      </LayoutWrapper>
    ),
  },
  {
    path: '/starred',
    element: (
      <LayoutWrapper>
        <div className="p-8">
          <h1 className="text-2xl font-bold">星标文件</h1>
          <p className="text-muted-foreground mt-2">星标文件页面开发中...</p>
        </div>
      </LayoutWrapper>
    ),
  },
  {
    path: '/trash',
    element: (
      <LayoutWrapper>
        <div className="p-8">
          <h1 className="text-2xl font-bold">回收站</h1>
          <p className="text-muted-foreground mt-2">回收站页面开发中...</p>
        </div>
      </LayoutWrapper>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);