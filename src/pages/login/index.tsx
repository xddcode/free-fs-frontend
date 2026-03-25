import React, { Suspense } from 'react';
import { Card } from "@/components/ui/card";
import { AnimatedBeamDemo } from "./components/AnimatedBeamDemo";
import LoginFormContent from "./components/LoginFormContent";
import RegisterFormContent from "./components/RegisterFormContent";
import ForgotPasswordContent from "./components/ForgotPasswordContent";
import { useSearchParams } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type') || 'login';

  const handleSwitchForm = (form: 'login' | 'register' | 'forgotPassword') => {
    const nextType = form === 'forgotPassword' ? 'forgot-password' : form;
    setSearchParams({ type: nextType });
  };

  const renderContent = () => {
    switch (type) {
      case 'register':
        return <RegisterFormContent onSwitchForm={handleSwitchForm} />;
      case 'forgot-password':
        return <ForgotPasswordContent onSwitchForm={handleSwitchForm} />;
      default:
        return <LoginFormContent onSwitchForm={handleSwitchForm} />;
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 p-4 md:p-8">
      {/* 极客风点阵背景 */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* 装饰性背景光晕 */}
      <div className="absolute top-1/2 left-1/2 z-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100/50 blur-[120px]" />

      <div className="relative z-10 w-full max-w-5xl">
        <Card className="gap-0 overflow-hidden rounded-3xl border border-white/60 bg-white/85 p-0 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="grid md:grid-cols-2">
            {/* 左侧表单 */}
            <div className="p-6 md:p-10">
              <Suspense
                fallback={
                  <div className="h-[240px] flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  </div>
                }
              >
                {renderContent()}
              </Suspense>
            </div>

            {/* 右侧视觉区（分屏动画）；需 p-0 否则 Card 默认 py-6 会在上下露出白边 */}
            <div className="relative hidden min-h-full items-center justify-center bg-linear-to-b from-sidebar-primary/12 via-muted/45 to-muted/25 dark:from-sidebar-primary/22 dark:via-muted/35 dark:to-muted/20 md:flex">
              <div
                className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent dark:from-primary/15"
                aria-hidden
              />
              <div className="absolute inset-y-0 left-0 w-px bg-border/70" />
              <div className="relative w-full max-w-sm opacity-80">
                <AnimatedBeamDemo />
              </div>
            </div>
          </div>
        </Card>

        {/* 底部信息 */}
        <div className="mt-8 flex flex-col items-center gap-3 text-xs text-slate-400">
          <div className="flex gap-4">
            <span className="cursor-pointer transition-colors hover:text-slate-600">
              用户协议
            </span>
            <span className="cursor-pointer transition-colors hover:text-slate-600">
              隐私政策
            </span>
            <a
              href="https://github.com/dromara/free-fs"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-slate-600"
            >
              GitHub
            </a>
            <a
              href="https://gitee.com/dromara/free-fs"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-slate-600"
            >
              Gitee
            </a>
          </div>
          <p>
            © 2026 Free Fs Project · Powered by{' '}
            <a
              href="https://gitee.com/xddcode"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-slate-600"
            >
              @xddcode
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
