import type { RoleListItem } from '@/types/role'
import { cn } from '@/lib/utils'

/** 角色下拉项：标题 + 描述（与列表接口中的 description 一致） */
export function RoleOptionLabel({
  role,
  compact,
  className,
}: {
  role: RoleListItem
  compact?: boolean
  className?: string
}) {
  const desc = role.description?.trim()
  return (
    <div
      className={cn(
        'flex flex-col gap-0.5 text-left',
        compact ? 'py-0' : 'py-0.5',
        className
      )}
    >
      <span
        className={cn(
          'font-medium leading-tight',
          compact ? 'text-xs' : 'text-sm'
        )}
      >
        {role.roleName}
      </span>
      {desc ? (
        <span
          className={cn(
            'text-muted-foreground leading-snug',
            compact ? 'line-clamp-2 text-[11px]' : 'line-clamp-3 text-xs'
          )}
        >
          {desc}
        </span>
      ) : null}
    </div>
  )
}
