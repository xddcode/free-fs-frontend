import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, Key } from "lucide-react";
import { sendForgetPasswordCode, updateForgetPassword } from "@/api/user";
import { toast } from "@/components/ui/toast";
import type { AuthMode } from "./auth-container";

interface ForgotPasswordFormProps {
  onSwitchMode: (mode: AuthMode) => void;
}

type Step = "email" | "verify" | "reset";

export function ForgotPasswordForm({ onSwitchMode }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 发送验证码
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setErrors({ email: "请输入邮箱地址" });
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "请输入有效的邮箱地址" });
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      await sendForgetPasswordCode(email);
      toast.success("验证码已发送", {
        description: "请查看您的邮箱",
        duration: 3000,
      });
      
      setStep("verify");
      startCountdown();
    } catch (err: any) {
      console.error("发送验证码失败:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 重置密码
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!verificationCode.trim()) {
      newErrors.code = "请输入验证码";
    }
    
    if (!newPassword) {
      newErrors.password = "请输入新密码";
    } else if (newPassword.length < 6) {
      newErrors.password = "密码至少需要6个字符";
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "请确认新密码";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "两次输入的密码不一致";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      await updateForgetPassword({
        mail: email,
        code: verificationCode,
        newPassword,
        confirmPassword,
      });
      
      toast.success("密码重置成功！", {
        description: "请使用新密码登录",
        duration: 3000,
      });
      
      setTimeout(() => {
        onSwitchMode("login");
      }, 1000);
    } catch (err: any) {
      console.error("重置密码失败:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 开始倒计时
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 重新发送验证码
  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    try {
      await sendForgetPasswordCode(email);
      toast.success("验证码已重新发送");
      startCountdown();
    } catch (err: any) {
      console.error("重新发送验证码失败:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleSendCode} className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">忘记密码</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          输入您的邮箱地址，我们将发送验证码给您
        </p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          邮箱地址
        </label>
        <Input
          id="email"
          type="email"
          placeholder="请输入您的邮箱地址"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
          }}
          disabled={isLoading}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            发送中...
          </span>
        ) : (
          "发送验证码"
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => onSwitchMode("login")}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-3 w-3" />
          返回登录
        </button>
      </div>
    </form>
  );

  const renderVerifyStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Key className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">重置密码</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          我们已向 <span className="font-medium">{email}</span> 发送了验证码
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="code" className="block text-sm font-medium mb-2">
            验证码
          </label>
          <div className="flex gap-2">
            <Input
              id="code"
              type="text"
              placeholder="请输入6位验证码"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value);
                if (errors.code) setErrors(prev => ({ ...prev, code: "" }));
              }}
              disabled={isLoading}
              className={errors.code ? "border-destructive" : ""}
              maxLength={6}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleResendCode}
              disabled={countdown > 0 || isLoading}
              className="whitespace-nowrap"
            >
              {countdown > 0 ? `${countdown}s` : "重发"}
            </Button>
          </div>
          {errors.code && (
            <p className="mt-1 text-sm text-destructive">{errors.code}</p>
          )}
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
            新密码
          </label>
          <Input
            id="newPassword"
            type="password"
            placeholder="请输入新密码"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
            }}
            disabled={isLoading}
            className={errors.password ? "border-destructive" : ""}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
            确认新密码
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: "" }));
            }}
            disabled={isLoading}
            className={errors.confirmPassword ? "border-destructive" : ""}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            重置中...
          </span>
        ) : (
          "重置密码"
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setStep("email")}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-3 w-3" />
          返回上一步
        </button>
      </div>
    </form>
  );

  return step === "email" ? renderEmailStep() : renderVerifyStep();
}