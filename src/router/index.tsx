import { useAuth } from '@/contexts/auth-context'
import FileManagerPage from '@/pages/files'
import HomePage from '@/pages/home'
import LoginPage from '@/pages/login'
import { Settings } from '@/pages/settings'
import { SettingsAccount } from '@/pages/settings/account'
import { SettingsAppearance } from '@/pages/settings/appearance'
import { SettingsProfile } from '@/pages/settings/profile'
import { SettingsTransfer } from '@/pages/settings/transfer'
import SharePage from '@/pages/share'
import StoragePage from '@/pages/storage'
import TransferPage from '@/pages/transfer'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'

// 受保护的路由组件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>加载中...</div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to='/login' replace />
}

// 带布局的路由包装器
function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/s/:shareToken',
    element: <SharePage />,
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
        <TransferPage />
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
        path: 'account',
        element: <SettingsAccount />,
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
        <div className='flex h-screen items-center justify-center'>
          <p className='text-muted-foreground'>个人资料页面开发中...</p>
        </div>
      </LayoutWrapper>
    ),
  },
  {
    path: '*',
    element: <Navigate to='/' replace />,
  },
])
