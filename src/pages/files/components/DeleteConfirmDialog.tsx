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
      desc={`确定要将选中的 ${fileCount} 个文件放入回收站吗？`}
      confirmText="确定"
      cancelBtnText="取消"
    />
  );
}
