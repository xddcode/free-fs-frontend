import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { login, getUserInfo, getTransferSetting } from "@/api/user";
import { useAuthStore, useUserStore } from "@/stores";
import { toast } from "@/components/ui/toast";
import type { AuthMode } from "./auth-container";

interface LoginFormProps {
  onSwitchMode: (mode: AuthMode) => void;
}

export function LoginForm({ onSwitchMode }: LoginFormProps) {
  const navigate = useNavigate();
  const setToken = useAuthStore(state => state.setToken);
  const setInfo = useUserStore(state => state.setInfo);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      // 1. 调用登录接口（失败会被拦截器处理并抛异常）
      const response = await login({
        username,
        password,
        isRemember: rememberMe,
      });
      
      // 2. 提取 token（拦截器已确保 code=200 才会到这里）
      const { accessToken } = (response.data as any).data;
      setToken(accessToken, rememberMe);
      
      // 3. 等待 token 保存完成
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 4. 获取用户信息
      const userInfoResponse = await getUserInfo();
      const userData = (userInfoResponse.data as any).data;
      setInfo(userData);
      
      // 5. 加载传输设置（失败不影响登录）
      try {
        const transferResponse = await getTransferSetting();
        const transferData = (transferResponse.data as any).data;
        setInfo({ transferSetting: transferData });
      } catch (error) {
        console.error("加载传输设置失败:", error);
      }
      
      // 6. 显示成功提示并跳转
      toast.success("登录成功！", {
        description: `欢迎回来，${userData.nickname || userData.username || username}！`,
        duration: 2000,
      });
      
      setTimeout(() => {
        navigate("/");
      }, 500);
      
    } catch (err: any) {
      console.error("登录失败:", err);
      // 拦截器已经显示了错误提示
      if (!err.isErrorShown) {
        setError(err.message || "登录失败");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">登录</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          输入您的用户名和密码以登录
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-2">
            用户名
          </label>
          <Input
            id="username"
            type="text"
            placeholder="请输入用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium">
              密码
            </label>
            <button
              type="button"
              onClick={() => onSwitchMode("forgot-password")}
              className="text-sm text-primary hover:underline"
            >
              忘记密码？
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label
            htmlFor="remember"
            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            记住我
          </label>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              登录中...
            </span>
          ) : (
            "登录"
          )}
        </Button>
      </div>

      <div className="text-center">
        <span className="text-sm text-muted-foreground">还没有账号？</span>
        <button
          type="button"
          onClick={() => onSwitchMode("register")}
          className="ml-1 text-sm text-primary hover:underline"
        >
          立即注册
        </button>
      </div>
    </form>
  );
}
