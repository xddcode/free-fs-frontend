import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { workspaceApi } from '@/api/workspace'
import { useWorkspaceStore } from '@/store/workspace'
import { useAuth } from '@/contexts/auth-context'
import { usePermission } from '@/hooks/use-permission'
import {
  SettingsPageDescription,
  SettingsPageTitle,
} from '../components/settings-page-header'
import { SettingsBlock } from '../components/settings-row'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function SettingsWorkspace() {
  const { t } = useTranslation('settings')
  const navigate = useNavigate()
  const { loadWorkspaces, activateWorkspace, user } = useAuth()
  const { isAdmin } = usePermission()
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)
  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const isOwner = currentWorkspace?.ownerId === user?.id

  useEffect(() => {
    if (currentWorkspace) {
      setName(currentWorkspace.name)
      setDescription(currentWorkspace.description || '')
    }
  }, [currentWorkspace])

  const saveIfChanged = async () => {
    if (!currentWorkspace || !isAdmin) return
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error(t('workspace.nameRequired'))
      return
    }
    const trimmedDesc = description.trim()
    const prevDesc = (currentWorkspace.description ?? '').trim()
    if (
      trimmedName === currentWorkspace.name &&
      trimmedDesc === prevDesc
    ) {
      return
    }
    setSaving(true)
    try {
      await workspaceApi.update({
        name: trimmedName,
        description: trimmedDesc || undefined,
      })
      toast.success(t('workspace.saved'))
      await loadWorkspaces()
      if (currentWorkspaceId) {
        await activateWorkspace(currentWorkspaceId)
      }
    } catch (err: any) {
      if (!err?.handled) toast.error(t('workspace.updateFailed'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await workspaceApi.delete()
      toast.success(t('workspace.deleted'))
      setDeleteOpen(false)
      await loadWorkspaces()
      const remaining = useWorkspaceStore.getState().workspaces
      if (remaining.length === 0) {
        navigate('/workspace/new')
      } else {
        navigate(`/w/${remaining[0].slug}/`)
      }
    } catch (err: any) {
      if (!err?.handled) toast.error(t('workspace.deleteFailed'))
    } finally {
      setDeleting(false)
    }
  }

  if (!currentWorkspace) {
    return null
  }

  return (
    <div className='flex flex-1 flex-col'>
      {/* 一级标题 + 副标题（类似 md # 与导语） */}
      <header className='flex-none'>
        <SettingsPageTitle>{t('workspace.pageTitle')}</SettingsPageTitle>
        <SettingsPageDescription>
          {t('workspace.pageDescription')}
        </SettingsPageDescription>
      </header>

      <div className='mt-8 flex flex-col gap-10'>
        {/* 二级标题 → 分割线 → 内容 */}
        <section className='min-w-0'>
          <div className='border-b border-border pb-2'>
            <h3 className='text-xl font-semibold tracking-tight'>
              {t('workspace.sectionSettings')}
            </h3>
          </div>
          <div className='pt-5'>
            <SettingsBlock
              className='py-0'
              label={t('workspace.name')}
              description={t('workspace.nameDesc')}
            >
              <Input
                id='ws-name'
                value={name}
                maxLength={65}
                placeholder={t('workspace.namePlaceholder')}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => {
                  void saveIfChanged()
                }}
                disabled={saving || !isAdmin}
                required
                className='max-w-md font-normal'
              />
              {saving && (
                <p className='text-sm text-muted-foreground pt-1'>
                  {t('workspace.saving')}
                </p>
              )}
            </SettingsBlock>

            <SettingsBlock
              className='py-0 pt-6'
              label={t('workspace.slug')}
              description={t('workspace.slugDesc')}
            >
              <Input
                value={currentWorkspace.slug}
                disabled
                readOnly
                className='max-w-md font-mono text-sm'
              />
            </SettingsBlock>

            <SettingsBlock
              className='py-0 pt-6'
              label={t('workspace.description')}
              description={t('workspace.descriptionDesc')}
            >
              <Textarea
                id='ws-desc'
                value={description}
                placeholder={t('workspace.descriptionPlaceholder')}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => {
                  void saveIfChanged()
                }}
                disabled={saving || !isAdmin}
                rows={4}
                className='min-h-[100px] resize-y'
              />
            </SettingsBlock>
          </div>
        </section>

        {isOwner && (
          <section className='min-w-0'>
            <div className='border-b border-border pb-2'>
              <h3 className='text-xl font-semibold tracking-tight'>
                {t('workspace.dangerZone')}
              </h3>
            </div>
            <div className='pt-5'>
              <div className='flex items-start justify-between gap-8'>
                <div className='min-w-0 flex-1 space-y-1'>
                  <p className='text-base leading-snug'>
                    {t('workspace.deleteTitle')}
                  </p>
                  <p className='text-sm text-muted-foreground leading-relaxed'>
                    {t('workspace.deleteDesc')}
                  </p>
                </div>
                <Button
                  type='button'
                  variant='destructive'
                  size='sm'
                  className='shrink-0'
                  onClick={() => setDeleteOpen(true)}
                >
                  {t('workspace.deleteButton')}
                </Button>
              </div>
            </div>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t('workspace.confirmDeleteTitle')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('workspace.confirmDeleteDesc', {
                        name: currentWorkspace.name,
                      })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className='py-2'>
                    <Input
                      placeholder={currentWorkspace.name}
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>
                      {t('workspace.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                      disabled={
                        deleting || deleteConfirmText !== currentWorkspace.name
                      }
                      onClick={handleDelete}
                    >
                      {deleting
                        ? t('workspace.deleting')
                        : t('workspace.confirmDelete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
          </section>
        )}
      </div>
    </div>
  )
}
