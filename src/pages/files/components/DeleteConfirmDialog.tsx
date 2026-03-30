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
  const fileCount = files.length
  const firstName = files[0]?.displayName ?? ''
  const desc =
    fileCount === 0
      ? '确定要将选中的文件放入回收站吗？可在回收站还原。'
      : fileCount === 1
        ? `确定要将「${firstName}」放入回收站吗？可在回收站还原。`
        : `确定要将选中的 ${fileCount} 个文件放入回收站吗？可在回收站还原。`

  return (
    <ConfirmDialog
      destructive
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={onConfirm}
      isLoading={isLoading}
      title='放入回收站'
      desc={desc}
      confirmText='放入回收站'
      cancelBtnText='取消'
    />
  )
}
