import { createHashRouter, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/login';
import HomePage from '@/pages/home';
import FileManagerPage from '@/pages/files';
import StoragePage from '@/pages/storage';
import { Settings } from '@/pages/settings';
import { SettingsProfile } from '@/pages/settings/profile';
import { SettingsAppearance } from '@/pages/settings/appearance';
import { SettingsTransfer } from '@/pages/settings/transfer';
import { AppLayout } from '@/components/layout/app-layout';
import { useAuth } from '@/contexts/auth-context';

// 受保护的路由组件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>;
  }
  
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
        <FileManagerPage />
      </LayoutWrapper>
    ),
  },
  {
    path: '/files/*',
    element: (
      <LayoutWrapper>
        <FileManagerPage />
      </LayoutWrapper>
    ),
  },
  {
    path: '/recent',
    element: (
      <LayoutWrapper>
        <FileManagerPage />
      </LayoutWrapper>
    ),
  },
  {
    path: '/starred',
    element: (
      <LayoutWrapper>
        <FileManagerPage />
      </LayoutWrapper>
    ),
  },
  {
    path: '/favorites',
    element: (
      <LayoutWrapper>
        <FileManagerPage />
      </LayoutWrapper>
    ),
  },
  {
    path: '/trash',
    element: (
      <LayoutWrapper>
        <FileManagerPage />
      </LayoutWrapper>
    ),
  },
  {
    path: '/shares',
    element: (
      <LayoutWrapper>
        <FileManagerPage />
      </LayoutWrapper>
    ),
  },
  {
    path: '/storage',
    element: (
      <LayoutWrapper>
        <StoragePage />
      </LayoutWrapper>
    ),
  },
  {
    path: '/transfer',
    element: (
      <LayoutWrapper>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">传输页面开发中...</p>
        </div>
      </LayoutWrapper>
    ),
  },
  {
    path: '/settings',
    element: (
      <LayoutWrapper>
        <Settings />
      </LayoutWrapper>
    ),
    children: [
      {
        index: true,
        element: <SettingsProfile />,
      },
      {
        path: 'appearance',
        element: <SettingsAppearance />,
      },
      {
        path: 'transfer',
        element: <SettingsTransfer />,
      },
    ],
  },
  {
    path: '/profile',
    element: (
      <LayoutWrapper>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">个人资料页面开发中...</p>
        </div>
      </LayoutWrapper>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);