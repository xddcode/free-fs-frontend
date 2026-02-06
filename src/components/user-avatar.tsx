import { cn } from '@/lib/utils'
import { getAvatarFallback } from '@/utils/avatar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserAvatarProps {
  name: string
  avatar?: string
  size?: number
  className?: string
  fallbackClassName?: string
}

export function UserAvatar({
  name,
  avatar,
  size = 32,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const avatarFallback = getAvatarFallback(name)

  return (
    <Avatar className={cn('', className)} style={{ width: size, height: size }}>
      {avatar && <AvatarImage src={avatar} alt={name} />}
      <AvatarFallback
        className={cn(
          'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
          fallbackClassName
        )}
        style={{
          fontSize: size > 40 ? '1rem' : '0.875rem',
        }}
      >
        {avatarFallback}
      </AvatarFallback>
    </Avatar>
  )
}
