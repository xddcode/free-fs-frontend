import type { ReactNode } from 'react'
import { usePermission } from '@/hooks/use-permission'
import type { PermissionCodeType } from '@/types/permission'

interface RequirePermissionProps {
  code: PermissionCodeType
  children: ReactNode
  fallback?: ReactNode
}

export function RequirePermission({
  code,
  children,
  fallback = null,
}: RequirePermissionProps) {
  const { hasPermission } = usePermission()

  return hasPermission(code) ? <>{children}</> : <>{fallback}</>
}

interface RequireAnyPermissionProps {
  codes: PermissionCodeType[]
  children: ReactNode
  fallback?: ReactNode
}

export function RequireAnyPermission({
  codes,
  children,
  fallback = null,
}: RequireAnyPermissionProps) {
  const { hasAnyPermission } = usePermission()

  return hasAnyPermission(...codes) ? <>{children}</> : <>{fallback}</>
}
