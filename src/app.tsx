import { RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { router } from "@/router";
import { AuthProvider } from "@/contexts/auth-context";
import { NavigationProgress } from "@/components/navigation-progress";
import { useSSEConnection } from "@/hooks/useSSEConnection";
import { useUploadGuard } from "@/hooks/useUploadGuard";

// SSE 初始化组件（必须在 AuthProvider 内部）
function SSEInitializer() {
  useSSEConnection();
  useUploadGuard(); // 添加上传保护
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <SSEInitializer />
      <NavigationProgress />
      <RouterProvider router={router} />
      <Toaster />
    </AuthProvider>
  );
}
