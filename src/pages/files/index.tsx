import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { List, LayoutGrid, Download, Share2, Heart, Move, Trash2, X, FolderOpen, Upload, FolderPlus, RefreshCw } from 'lucide-react';
import { useFileList } from './hooks/useFileList';
import { useFileOperations } from './hooks/useFileOperations';
import {
  Toolbar,
  FileBreadcrumb,
  FileGridView,
  FileListView,
  CreateFolderModal,
  RenameModal,
  MoveModal,
  ShareModal,
} from './components';
import type { FileItem } from '@/types/file';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ViewMode = 'list' | 'grid';

export default function FilesPage() {
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 视图模式
  const [viewMode, setViewMode] = useState<ViewMode>((searchParams.get('viewMode') as ViewMode) || 'grid');

  // 选中的文件
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // 使用 hooks
  const fileList = useFileList();
  const operations = useFileOperations(fileList.refresh);

  // 计算当前视图类型
  const viewType = searchParams.get('view');
  const isFavoritesView = viewType === 'favorites';
  const isRecentsView = viewType === 'recents';
  const isRecycleBin = viewType === 'recycle';
  const isSharesView = viewType === 'shares';

  // 判断文件夹
  const selectedFiles = fileList.fileList.filter((file) => selectedKeys.includes(file.id));
  const hasUnfavorited = selectedFiles.some((f) => !f.isFavorite);

  /**
   * 清空选中
   */
  const clearSelection = () => {
    setSelectedKeys([]);
  };

  /**
   * ESC 键取消多选
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedKeys.length > 0) {
        clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedKeys.length]);

  /**
   * 当目录变化时清空选中状态
   */
  useEffect(() => {
    clearSelection();
  }, [fileList.currentParentId, viewType]);

  /**
   * 触发文件选择
   */
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  /**
   * 处理文件选择
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 5) {
      toast.warning('一次最多只能上传5个文件');
      event.target.value = '';
      return;
    }

    toast.info(`准备上传 ${files.length} 个文件...`);
    event.target.value = '';
  };

  /**
   * 处理文件点击
   */
  const handleFileClick = (file: FileItem) => {
    if (file.isDir) {
      // 进入文件夹时清空选中状态
      clearSelection();
      fileList.enterFolder(file.id, viewMode);
    }
  };

  /**
   * 全选/取消全选
   */
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedKeys(fileList.fileList.map((f) => f.id));
    } else {
      setSelectedKeys([]);
    }
  };

  /**
   * 批量操作
   */
  const handleBatchDownload = () => {
    const downloadableFiles = selectedFiles.filter((f) => !f.isDir);
    if (downloadableFiles.length === 0) {
      toast.warning('没有可下载的文件');
      return;
    }
    operations.handleDownload(downloadableFiles);
    clearSelection();
  };

  const handleBatchShare = () => {
    if (selectedFiles.length === 0) return;
    operations.openBatchShareModal(selectedFiles);
  };

  const handleBatchFavorite = () => {
    if (selectedFiles.length === 0) return;
    operations.handleFavorite(selectedFiles);
    clearSelection();
  };

  const handleBatchMove = () => {
    if (selectedFiles.length === 0) return;
    operations.openBatchMoveModal(selectedFiles);
  };

  const handleBatchDelete = () => {
    if (selectedFiles.length === 0) return;
    operations.openBatchDeleteConfirm(selectedFiles);
  };

  const isAllSelected = fileList.fileList.length > 0 && selectedKeys.length === fileList.fileList.length;

  // 如果是回收站或我的分享视图,显示对应的特殊组件
  if (isRecycleBin) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">回收站</h1>
        </header>
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-muted-foreground">回收站功能开发中...</p>
        </div>
      </>
    );
  }

  if (isSharesView) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">我的分享</h1>
        </header>
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-muted-foreground">我的分享功能开发中...</p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header with Trigger and Toolbar */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Toolbar
          searchKeyword={fileList.searchKeyword}
          onSearchChange={fileList.setSearchKeyword}
          onSearch={fileList.search}
          onUpload={triggerFileSelect}
          onCreateFolder={operations.openCreateFolderModal}
          onRefresh={fileList.refresh}
          hideActions={isFavoritesView || isRecentsView}
        />
      </header>

      {/* Main Content */}
      <ContextMenu>
        <ContextMenuTrigger className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* 面包屑 */}
          <div className="pt-4">
            <FileBreadcrumb
              breadcrumbPath={fileList.breadcrumbPath}
              customTitle={isFavoritesView ? '我的收藏' : isRecentsView ? '最近使用' : undefined}
              onNavigate={fileList.navigateToFolder}
            />
          </div>

          {/* 视图控制栏 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {viewMode === 'grid' && (
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="全选"
                />
              )}
              <span className="text-sm text-muted-foreground">
                {selectedKeys.length > 0
                  ? `已选 ${selectedKeys.length} 项`
                  : `共 ${fileList.fileList.length} 项`}
              </span>
            </div>
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 文件内容区域 */}
          <div className="flex-1 overflow-auto">
            {fileList.loading ? (
              <div className="flex items-center justify-center h-48">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : fileList.fileList.length === 0 ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Empty className="border-none">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <FolderOpen className="h-12 w-12" />
                    </EmptyMedia>
                    <EmptyTitle>
                      {isFavoritesView
                        ? '暂无收藏文件'
                        : isRecentsView
                        ? '暂无最近使用文件'
                        : fileList.searchKeyword
                        ? '未找到匹配的文件'
                        : '文件夹为空'}
                    </EmptyTitle>
                    <EmptyDescription>
                      {isFavoritesView
                        ? '收藏的文件会显示在这里'
                        : isRecentsView
                        ? '最近访问的文件会显示在这里'
                        : fileList.searchKeyword
                        ? '尝试使用其他关键词搜索'
                        : '上传文件或创建文件夹开始使用'}
                    </EmptyDescription>
                  </EmptyHeader>
                  {!isFavoritesView && !isRecentsView && !fileList.searchKeyword && (
                    <EmptyContent>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={triggerFileSelect}>
                          <Upload className="h-4 w-4 mr-2" />
                          上传文件
                        </Button>
                        <Button variant="outline" size="sm" onClick={operations.openCreateFolderModal}>
                          <FolderPlus className="h-4 w-4 mr-2" />
                          新建文件夹
                        </Button>
                      </div>
                    </EmptyContent>
                  )}
                </Empty>
              </div>
            ) : viewMode === 'grid' ? (
              <FileGridView
                fileList={fileList.fileList}
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
                onFileClick={handleFileClick}
                onDownload={operations.handleDownload}
                onShare={operations.openShareModal}
                onDelete={operations.openDeleteConfirm}
                onRename={operations.openRenameModal}
                onMove={operations.openMoveModal}
                onFavorite={operations.handleFavorite}
                onPreview={operations.openPreview}
              />
            ) : (
              <FileListView
                fileList={fileList.fileList}
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
                onFileClick={handleFileClick}
                onSortChange={fileList.handleSortChange}
                onDownload={operations.handleDownload}
                onShare={operations.openShareModal}
                onDelete={operations.openDeleteConfirm}
                onRename={operations.openRenameModal}
                onMove={operations.openMoveModal}
                onFavorite={operations.handleFavorite}
                onPreview={operations.openPreview}
              />
            )}
          </div>
        </ContextMenuTrigger>
        {!isFavoritesView && !isRecentsView && (
          <ContextMenuContent>
            <ContextMenuGroup>
              <ContextMenuItem onClick={operations.openCreateFolderModal}>
                <FolderPlus className="h-4 w-4 mr-2" />
                新建文件夹
              </ContextMenuItem>
              <ContextMenuItem onClick={triggerFileSelect}>
                <Upload className="h-4 w-4 mr-2" />
                上传文件
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={fileList.refresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuContent>
        )}
      </ContextMenu>

      {/* 底部批量操作栏 */}
      {selectedKeys.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-black/90 backdrop-blur-sm text-white rounded-full px-4 py-3 shadow-2xl border border-white/10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-xl text-white hover:bg-white/10 hover:text-white"
                onClick={handleBatchDownload}
                title="下载"
              >
                <Download className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-xl text-white hover:bg-white/10 hover:text-white"
                onClick={handleBatchShare}
                title="分享"
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-xl text-white hover:bg-white/10 hover:text-white"
                onClick={handleBatchFavorite}
                title={hasUnfavorited ? '收藏' : '取消收藏'}
              >
                <Heart className={cn('h-5 w-5', !hasUnfavorited && 'fill-current')} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-xl text-white hover:bg-white/10 hover:text-white"
                onClick={handleBatchMove}
                title="移动"
              >
                <Move className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-xl text-white hover:bg-red-500/20 hover:text-red-400"
                onClick={handleBatchDelete}
                title="删除"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-xl text-white/60 hover:bg-white/10 hover:text-white"
              onClick={clearSelection}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}

      {/* 隐藏的文件选择input */}
      <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileSelect} />

      {/* 模态框 */}
      <CreateFolderModal
        open={operations.createFolderModalVisible}
        onOpenChange={operations.setCreateFolderModalVisible}
        parentId={fileList.currentParentId}
        onConfirm={operations.handleCreateFolder}
      />

      <RenameModal
        open={operations.renameModalVisible}
        onOpenChange={operations.setRenameModalVisible}
        file={operations.renamingFile}
        onConfirm={operations.handleRename}
      />

      <MoveModal
        open={operations.moveModalVisible}
        onOpenChange={operations.setMoveModalVisible}
        file={operations.movingFile}
        files={operations.movingFiles}
        onConfirm={operations.handleMove}
      />

      <ShareModal
        open={operations.shareModalVisible}
        onOpenChange={operations.setShareModalVisible}
        file={operations.sharingFile}
        files={operations.sharingFiles}
        onSuccess={clearSelection}
      />
    </>
  );
}
