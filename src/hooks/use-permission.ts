import { useCallback, useMemo } from 'react'
import { useWorkspaceStore } from '@/store/workspace'
import type { PermissionCodeType } from '@/types/permission'

export function usePermission() {
  const currentRole = useWorkspaceStore((s) => s.currentRole)
  const permissions = currentRole?.permissions ?? []

  const permissionSet = useMemo(() => new Set(permissions), [permissions])

  const hasPermission = useCallback(
    (code: PermissionCodeType) => permissionSet.has(code),
    [permissionSet]
  )

  const hasAnyPermission = useCallback(
    (...codes: PermissionCodeType[]) => codes.some((c) => permissionSet.has(c)),
    [permissionSet]
  )

  const hasAllPermissions = useCallback(
    (...codes: PermissionCodeType[]) =>
      codes.every((c) => permissionSet.has(c)),
    [permissionSet]
  )

  const isAdmin = currentRole?.roleCode === 'admin'

  return { hasPermission, hasAnyPermission, hasAllPermissions, isAdmin }
}
