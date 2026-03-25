import { Code, Link2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function OpenSourceCard({ className }: { className?: string }) {
  return (
    <Card className={cn('gap-0 overflow-hidden py-0 shadow-sm', className)}>
      <CardHeader className='gap-0 border-b border-border/60 px-4 pb-3 pt-4'>
        <CardTitle className='text-base'>开源项目</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-4 px-4 pb-4 pt-3'>
        <p className='text-muted-foreground text-sm leading-relaxed'>
          Free Fs 是一款基于 Spring Boot 和 React
          构建的开源文件管理系统，欢迎大家交流学习。
        </p>
        <div className='flex flex-col gap-2'>
          <a
            href='https://gitee.com/dromara/free-fs'
            target='_blank'
            rel='noopener noreferrer'
            className='group flex items-center justify-center gap-2 rounded-lg bg-red-50/90 px-3 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 dark:bg-red-950/35 dark:text-red-400 dark:hover:bg-red-950/55'
          >
            <Link2 className='size-4 shrink-0' aria-hidden />
            Gitee 仓库
          </a>
          <a
            href='https://github.com/dromara/free-fs'
            target='_blank'
            rel='noopener noreferrer'
            className='group flex items-center justify-center gap-2 rounded-lg bg-muted/70 px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted dark:bg-muted/50'
          >
            <Code className='size-4 shrink-0' aria-hidden />
            GitHub 仓库
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
