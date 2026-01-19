import { AuthContainer } from "./components/auth-container";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <AuthContainer />
          </div>
        </div>
      </div>
      <div className="brand-background relative hidden lg:block overflow-hidden">
        {/* 冒泡动画元素 */}
        <div className="absolute inset-0">
          <div className="bubble bubble-1" />
          <div className="bubble bubble-2" />
          <div className="bubble bubble-3" />
          <div className="bubble bubble-4" />
          <div className="bubble bubble-5" />
          <div className="bubble bubble-6" />
          <div className="bubble bubble-7" />
          <div className="bubble bubble-8" />
          <div className="bubble bubble-9" />
          <div className="bubble bubble-10" />
          <div className="bubble bubble-11" />
          <div className="bubble bubble-12" />
        </div>

        {/* Logo容器 */}
        <div className="relative flex h-full flex-col items-center justify-center p-12">
          {/* Logo图片 */}
          <div className="brand-logo-wrapper mb-12">
            <img
              src="/logo.svg"
              alt="Free Fs"
              width={224}
              height={224}
              className="brand-logo"
            />
          </div>

          {/* 文字信息 */}
          <div className="relative z-10 text-center max-w-lg">
            <h2 className="mb-3 text-5xl font-bold tracking-wider text-white">
              Free Fs
            </h2>
            <p className="text-sm tracking-widest text-slate-400 mb-8">
              自由云存储
            </p>
            
            {/* 产品口号 */}
            <div className="mt-8 pt-8 border-t border-slate-700/50">
              <p className="text-sm leading-relaxed text-slate-300/90">
                专为现代应用设计的文件管理方案
              </p>
              <p className="text-xs leading-relaxed text-slate-400/80 mt-3">
                提供高性能的存储服务，支持多云、本地与混合部署，
                <br />
                赋予开发者对数据的完全掌控
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
