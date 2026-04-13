import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { FileItem } from '@/types/file'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  files: FileItem[]
  onConfirm: () => void
  isLoading?: boolean
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  files,
  onConfirm,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  const { t } = useTranslation('files')
  const fileCount = files.length
  const firstName = files[0]?.displayName ?? ''
  const desc = useMemo(
    () =>
      fileCount === 0
        ? t('deleteDialog.batch')
        : fileCount === 1
          ? t('deleteDialog.single', { name: firstName })
          : t('deleteDialog.multi', { count: fileCount }),
    [fileCount, firstName, t]
  )

  return (
    <ConfirmDialog
      destructive
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={onConfirm}
      isLoading={isLoading}
      title={t('deleteDialog.title')}
      desc={desc}
      confirmText={t('deleteDialog.confirm')}
      cancelBtnText={t('common.cancel')}
    />
  )
}
