import { ConfirmDialog } from '@/components/confirm-dialog';
import type { FileItem } from '@/types/file';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: FileItem[];
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  files,
  onConfirm,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  const fileCount = files.length;
  
  return (
    <ConfirmDialog
      destructive
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={onConfirm}
      isLoading={isLoading}
      title="确认删除"
      desc="确定要删除选中的文件吗？此操作不可恢复。"
      confirmText="确认"
      cancelBtnText="取消"
    />
  );
}
