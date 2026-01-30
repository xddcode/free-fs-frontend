import LoginForm from './components/LoginForm';
import { AnimatedBeamDemo } from './components/AnimatedBeamDemo';

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background">
      {/* 左侧登录表单 */}
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-background">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* 右侧品牌展示 */}
      <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden bg-muted p-12">
        {/* 顶部标语 */}
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-5xl font-bold tracking-wider text-foreground">
            Free Fs
          </h2>
          <p className="text-lg tracking-wide text-muted-foreground">自由云存储系统</p>
        </div>

        {/* 动画连接效果 */}
        <div className="flex items-center justify-center w-full max-w-3xl mb-16">
          <AnimatedBeamDemo />
        </div>

        {/* 底部特性标签 */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="px-4 py-2 rounded-full bg-background/60 backdrop-blur-sm border border-border">
            安全加密
          </span>
          <span className="px-4 py-2 rounded-full bg-background/60 backdrop-blur-sm border border-border">
            高效传输
          </span>
          <span className="px-4 py-2 rounded-full bg-background/60 backdrop-blur-sm border border-border">
            便捷管理
          </span>
        </div>
      </div>
    </div>
  );
}
