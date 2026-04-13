import { cn } from '@/lib/utils'

/** 设置各页顶部一级标题（对应 md 的 #） */
export function SettingsPageTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        'text-2xl font-semibold tracking-tight text-foreground',
        className
      )}
      {...props}
    >
      {children}
    </h2>
  )
}

/** 一级标题下的说明文字 */
export function SettingsPageDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'mt-1.5 text-sm leading-relaxed text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}
