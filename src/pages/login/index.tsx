import { AnimatedBeamDemo } from './components/AnimatedBeamDemo'
import LoginForm from './components/LoginForm'

export default function LoginPage() {
  return (
    <div className='grid min-h-svh bg-background lg:grid-cols-2'>
      {/* 左侧登录表单 */}
      <div className='flex flex-col gap-4 bg-background p-6 md:p-10'>
        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full max-w-xs'>
            <LoginForm />
          </div>
        </div>
      </div>

      {/* 右侧品牌展示 */}
      <div className='relative hidden flex-col items-center justify-center overflow-hidden bg-muted p-12 lg:flex'>
        {/* 顶部标语 */}
        <div className='mb-16 space-y-3 text-center'>
          <h2 className='text-5xl font-bold tracking-wider text-foreground'>
            Free Fs
          </h2>
          <p className='text-lg tracking-wide text-muted-foreground'>
            自由云存储系统
          </p>
        </div>

        {/* 动画连接效果 */}
        <div className='mb-16 flex w-full max-w-3xl items-center justify-center'>
          <AnimatedBeamDemo />
        </div>

        {/* 底部特性标签 */}
        <div className='flex items-center gap-4 text-sm text-muted-foreground'>
          <span className='rounded-full border border-border bg-background/60 px-4 py-2 backdrop-blur-sm'>
            安全加密
          </span>
          <span className='rounded-full border border-border bg-background/60 px-4 py-2 backdrop-blur-sm'>
            高效传输
          </span>
          <span className='rounded-full border border-border bg-background/60 px-4 py-2 backdrop-blur-sm'>
            便捷管理
          </span>
        </div>
      </div>
    </div>
  )
}
