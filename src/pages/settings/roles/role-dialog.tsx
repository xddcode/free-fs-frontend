import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { roleApi } from '@/api/role'
import type { RoleListItem } from '@/types/role'
import type { PermissionDef, PermissionCodeType } from '@/types/permission'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface RoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: RoleListItem | null
  permissionDefs: PermissionDef[]
  onSuccess: () => void
}

export function RoleDialog({
  open,
  onOpenChange,
  role,
  permissionDefs,
  onSuccess,
}: RoleDialogProps) {
  const { t } = useTranslation('settings')
  const isEdit = !!role
  const [roleCode, setRoleCode] = useState('')
  const [roleName, setRoleName] = useState('')
  const [desc, setDesc] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<
    Set<PermissionCodeType>
  >(new Set())
  const [initializing, setInitializing] = useState(false)
  const [saving, setSaving] = useState(false)

  const busy = initializing || saving

  useEffect(() => {
    if (!open) return
    if (!role) {
      setRoleCode('')
      setRoleName('')
      setDesc('')
      setSelectedPermissions(new Set())
      return
    }
    let cancelled = false
    setInitializing(true)
    roleApi
      .get(role.id)
      .then((data) => {
        if (cancelled) return
        if (data.roleType === 0) {
          toast.error(t('roles.presetReadonly'))
          onOpenChange(false)
          return
        }
        setRoleCode(data.roleCode)
        setRoleName(data.roleName)
        setDesc(data.description || '')
        setSelectedPermissions(new Set(data.permissions ?? []))
      })
      .catch(() => {
        if (!cancelled) toast.error(t('roles.loadFailed'))
      })
      .finally(() => {
        if (!cancelled) setInitializing(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, role, onOpenChange, t])

  const groupedPermissions = useMemo(() => {
    const sorted = [...permissionDefs].sort(
      (a, b) => (a.sort ?? 0) - (b.sort ?? 0)
    )
    const map = new Map<string, PermissionDef[]>()
    for (const def of sorted) {
      const group = map.get(def.module) || []
      group.push(def)
      map.set(def.module, group)
    }
    return map
  }, [permissionDefs])

  const togglePermission = (code: PermissionCodeType) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev)
      if (next.has(code)) {
        next.delete(code)
      } else {
        next.add(code)
      }
      return next
    })
  }

  const toggleModuleAll = (moduleDefs: PermissionDef[]) => {
    const codes = moduleDefs.map((d) => d.permissionCode)
    const allSelected = codes.every((c) => selectedPermissions.has(c))
    setSelectedPermissions((prev) => {
      const next = new Set(prev)
      codes.forEach((c) => {
        if (allSelected) {
          next.delete(c)
        } else {
          next.add(c)
        }
      })
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roleName.trim()) {
      toast.error(t('roles.nameRequired'))
      return
    }
    if (!isEdit && !roleCode.trim()) {
      toast.error(t('roles.codeRequired'))
      return
    }
    if (selectedPermissions.size === 0) {
      toast.error(t('roles.permRequired'))
      return
    }

    setSaving(true)
    try {
      if (isEdit) {
        await roleApi.update(role!.id, {
          roleName: roleName.trim(),
          description: desc.trim() || undefined,
          permissions: Array.from(selectedPermissions),
        })
        toast.success(t('roles.updated'))
      } else {
        await roleApi.create({
          roleCode: roleCode.trim(),
          roleName: roleName.trim(),
          description: desc.trim() || undefined,
          permissions: Array.from(selectedPermissions),
        })
        toast.success(t('roles.created'))
      }
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      if (!err?.handled)
        toast.error(isEdit ? t('roles.updateFailed') : t('roles.createFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('roles.dialogEdit') : t('roles.dialogCreate')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='contents'>
          <div className='space-y-6'>
            {initializing && isEdit ? (
              <p className='text-sm text-muted-foreground'>
                {t('common.loading')}
              </p>
            ) : (
              <>
                <div className='grid gap-6 sm:grid-cols-2'>
                  <div className='space-y-3'>
                    <Label htmlFor='role-code'>
                      <span className='relative top-0.5 text-red-500'>* </span>
                      {t('roles.roleCode')}
                    </Label>
                    <Input
                      id='role-code'
                      placeholder={t('roles.roleCodePh')}
                      value={roleCode}
                      onChange={(e) => setRoleCode(e.target.value)}
                      disabled={busy || isEdit}
                      required={!isEdit}
                    />
                  </div>
                  <div className='space-y-3'>
                    <Label htmlFor='role-name'>
                      <span className='relative top-0.5 text-red-500'>* </span>
                      {t('roles.roleName')}
                    </Label>
                    <Input
                      id='role-name'
                      placeholder={t('roles.roleNamePh')}
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      disabled={busy}
                      required
                    />
                  </div>
                </div>

                <div className='space-y-3'>
                  <Label htmlFor='role-desc'>{t('roles.descOptional')}</Label>
                  <Textarea
                    id='role-desc'
                    placeholder={t('roles.descPlaceholder')}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    disabled={busy}
                    rows={3}
                    className='resize-y'
                  />
                </div>

                <div className='space-y-3'>
                  <Label>
                    <span className='relative top-0.5 text-red-500'>* </span>
                    {t('roles.permissions')}
                  </Label>
                  {Array.from(groupedPermissions.entries()).map(
                    ([module, defs]) => {
                      const allSelected = defs.every((d) =>
                        selectedPermissions.has(d.permissionCode)
                      )
                      const someSelected =
                        !allSelected &&
                        defs.some((d) =>
                          selectedPermissions.has(d.permissionCode)
                        )

                      return (
                        <div
                          key={module}
                          className='rounded-lg border p-3'
                        >
                          <div className='mb-2 flex items-center gap-2'>
                            <Checkbox
                              checked={
                                allSelected
                                  ? true
                                  : someSelected
                                    ? 'indeterminate'
                                    : false
                              }
                              onCheckedChange={() => toggleModuleAll(defs)}
                              disabled={busy}
                            />
                            <span className='text-sm font-medium'>{module}</span>
                          </div>
                          <div className='ml-6 grid grid-cols-2 gap-2'>
                            {defs.map((def) => (
                              <label
                                key={def.id}
                                className='flex cursor-pointer items-center gap-2 text-sm'
                              >
                                <Checkbox
                                  checked={selectedPermissions.has(
                                    def.permissionCode
                                  )}
                                  onCheckedChange={() =>
                                    togglePermission(def.permissionCode)
                                  }
                                  disabled={busy}
                                />
                                {def.permissionName}
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    }
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              {t('roles.cancel')}
            </Button>
            <Button
              type='submit'
              disabled={
                busy ||
                (isEdit && initializing) ||
                !roleName.trim() ||
                (!isEdit && !roleCode.trim()) ||
                selectedPermissions.size === 0
              }
            >
              {saving ? t('roles.saving') : t('roles.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
