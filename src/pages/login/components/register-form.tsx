import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Check } from "lucide-react";
import { register } from "@/api/user";
import { toast } from "@/components/ui/toast";
import type { AuthMode } from "./auth-container";

interface RegisterFormProps {
  onSwitchMode: (mode: AuthMode) => void;
}

export function RegisterForm({ onSwitchMode }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "用户名不能为空";
    } else if (formData.username.length < 3) {
      newErrors.username = "用户名至少需要3个字符";
    }

    if (!formData.email.trim()) {
      newErrors.email = "邮箱不能为空";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "请输入有效的邮箱地址";
    }

    if (!formData.password) {
      newErrors.password = "密码不能为空";
    } else if (formData.password.length < 6) {
      newErrors.password = "密码至少需要6个字符";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "请确认密码";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "两次输入的密码不一致";
    }

    if (!formData.nickname.trim()) {
      newErrors.nickname = "昵称不能为空";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        nickname: formData.nickname,
      });
      
      toast.success("注册成功！", {
        description: "请使用您的账号密码登录",
        duration: 3000,
      });
      
      // 注册成功后切换到登录页面
      setTimeout(() => {
        onSwitchMode("login");
      }, 1000);
    } catch (err: any) {
      console.error("注册失败:", err);
      // 错误已经在拦截器中显示
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">注册</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          创建您的账号以开始使用
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-2">
            用户名 <span className="text-destructive">*</span>
          </label>
          <Input
            id="username"
            type="text"
            placeholder="请输入用户名"
            value={formData.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            disabled={isLoading}
            className={errors.username ? "border-destructive" : ""}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-destructive">{errors.username}</p>
          )}
        </div>

        <div>
          <label htmlFor="nickname" className="block text-sm font-medium mb-2">
            昵称 <span className="text-destructive">*</span>
          </label>
          <Input
            id="nickname"
            type="text"
            placeholder="请输入昵称"
            value={formData.nickname}
            onChange={(e) => handleInputChange("nickname", e.target.value)}
            disabled={isLoading}
            className={errors.nickname ? "border-destructive" : ""}
          />
          {errors.nickname && (
            <p className="mt-1 text-sm text-destructive">{errors.nickname}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            邮箱 <span className="text-destructive">*</span>
          </label>
          <Input
            id="email"
            type="email"
            placeholder="请输入邮箱地址"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            disabled={isLoading}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            密码 <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="请输入密码"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              disabled={isLoading}
              className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
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
          {formData.password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded ${
                      i < passwordStrength
                        ? passwordStrength <= 2
                          ? "bg-destructive"
                          : passwordStrength <= 3
                          ? "bg-yellow-500"
                          : "bg-green-500"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                密码强度: {
                  passwordStrength <= 2 ? "弱" : 
                  passwordStrength <= 3 ? "中等" : "强"
                }
              </p>
            </div>
          )}
          {errors.password && (
            <p className="mt-1 text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
            确认密码 <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="请再次输入密码"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              disabled={isLoading}
              className={`pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <div className="mt-1 flex items-center gap-1 text-green-600">
              <Check className="h-3 w-3" />
              <span className="text-xs">密码匹配</span>
            </div>
          )}
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              注册中...
            </span>
          ) : (
            "注册"
          )}
        </Button>
      </div>

      <div className="text-center">
        <span className="text-sm text-muted-foreground">已有账号？</span>
        <button
          type="button"
          onClick={() => onSwitchMode("login")}
          className="ml-1 text-sm text-primary hover:underline"
        >
          立即登录
        </button>
      </div>
    </form>
  );
}