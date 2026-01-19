import { RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { router } from "@/router";
import { useInitializeStores } from "@/hooks/use-stores";
import { AuthProvider } from "@/contexts/auth-context";
import "./index.css";

export default function App() {
  // 初始化 stores（监听网络状态等）
  useInitializeStores();
  
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AuthProvider>
  );
}
