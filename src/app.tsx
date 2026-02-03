import { RouterProvider, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { router } from "@/router";
import { AuthProvider } from "@/contexts/auth-context";
import { NavigationProgress } from "@/components/navigation-progress";
import { useSSEConnection } from "@/hooks/useSSEConnection";
import { useUploadGuard } from "@/hooks/useUploadGuard";
import { setLogoutCallback } from "@/api/request";
import { clearToken } from "@/utils/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// SSE 初始化组件（必须在 AuthProvider 内部）
function SSEInitializer() {
  useSSEConnection();
  useUploadGuard(); // 添加上传保护
  return null;
}

// 登录过期对话框组件
function LogoutDialog() {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    // 设置登录过期回调
    setLogoutCallback(() => {
      setShowLogoutDialog(true);
    });
  }, []);

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    clearToken();
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('userInfo');
    // 强制刷新页面并跳转到登录页
    window.location.href = '/login';
  };

  return (
    <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>登录已过期</AlertDialogTitle>
          <AlertDialogDescription>
            您的登录状态已过期，请重新登录以继续使用。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleLogoutConfirm}>
            返回登录
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SSEInitializer />
      <NavigationProgress />
      <RouterProvider router={router} />
      <Toaster />
      <LogoutDialog />
    </AuthProvider>
  );
}
