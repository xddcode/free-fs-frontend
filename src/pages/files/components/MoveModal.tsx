import { useState, useEffect, useRef } from 'react';
import { Folder, Home, FolderPlus, Check, X } from 'lucide-react';
import { getFolders, createFolder } from '@/api/file';
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
  onRefresh?: () => void;
}

export function MoveModal({ open, onOpenChange, file, files, onConfirm, onRefresh }: MoveModalProps) {
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<FileItem[]>([]);
  const [breadcrumbPath, setBreadcrumbPath] = useState<FileItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [currentParentId, setCurrentParentId] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const movingFiles = file ? [file] : files;
  const movingFileIds = movingFiles.map((f) => f.id);

  // 加载文件夹列表
  const loadFolders = async (parentId?: string) => {
    setLoading(true);
    try {
      const response = await getFolders(parentId);
      const filteredFolders = response.filter((folder) => !movingFileIds.includes(folder.id));
      setFolders(filteredFolders);
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

  // 打开创建文件夹输入框
  const handleCreateFolder = () => {
    setIsCreatingFolder(true);
    setNewFolderName('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // 确认创建文件夹
  const confirmCreateFolder = async () => {
    const folderName = newFolderName.trim();
    if (!folderName) {
      toast.warning('请输入文件夹名称');
      return;
    }

    try {
      await createFolder({
        folderName,
        parentId: currentParentId,
      });
      toast.success('创建文件夹成功');
      setIsCreatingFolder(false);
      setNewFolderName('');
      loadFolders(currentParentId);
      onRefresh?.();
    } finally {
      // 无需处理
    }
  };

  // 取消创建文件夹
  const cancelCreateFolder = () => {
    setIsCreatingFolder(false);
    setNewFolderName('');
  };

  // 处理输入框按键
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      confirmCreateFolder();
    } else if (e.key === 'Escape') {
      cancelCreateFolder();
    }
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
      setIsCreatingFolder(false);
      setNewFolderName('');
      loadFolders(undefined);
    }
  }, [open]);

  // 检查是否移动到当前所在目录
  const targetDirId = selectedFolderId || currentParentId || '';
  const isSameDirectory = movingFiles.every((file) => {
    const fileParentId = file.parentId || '';
    return fileParentId === targetDirId;
  });

  const isOkDisabled = (!selectedFolderId && breadcrumbPath.length > 0) || isSameDirectory;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>移动到</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 px-6 pb-4">
          {/* 面包屑导航 */}
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg text-sm">
            <button
              type="button"
              className={cn(
                'flex items-center gap-1 hover:text-primary transition-colors outline-none focus:outline-none',
                breadcrumbPath.length === 0 && 'font-medium text-foreground cursor-default'
              )}
              onClick={() => breadcrumbPath.length > 0 && navigateToBreadcrumb(-1)}
              tabIndex={-1}
            >
              <Home className="h-4 w-4" />
              <span>全部文件</span>
            </button>
            {breadcrumbPath.map((folder, index) => (
              <div key={folder.id} className="flex items-center gap-2">
                <span className="text-muted-foreground">/</span>
                <button
                  type="button"
                  className={cn(
                    'flex items-center gap-1 hover:text-primary transition-colors outline-none focus:outline-none',
                    index === breadcrumbPath.length - 1 && 'font-medium text-foreground cursor-default'
                  )}
                  onClick={() => index < breadcrumbPath.length - 1 && navigateToBreadcrumb(index)}
                  tabIndex={-1}
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
                <p className="text-sm text-muted-foreground">加载中...</p>
              </div>
            ) : folders.length === 0 && !isCreatingFolder ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <Folder className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm">当前目录下没有子文件夹</p>
              </div>
            ) : (
              <div className="p-2 space-y-0.5">
                {/* 新建文件夹输入框 */}
                {isCreatingFolder && (
                  <div
                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded bg-background border border-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FileIcon type="dir" size={20} className="flex-shrink-0" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                        placeholder="请输入文件夹名称"
                        className="flex-1 bg-transparent border-none outline-none text-sm focus:outline-none"
                        maxLength={50}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={confirmCreateFolder}
                        className="p-1.5 hover:bg-primary/10 rounded text-primary transition-colors"
                        title="确认"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelCreateFolder}
                        className="p-1.5 hover:bg-muted-foreground/10 rounded text-muted-foreground transition-colors"
                        title="取消"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 现有文件夹列表 */}
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer transition-colors select-none',
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
          {isSameDirectory ? (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg text-sm text-amber-800 dark:text-amber-300">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>文件已在当前目录，无需移动</span>
            </div>
          ) : (
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg text-sm text-blue-800 dark:text-blue-300">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>提示：单击选择目标文件夹，双击进入该文件夹</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={handleCreateFolder}
            className="mr-auto"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            新建文件夹
          </Button>
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
