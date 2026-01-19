import { useLocation } from "react-router-dom";
import { AppLayout } from "./app-layout";

interface RootLayoutWrapperProps {
  children: React.ReactNode;
}

export function RootLayoutWrapper({ children }: RootLayoutWrapperProps) {
  const location = useLocation();
  
  // 不需要侧边栏的页面路径
  const noLayoutPages = ["/login", "/register"];
  const shouldShowLayout = !noLayoutPages.includes(location.pathname);

  if (shouldShowLayout) {
    return <AppLayout>{children}</AppLayout>;
  }

  return <>{children}</>;
}
