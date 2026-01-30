import type { FileItem } from '@/types/file';
import { formatFileSize, formatTime } from '@/utils/format';
import { FileIcon } from '@/components/file-icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface FileDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: FileItem | null;
}

export function FileDetailModal({
  open,
  onOpenChange,
  file,
}: FileDetailModalProps) {
  if (!file) return null;

  const detailItems = [
    { label: '文件名', value: file.displayName },
    { label: '大小', value: file.isDir ? '-' : formatFileSize(file.size) },
    { label: '文件位置', value: '全部文件' },
    { label: '云端创建时间', value: formatTime(file.createTime) },
    { label: '最后修改时间', value: formatTime(file.updateTime) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>详细信息</DialogTitle>
        </DialogHeader>
        
        <div className="py-3 pb-4 px-5">
          {/* 文件图标 */}
          <div className="flex justify-center mb-8">
            <FileIcon
              type={file.isDir ? 'dir' : file.suffix || ''}
              size={100}
            />
          </div>

          {/* 详细信息列表 */}
          <div className="space-y-5">
            {detailItems.map((item, index) => (
              <div key={index} className="space-y-1.5">
                <div className="text-xs text-muted-foreground">{item.label}</div>
                <div className="text-sm text-foreground break-all">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
