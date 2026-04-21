import { cn } from '@/lib/utils'

type SettingsRowProps = {
  label: string
  description?: string
  children: React.ReactNode
  /** 右侧控件与顶部对齐（多行控件用） */
  align?: 'center' | 'start'
  className?: string
}

type SettingsBlockProps = {
  label: string
  description?: string
  children: React.ReactNode
  className?: string
}

/**
 * 长文案、路径、多行输入等：标题 + 说明在上，控件全宽在下（类似 Notion「允许的电子邮件域名」一类区块）
 */
export function SettingsBlock({
  label,
  description,
  children,
  className,
}: SettingsBlockProps) {
  return (
    <div className={cn('space-y-4 py-5', className)}>
      <div className='space-y-1'>
        <p className='text-base leading-snug'>{label}</p>
        {description ? (
          <p className='text-sm leading-relaxed text-muted-foreground'>
            {description}
          </p>
        ) : null}
      </div>
      <div className='min-w-0 w-full'>{children}</div>
    </div>
  )
}

/**
 * 短控件：左侧标题 + 说明，右侧为勾选 / 单选 / 下拉等（左右分栏行）
 */
export function SettingsRow({
  label,
  description,
  children,
  align = 'center',
  className,
}: SettingsRowProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 py-5 sm:flex-row sm:justify-between sm:gap-8',
        align === 'center' ? 'sm:items-center' : 'sm:items-start',
        className
      )}
    >
      <div className='min-w-0 max-w-xl flex-1 space-y-1'>
        <p className='text-base leading-snug'>{label}</p>
        {description ? (
          <p className='text-sm text-muted-foreground leading-relaxed'>
            {description}
          </p>
        ) : null}
      </div>
      <div className='flex w-full shrink-0 flex-col items-stretch gap-2 sm:w-auto sm:min-w-48 sm:max-w-md sm:items-end'>
        {children}
      </div>
    </div>
  )
}
