import { useState } from 'react';
import {
  MoreVertical,
  Download,
  Share2,
  Heart,
  Move,
  Trash2,
  Edit,
  Eye,
  Info,
} from 'lucide-react';
import type { FileItem } from '@/types/file';
import { formatTime } from '@/utils/format';
import { FileIcon } from '@/components/file-icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileGridViewProps {
  fileList: FileItem[];
  selectedKeys: string[];
  onSelectionChange: (keys: string[]) => void;
  onFileClick: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
  onShare: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onRename: (file: FileItem) => void;
  onMove: (file: FileItem) => void;
  onFavorite: (file: FileItem) => void;
  onPreview: (file: FileItem) => void;
  onDetail: (file: FileItem) => void;
}

export function FileGridView({
  fileList,
  selectedKeys,
  onSelectionChange,
  onFileClick,
  onDownload,
  onShare,
  onDelete,
  onRename,
  onMove,
  onFavorite,
  onPreview,
  onDetail,
}: FileGridViewProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleItemClick = (file: FileItem, event: React.MouseEvent) => {
    const isMultiSelect = event.ctrlKey || event.metaKey;
    const newSelectedKeys = [...selectedKeys];
    const isCurrentlySelected = selectedKeys.includes(file.id);

    if (isMultiSelect) {
      // CTRL + Click: 切换当前项状态
      if (isCurrentlySelected) {
        const index = newSelectedKeys.indexOf(file.id);
        if (index > -1) newSelectedKeys.splice(index, 1);
      } else {
        newSelectedKeys.push(file.id);
      }
    } else {
      // 普通左键点击: 仅选中当前项
      newSelectedKeys.splice(0, newSelectedKeys.length, file.id);
    }

    onSelectionChange(newSelectedKeys);
  };

  const handleDoubleClick = (file: FileItem) => {
    if (file.isDir) {
      onFileClick(file);
    } else {
      onPreview(file);
    }
  };

  return (
    <div className="p-4" onClick={(e) => {
      // 点击空白区域取消选择
      if (e.target === e.currentTarget) {
        onSelectionChange([]);
      }
    }}>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-4">
        {fileList.map((file) => {
          const isSelected = selectedKeys.includes(file.id);

          return (
            <ContextMenu key={file.id}>
              <ContextMenuTrigger asChild>
                <div
                  className={cn(
                    'relative rounded-lg p-4 pb-2 text-center transition-all cursor-pointer group',
                    'hover:bg-accent',
                    isSelected && 'bg-primary/10'
                  )}
                  onClick={(e) => handleItemClick(file, e)}
                  onDoubleClick={() => handleDoubleClick(file)}
                >
              {/* 更多操作 */}
              <div
                className={cn(
                  "absolute top-2 right-2 z-10 transition-opacity",
                  openMenuId === file.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                style={{ visibility: isSelected ? 'hidden' : 'visible' }}
              >
                <DropdownMenu modal={false} onOpenChange={(open) => setOpenMenuId(open ? file.id : null)}>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 bg-background/95 backdrop-blur-sm shadow-sm hover:bg-background hover:shadow-md hover:scale-105"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!file.isDir && (
                        <>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPreview(file); }}>
                            <Eye className="h-4 w-4 mr-2" />
                            预览
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(file); }}>
                        <Share2 className="h-4 w-4 mr-2" />
                        分享
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFavorite(file); }}>
                        <Heart
                          className={cn('h-4 w-4 mr-2', file.isFavorite && 'fill-current text-red-500')}
                        />
                        {file.isFavorite ? '取消收藏' : '收藏'}
                      </DropdownMenuItem>
                      {!file.isDir && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDownload(file); }}>
                          <Download className="h-4 w-4 mr-2" />
                          下载
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(file); }}>
                        <Edit className="h-4 w-4 mr-2" />
                        重命名
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove(file); }}>
                        <Move className="h-4 w-4 mr-2" />
                        移动到
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDetail(file); }}>
                        <Info className="h-4 w-4 mr-2" />
                        详细信息
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(file); }} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        放入回收站
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

              {/* 文件图标 */}
              <div className="mb-3 flex justify-center items-center h-20 pt-1">
                <FileIcon
                  type={file.isDir ? 'dir' : file.suffix || ''}
                  size={56}
                  className="transition-transform group-hover:scale-105"
                />
              </div>

              {/* 文件名 */}
              <div className="text-sm font-normal text-foreground mb-1 truncate px-1 leading-snug">
                {file.displayName}
              </div>

              {/* 修改时间 */}
              <div className="text-xs text-muted-foreground">
                {formatTime(file.updateTime)}
              </div>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                {!file.isDir && (
                  <>
                    <ContextMenuItem onClick={(e) => { e.stopPropagation(); onPreview(file); }}>
                      <Eye className="h-4 w-4 mr-2" />
                      预览
                    </ContextMenuItem>
                  </>
                )}
                <ContextMenuItem onClick={(e) => { e.stopPropagation(); onShare(file); }}>
                  <Share2 className="h-4 w-4 mr-2" />
                  分享
                </ContextMenuItem>
                <ContextMenuItem onClick={(e) => { e.stopPropagation(); onFavorite(file); }}>
                  <Heart
                    className={cn('h-4 w-4 mr-2', file.isFavorite && 'fill-current text-red-500')}
                  />
                  {file.isFavorite ? '取消收藏' : '收藏'}
                </ContextMenuItem>
                {!file.isDir && (
                  <ContextMenuItem onClick={(e) => { e.stopPropagation(); onDownload(file); }}>
                    <Download className="h-4 w-4 mr-2" />
                    下载
                  </ContextMenuItem>
                )}
                <ContextMenuSeparator />
                <ContextMenuItem onClick={(e) => { e.stopPropagation(); onRename(file); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  重命名
                </ContextMenuItem>
                <ContextMenuItem onClick={(e) => { e.stopPropagation(); onMove(file); }}>
                  <Move className="h-4 w-4 mr-2" />
                  移动到
                </ContextMenuItem>
                <ContextMenuItem onClick={(e) => { e.stopPropagation(); onDetail(file); }}>
                  <Info className="h-4 w-4 mr-2" />
                  详细信息
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={(e) => { e.stopPropagation(); onDelete(file); }} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  放入回收站
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </div>
    </div>
  );
}
