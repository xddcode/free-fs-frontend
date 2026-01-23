import LoginForm from './components/LoginForm';

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* 左侧登录表单 */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* 右侧品牌展示 */}
      <div className="brand-background relative hidden lg:block overflow-hidden">
        {/* 冒泡动画元素 */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`bubble bubble-${i + 1}`} />
          ))}
        </div>

        {/* Logo容器 */}
        <div className="relative flex h-full flex-col items-center justify-center p-12">
          {/* Logo SVG */}
          <div className="brand-logo-wrapper mb-12">
            <img src="/logo.svg" alt="Logo" className="brand-logo" />
          </div>

          {/* 文字信息 */}
          <div className="relative z-10 text-center">
            <h2 className="mb-3 text-5xl font-bold tracking-wider text-white">
              Free Fs
            </h2>
            <p className="text-sm tracking-widest text-blue-200">自由云存储</p>
          </div>
        </div>
      </div>
    </div>
  );
}
