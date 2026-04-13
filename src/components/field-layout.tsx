import * as React from 'react'
import { cn } from '@/lib/utils'

/* --- 只读详情：Label（上）+ Value（下），与设计稿一致 --- */

export function DescriptionFieldList({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-5', className)} {...props} />
}

export function DescriptionField({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)} {...props} />
  )
}

export function DescriptionFieldLabel({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('text-xs text-muted-foreground', className)} {...props} />
  )
}

type DescriptionFieldValueProps = React.ComponentProps<'div'> & {
  /** 长文件名、URL 等 */
  breakAll?: boolean
}

export function DescriptionFieldValue({
  className,
  breakAll,
  ...props
}: DescriptionFieldValueProps) {
  return (
    <div
      className={cn(
        'text-sm text-foreground',
        breakAll ? 'break-all' : 'wrap-break-word',
        className
      )}
      {...props}
    />
  )
}

/** 值与右侧操作（复制等）同一行；置于 DescriptionField 内、Label 下方 */
export function DescriptionFieldValueRow({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex min-w-0 items-center gap-2', className)}
      {...props}
    />
  )
}

/* --- 表单：区块标题 + 控件区（单选/多选横排等）--- */

/** 标题与控件间距 10px（设计 8–12px） */
export function FormFieldStack({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-2.5', className)} {...props} />
}

/** 横向选项容器：选项水平间距 24px */
export function FormInlineOptions({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-wrap gap-x-6 gap-y-2', className)}
      {...props}
    />
  )
}

/** 单个选项：控件与文案间距 8px */
export function FormInlineOption({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <div className={cn('flex items-center gap-2', className)} {...props} />
}
