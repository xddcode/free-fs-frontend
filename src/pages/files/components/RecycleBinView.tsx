import { useState, useEffect } from 'react';
import { Undo2, Trash2, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { FileBreadcrumb } from './FileBreadcrumb';
import { Toolbar } from './Toolbar';
import { Dock, DockIcon } from '@/components/ui/dock';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { toast } from 'sonner';
import { getRecycleList, restoreFiles, permanentDeleteFiles, clearRecycle } from '@/api/file';
import type { FileRecycleItem } from '@/types/file';
import { FileIcon } from '@/components/file-icon';
import { formatFileSize, formatTime } from '@/utils/format';

export default function RecycleBinView() {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<FileRecycleItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 确认对话框状态
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [operatingItem, setOperatingItem] = useState<{ id: string; name: string } | null>(null);

  /**
   * 获取回收站文件列表
   */
  const fetchRecycleList = async (keyword?: string) => {
    setLoading(true);
    try {
      const response = await getRecycleList(keyword || undefined);
      setFileList(response || []);
    } catch (error) {
      setFileList([]);
      toast.error('获取回收站列表失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理搜索
   */
  const handleSearch = () => {
    fetchRecycleList(searchKeyword || undefined);
  };

  /**
   * 处理刷新
   */
  const handleRefresh = () => {
    fetchRecycleList(searchKeyword || undefined);
  };

  /**
   * 单个还原
   */
  const handleRestoreSingle = (fileId: string, fileName: string) => {
    setOperatingItem({ id: fileId, name: fileName });
    setRestoreDialogOpen(true);
  };

  /**
   * 确认还原
   */
  const confirmRestore = async () => {
    const ids = operatingItem ? [operatingItem.id] : selectedIds;
    if (ids.length === 0) return;

    try {
      await restoreFiles(ids);
      toast.success(`成功还原 ${ids.length} 个文件`);
      setSelectedIds([]);
      setOperatingItem(null);
      fetchRecycleList(searchKeyword || undefined);
    } catch (error) {
      toast.error('还原失败');
    }
  };

  /**
   * 批量还原
   */
  const handleBatchRestore = () => {
    if (selectedIds.length === 0) return;
    setOperatingItem(null);
    setRestoreDialogOpen(true);
  };

  /**
   * 单个彻底删除
   */
  const handleDeleteSingle = (fileId: string, fileName: string) => {
    setOperatingItem({ id: fileId, name: fileName });
    setDeleteDialogOpen(true);
  };

  /**
   * 确认彻底删除
   */
  const confirmDelete = async () => {
    const ids = operatingItem ? [operatingItem.id] : selectedIds;
    if (ids.length === 0) return;

    try {
      await permanentDeleteFiles(ids);
      toast.success(`成功删除 ${ids.length} 个文件`);
      setSelectedIds([]);
      setOperatingItem(null);
      fetchRecycleList(searchKeyword || undefined);
    } catch (error) {
      toast.error('删除失败');
    }
  };

  /**
   * 批量彻底删除
   */
  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    setOperatingItem(null);
    setDeleteDialogOpen(true);
  };

  /**
   * 清空回收站
   */
  const handleClearRecycle = () => {
    setClearDialogOpen(true);
  };

  /**
   * 确认清空回收站
   */
  const confirmClearRecycle = async () => {
    try {
      await clearRecycle();
      toast.success('回收站已清空');
      setSelectedIds([]);
      setSearchKeyword('');
      fetchRecycleList(undefined);
    } catch (error) {
      toast.error('清空回收站失败');
    }
  };

  /**
   * 清空选中
   */
  const clearSelection = () => {
    setSelectedIds([]);
  };

  /**
   * 全选/取消全选
   */
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(fileList.map((f) => f.id));
    } else {
      setSelectedIds([]);
    }
  };

  /**
   * 处理键盘事件
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 监听搜索关键词变化，自动搜索
  useEffect(() => {
    fetchRecycleList(searchKeyword || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeyword]);

  const isAllSelected = fileList.length > 0 && selectedIds.length === fileList.length;

  return (
    <div className="flex flex-col h-full">
      {/* 现代化顶部工具栏 */}
      <div className="flex items-center gap-4 border-b px-6 py-4">
        {/* 面包屑导航 */}
        <div className="flex-1 min-w-0">
          <FileBreadcrumb
            breadcrumbPath={[]}
            customTitle="回收站"
            onNavigate={() => {}}
          />
        </div>

        {/* 右侧工具栏 */}
        <Toolbar
          searchKeyword={searchKeyword}
          onSearchChange={setSearchKeyword}
          onSearch={handleSearch}
          onUpload={() => {}}
          onCreateFolder={() => {}}
          onRefresh={handleRefresh}
          hideActions={true}
        />
        
        <Button
          variant="destructive"
          size="sm"
          disabled={fileList.length === 0}
          onClick={handleClearRecycle}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          清空回收站
        </Button>
      </div>

      {/* 次级工具栏：统计信息 */}
      <div className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {selectedIds.length > 0
              ? `已选 ${selectedIds.length} 项 · 回收站内容保存 7 天，到期后自动清理`
              : `共 ${fileList.length} 项 · 回收站内容保存 7 天，到期后自动清理`}
          </span>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">加载中...</p>
            </div>
          ) : fileList.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Empty className="border-none">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileText className="h-12 w-12" />
                  </EmptyMedia>
                  <EmptyTitle>暂无文件</EmptyTitle>
                  <EmptyDescription>删除的文件会显示在这里</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="全选"
                    />
                  </TableHead>
                  <TableHead className="font-medium text-muted-foreground">文件名</TableHead>
                  <TableHead className="w-32 font-medium text-muted-foreground">大小</TableHead>
                  <TableHead className="w-48 font-medium text-muted-foreground">删除时间</TableHead>
                  <TableHead className="w-40 text-center font-medium text-muted-foreground">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fileList.map((file) => {
                  const isSelected = selectedIds.includes(file.id);
                  return (
                    <TableRow key={file.id} className={cn('transition-colors group', isSelected && 'bg-primary/5')}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedIds([...selectedIds, file.id]);
                            } else {
                              setSelectedIds(selectedIds.filter((id) => id !== file.id));
                            }
                          }}
                          aria-label={`选择 ${file.displayName}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center rounded">
                            <FileIcon
                              type={file.isDir ? 'dir' : file.suffix || ''}
                              size={28}
                              className="shrink-0"
                            />
                          </div>
                          <span className="text-sm font-normal text-foreground/90 truncate">{file.displayName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {file.isDir ? '-' : formatFileSize(file.size)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatTime(file.deletedTime)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleRestoreSingle(file.id, file.displayName)}
                                >
                                  <Undo2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>还原</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteSingle(file.id, file.displayName)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>删除</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* 底部悬浮批量操作栏 */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <TooltipProvider>
            <Dock direction="middle" className="h-16 px-4">
              <DockIcon>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-12 rounded-full"
                      onClick={handleBatchRestore}
                      aria-label="还原"
                    >
                      <Undo2 className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>还原</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>

              <DockIcon>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-12 rounded-full"
                      onClick={handleBatchDelete}
                      aria-label="彻底删除"
                    >
                      <Trash2 className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>彻底删除</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>

              <Separator orientation="vertical" className="h-8 mx-2" />

              <DockIcon>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-12 rounded-full"
                      onClick={clearSelection}
                      aria-label="取消选择"
                    >
                      <X className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>取消选择</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>
            </Dock>
          </TooltipProvider>
        </div>
      )}

      {/* 还原确认对话框 */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认还原</AlertDialogTitle>
            <AlertDialogDescription>
              {operatingItem
                ? `确定要还原文件 "${operatingItem.name}" 吗？`
                : `确定要还原选中的 ${selectedIds.length} 个文件吗？`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore}>还原</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认彻底删除</AlertDialogTitle>
            <AlertDialogDescription>
              {operatingItem
                ? `确定要彻底删除文件 "${operatingItem.name}" 吗？删除后将无法恢复！`
                : `确定要彻底删除选中的 ${selectedIds.length} 个文件吗？删除后将无法恢复！`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 清空回收站确认对话框 */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认清空回收站</AlertDialogTitle>
            <AlertDialogDescription>
              确定要清空回收站吗？所有文件将被彻底删除且无法恢复！
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClearRecycle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              清空
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
