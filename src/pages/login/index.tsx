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
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 overflow-hidden p-4 md:p-8">
      {/* 极客风点阵背景 */}
      <div 
        className="absolute inset-0 z-0" 
        style={{ 
          backgroundImage: `radial-gradient(#e2e8f0 1.5px, transparent 1.5px)`, 
          backgroundSize: '24px 24px' 
        }} 
      />

      {/* 装饰性背景光晕 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] z-0" />

      <div className="relative z-10 w-full max-w-5xl">
        <Card className="overflow-hidden border border-white/60 bg-white/85 backdrop-blur-xl shadow-[0_20px_60px_rgba(15,23,42,0.08)] rounded-3xl">
          <div className="grid md:grid-cols-2">
            {/* 左侧表单 */}
            <div className="p-6 md:p-10">
              <Suspense
                fallback={
                  <div className="h-[240px] flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                }
              >
                {renderContent()}
              </Suspense>
            </div>

            {/* 右侧视觉区（分屏动画） */}
            <div className="relative hidden md:flex items-center justify-center bg-slate-100/80">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at 50% 35%, rgba(59,130,246,0.10), transparent 55%)',
                }}
              />
              <div className="absolute inset-y-0 left-0 w-px bg-slate-200/80" />
              <div className="relative w-full max-w-sm opacity-80">
                <AnimatedBeamDemo />
              </div>
            </div>
          </div>
        </Card>

        {/* 底部信息 */}
        <div className="mt-8 flex flex-col items-center gap-3 text-xs text-slate-400">
          <div className="flex gap-4">
            <span className="hover:text-slate-600 cursor-pointer transition-colors">用户协议</span>
            <span className="hover:text-slate-600 cursor-pointer transition-colors">隐私政策</span>
            <a
              href="https://github.com/dromara/free-fs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-600 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://gitee.com/dromara/free-fs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-600 transition-colors"
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
              className="hover:text-slate-600 transition-colors"
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
