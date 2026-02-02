import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { List, LayoutGrid, FileText, Upload, FolderPlus, RefreshCw } from 'lucide-react';
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
  SelectionDock,
  RecycleBinView,
  DeleteConfirmDialog,
  FileDetailModal,
  MySharesView,
} from './components';
import UploadModal from './components/UploadModal';
import UploadPanel from './components/UploadPanel';
import type { FileItem } from '@/types/file';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { toast } from 'sonner';

type ViewMode = 'list' | 'grid';

export default function FilesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 视图模式
  const [viewMode, setViewMode] = useState<ViewMode>((searchParams.get('viewMode') as ViewMode) || 'grid');

  // 选中的文件
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // 上传弹窗状态
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // 使用 hooks
  const fileList = useFileList();
  
  /**
   * 清空选中
   */
  const clearSelection = () => {
    setSelectedKeys([]);
  };
  
  const operations = useFileOperations(fileList.refresh, clearSelection, () => {
    // 在特殊视图中创建文件夹后，返回全部文件页面
    if (isFavoritesView || isRecentsView || isTypeFilter || isDirFilter) {
      navigate(`/files?viewMode=${viewMode}`);
    }
  });

  // 计算当前视图类型
  const viewType = searchParams.get('view');
  const fileType = searchParams.get('type');
  const isDirFilter = searchParams.get('isDir') === 'true';
  const isFavoritesView = viewType === 'favorites';
  const isRecentsView = viewType === 'recents';
  const isRecycleBin = viewType === 'recycle';
  const isSharesView = viewType === 'shares';
  const isTypeFilter = !!fileType;

  // 判断文件夹
  const selectedFiles = fileList.fileList.filter((file) => selectedKeys.includes(file.id));
  const hasUnfavorited = selectedFiles.some((f) => !f.isFavorite);

  /**
   * 键盘快捷键
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC 键取消多选
      if (e.key === 'Escape' && selectedKeys.length > 0) {
        clearSelection();
      }
      
      // F2 键重命名（仅当选中单个文件时）
      if (e.key === 'F2' && selectedKeys.length === 1) {
        e.preventDefault();
        const selectedFile = fileList.fileList.find((file) => file.id === selectedKeys[0]);
        if (selectedFile) {
          operations.openRenameModal(selectedFile);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedKeys, fileList.fileList]);

  /**
   * 当目录变化时清空选中状态
   */
  useEffect(() => {
    clearSelection();
  }, [fileList.currentParentId, viewType, fileType, isDirFilter]);

  /**
   * 监听文件上传完成事件
   */
  useEffect(() => {
    const handleUploadComplete = (event: Event) => {
      const customEvent = event as CustomEvent<{ parentId?: string }>;
      const { parentId } = customEvent.detail;
      
      // 如果是当前目录的文件，刷新列表
      if (parentId === fileList.currentParentId) {
        fileList.refresh();
      }
    };

    window.addEventListener('file-upload-complete', handleUploadComplete);

    return () => {
      window.removeEventListener('file-upload-complete', handleUploadComplete);
    };
  }, [fileList.currentParentId, fileList.refresh]);

  /**
   * 打开上传弹窗
   */
  const handleOpenUploadModal = () => {
    setUploadModalOpen(true);
  };

  /**
   * 处理文件点击
   */
  const handleFileClick = (file: FileItem) => {
    if (file.isDir) {
      // 进入文件夹时清空选中状态
      clearSelection();
      
      // 如果是在特殊视图中，进入文件夹后清除筛选参数，回到全部文件
      if (isFavoritesView || isRecentsView || isTypeFilter || isDirFilter) {
        // 使用 navigate 跳转到全部文件视图
        navigate(`/files?parentId=${file.id}&viewMode=${viewMode}`);
      } else {
        fileList.enterFolder(file.id, viewMode);
      }
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

  const handleBatchFavorite = async () => {
    if (selectedFiles.length === 0) return;
    await operations.handleFavorite(selectedFiles);
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
    return <RecycleBinView />;
  }

  if (isSharesView) {
    return <MySharesView />;
  }

  return (
    <div className="flex h-full flex-col">
      {/* 现代化顶部工具栏 */}
      <div className="flex items-center gap-4 border-b px-6 py-4">
        <SidebarTrigger className="md:hidden" />
        
        {/* 面包屑导航 */}
        <div className="flex-1 min-w-0">
          <FileBreadcrumb
            breadcrumbPath={fileList.breadcrumbPath}
            customTitle={
              // 在根目录且是特殊视图时显示标题
              fileList.breadcrumbPath.length === 0 && (isFavoritesView || isRecentsView || isTypeFilter || isDirFilter)
                ? isFavoritesView
                  ? '我的收藏'
                  : isRecentsView
                  ? '最近使用'
                  : isDirFilter
                  ? '文件夹'
                  : fileType === 'document'
                  ? '文档'
                  : fileType === 'image'
                  ? '图片'
                  : fileType === 'video'
                  ? '视频'
                  : fileType === 'audio'
                  ? '音频'
                  : fileType === 'other'
                  ? '其它'
                  : undefined
                : undefined
            }
            onNavigate={fileList.navigateToFolder}
          />
        </div>

        {/* 右侧工具栏 */}
        <Toolbar
          searchKeyword={fileList.searchKeyword}
          onSearchChange={fileList.setSearchKeyword}
          onSearch={fileList.search}
          onUpload={handleOpenUploadModal}
          onCreateFolder={operations.openCreateFolderModal}
          onRefresh={fileList.refresh}
          hideActions={false}
        />
      </div>

      {/* 次级工具栏：统计信息和视图切换 */}
      <div className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-3">
          {viewMode === 'grid' && fileList.fileList.length > 0 && (
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
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as ViewMode)}>
          <ToggleGroupItem value="grid" aria-label="网格视图" size="sm">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="列表视图" size="sm">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden">
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="h-full overflow-auto p-6">

              {fileList.loading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">加载中...</p>
                </div>
              ) : fileList.fileList.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Empty className="border-none">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <FileText className="h-12 w-12" />
                      </EmptyMedia>
                      <EmptyTitle>暂无文件</EmptyTitle>
                      <EmptyDescription>上传文件或创建文件夹开始使用</EmptyDescription>
                    </EmptyHeader>
                    {!fileList.searchKeyword && (
                      <EmptyContent>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleOpenUploadModal}>
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
              ) : (
                <div 
                  className="h-full" 
                  onClick={(e) => {
                    // 点击空白区域取消选择
                    if (e.target === e.currentTarget) {
                      clearSelection();
                    }
                  }}
                >
                  {viewMode === 'grid' ? (
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
                      onDetail={operations.openDetail}
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
                      onDetail={operations.openDetail}
                    />
                  )}
                </div>
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={operations.openCreateFolderModal}>
              <FolderPlus className="h-4 w-4 mr-2" />
              新建文件夹
            </ContextMenuItem>
            <ContextMenuItem onClick={handleOpenUploadModal}>
              <Upload className="h-4 w-4 mr-2" />
              上传文件
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => fileList.refresh()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>

      {/* 底部批量操作 Dock */}
      <SelectionDock
        selectedCount={selectedKeys.length}
        hasUnfavorited={hasUnfavorited}
        onDownload={handleBatchDownload}
        onShare={handleBatchShare}
        onFavorite={handleBatchFavorite}
        onMove={handleBatchMove}
        onDelete={handleBatchDelete}
        onClear={clearSelection}
      />

      {/* 上传弹窗 */}
      <UploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        parentId={fileList.currentParentId}
      />

      {/* 上传进度面板 */}
      <UploadPanel onSuccess={fileList.refresh} />

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
        onRefresh={fileList.refresh}
      />

      <ShareModal
        open={operations.shareModalVisible}
        onOpenChange={operations.setShareModalVisible}
        file={operations.sharingFile}
        files={operations.sharingFiles}
        onSuccess={clearSelection}
      />

      <DeleteConfirmDialog
        open={operations.deleteDialogVisible}
        onOpenChange={operations.setDeleteDialogVisible}
        files={operations.deletingFiles}
        onConfirm={operations.handleDelete}
      />

      <FileDetailModal
        open={operations.detailModalVisible}
        onOpenChange={operations.setDetailModalVisible}
        file={operations.detailFile}
        breadcrumbPath={fileList.breadcrumbPath}
      />
    </div>
  );
}
