import { useState, useEffect } from 'react';
import { Folder, Home } from 'lucide-react';
import { getFolders } from '@/api/file';
import { FileIcon } from '@/components/file-icon';
import type { FileItem } from '@/types/file';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MoveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: FileItem | null;
  files: FileItem[];
  onConfirm: (fileIds: string[], targetDirId: string) => Promise<void>;
}

export function MoveModal({ open, onOpenChange, file, files, onConfirm }: MoveModalProps) {
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<FileItem[]>([]);
  const [breadcrumbPath, setBreadcrumbPath] = useState<FileItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [currentParentId, setCurrentParentId] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const movingFiles = file ? [file] : files;
  const movingFileIds = movingFiles.map((f) => f.id);

  // 加载文件夹列表
  const loadFolders = async (parentId?: string) => {
    setLoading(true);
    try {
      const response = await getFolders(parentId);
      // 过滤掉正在移动的文件夹（避免移动到自己或子文件夹）
      const filteredFolders = response.filter((folder) => !movingFileIds.includes(folder.id));
      setFolders(filteredFolders);
    } catch (error) {
      toast.error('加载文件夹失败');
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  // 选择文件夹
  const selectFolder = (folder: FileItem) => {
    setSelectedFolderId(folder.id);
  };

  // 进入文件夹（双击）
  const enterFolder = (folder: FileItem) => {
    setBreadcrumbPath([...breadcrumbPath, folder]);
    setCurrentParentId(folder.id);
    setSelectedFolderId('');
    loadFolders(folder.id);
  };

  // 通过面包屑导航
  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      // 返回根目录
      setBreadcrumbPath([]);
      setCurrentParentId(undefined);
      setSelectedFolderId('');
      loadFolders(undefined);
    } else {
      // 返回到指定层级
      const newPath = breadcrumbPath.slice(0, index + 1);
      setBreadcrumbPath(newPath);
      setCurrentParentId(newPath[index].id);
      setSelectedFolderId('');
      loadFolders(newPath[index].id);
    }
  };

  // 确认移动
  const handleConfirm = async () => {
    const targetDirId = selectedFolderId || currentParentId || '';
    
    setIsSubmitting(true);
    try {
      await onConfirm(movingFileIds, targetDirId);
      onOpenChange(false);
    } catch (error) {
      // 错误已在 onConfirm 中处理
    } finally {
      setIsSubmitting(false);
    }
  };

  // 初始化
  useEffect(() => {
    if (open) {
      setBreadcrumbPath([]);
      setCurrentParentId(undefined);
      setSelectedFolderId('');
      loadFolders(undefined);
    }
  }, [open]);

  const isOkDisabled = !selectedFolderId && breadcrumbPath.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            移动到
            {movingFiles.length > 1 && <span className="text-muted-foreground ml-2">({movingFiles.length} 项)</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6">
          {/* 面包屑导航 */}
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg text-sm">
            <button
              className={cn(
                'flex items-center gap-1 hover:text-primary transition-colors',
                breadcrumbPath.length === 0 && 'font-medium text-foreground cursor-default'
              )}
              onClick={() => breadcrumbPath.length > 0 && navigateToBreadcrumb(-1)}
            >
              <Home className="h-4 w-4" />
              <span>根目录</span>
            </button>
            {breadcrumbPath.map((folder, index) => (
              <div key={folder.id} className="flex items-center gap-2">
                <span className="text-muted-foreground">/</span>
                <button
                  className={cn(
                    'flex items-center gap-1 hover:text-primary transition-colors',
                    index === breadcrumbPath.length - 1 && 'font-medium text-foreground cursor-default'
                  )}
                  onClick={() => index < breadcrumbPath.length - 1 && navigateToBreadcrumb(index)}
                >
                  <Folder className="h-4 w-4" />
                  <span>{folder.displayName}</span>
                </button>
              </div>
            ))}
          </div>

          {/* 文件夹列表 */}
          <div className="min-h-[300px] max-h-[400px] overflow-y-auto bg-muted/50 rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : folders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <Folder className="h-12 w-12 mb-3 opacity-50" />
                <p>当前目录下没有子文件夹</p>
              </div>
            ) : (
              <div className="p-2 space-y-0.5">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer transition-colors',
                      'hover:bg-muted',
                      selectedFolderId === folder.id && 'bg-primary/10 text-primary font-medium'
                    )}
                    onClick={() => selectFolder(folder)}
                    onDoubleClick={() => enterFolder(folder)}
                  >
                    <FileIcon
                      type="dir"
                      size={20}
                      className="flex-shrink-0"
                    />
                    <span className="flex-1 text-sm truncate">{folder.displayName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 提示信息 */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg text-sm text-blue-800 dark:text-blue-300">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>提示：单击选择目标文件夹，双击进入该文件夹</span>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              取消
            </Button>
          </DialogClose>
          <Button onClick={handleConfirm} disabled={isSubmitting || isOkDisabled}>
            {isSubmitting ? '移动中...' : '移动到此处'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
