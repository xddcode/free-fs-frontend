import { AuthProvider } from '@/contexts/auth-context'
import { router } from '@/router'
import { RouterProvider } from 'react-router-dom'
import { useSSEConnection } from '@/hooks/useSSEConnection'
import { useUploadGuard } from '@/hooks/useUploadGuard'
import { Toaster } from '@/components/ui/sonner'
import { NavigationProgress } from '@/components/navigation-progress'

// SSE 初始化组件（必须在 AuthProvider 内部）
function SSEInitializer() {
  useSSEConnection()
  useUploadGuard()
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <SSEInitializer />
      <NavigationProgress />
      <RouterProvider router={router} />
      <Toaster />
    </AuthProvider>
  )
}
