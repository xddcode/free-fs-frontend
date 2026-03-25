import type { LucideIcon } from 'lucide-react'
import {
  Archive,
  ChevronRight,
  FileText,
  Film,
  Image,
  Music,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export type CategoryShortcut = {
  title: string
  href: string
  icon: LucideIcon
}

export const CATEGORY_SHORTCUTS: CategoryShortcut[] = [
  { title: '文档', href: '/files?type=document', icon: FileText },
  { title: '图片', href: '/files?type=image', icon: Image },
  { title: '视频', href: '/files?type=video', icon: Film },
  { title: '音频', href: '/files?type=audio', icon: Music },
  { title: '其他', href: '/files?type=other', icon: Archive },
]

/** 自上而下的紫系渐变，与 sidebar-primary 图标、存储图表面积色一致 */
export function CategoryShortcutLink({
  title,
  href,
  icon: Icon,
  className,
}: CategoryShortcut & { className?: string }) {
  return (
    <Link
      to={href}
      className={cn(
        'group relative flex h-36 min-h-0 w-full min-w-0 overflow-hidden rounded-2xl border border-sidebar-primary/15 bg-linear-to-b from-sidebar-primary/22 via-sidebar-primary/8 to-background text-foreground shadow-sm transition-[box-shadow,border-color] dark:border-sidebar-primary/25 dark:from-sidebar-primary/30 dark:via-sidebar-primary/12 dark:to-background sm:h-40',
        'hover:border-sidebar-primary/25 hover:shadow-md',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
        className
      )}
    >
      <span className='relative z-10 flex max-w-[78%] items-start gap-0.5 px-3 pt-3 text-sm font-semibold tracking-tight sm:px-4 sm:pt-4'>
        {title}
        <ChevronRight
          className='text-muted-foreground mt-0.5 size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 sm:size-4'
          aria-hidden
        />
      </span>
      <Icon
        className='pointer-events-none absolute right-3 bottom-0 size-24 shrink-0 translate-y-4 rotate-6 text-sidebar-primary/35 transition-transform group-hover:scale-[1.02] sm:right-6 sm:translate-y-5 sm:size-28 sm:rotate-7'
        strokeWidth={1.1}
        aria-hidden
      />
    </Link>
  )
}
