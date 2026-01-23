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
} from 'lucide-react';
import type { FileItem } from '@/types/file';
import { formatDate } from '@/utils/format';
import { getFileIcon, handleIconError } from '@/utils/file-icon';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
}: FileGridViewProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleSelectChange = (fileId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedKeys, fileId]);
    } else {
      onSelectionChange(selectedKeys.filter((id) => id !== fileId));
    }
  };

  const handleItemClick = (file: FileItem, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-checkbox]') || target.closest('[data-actions]')) {
      return;
    }

    const isMultiSelect = event.ctrlKey || event.metaKey;
    const newSelectedKeys = [...selectedKeys];
    const isCurrentlySelected = selectedKeys.includes(file.id);

    if (isMultiSelect) {
      if (isCurrentlySelected) {
        const index = newSelectedKeys.indexOf(file.id);
        if (index > -1) newSelectedKeys.splice(index, 1);
      } else {
        newSelectedKeys.push(file.id);
      }
    } else {
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
    <div className="p-4">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-4">
        {fileList.map((file) => {
          const isSelected = selectedKeys.includes(file.id);
          const isHovered = hoveredId === file.id;

          return (
            <div
              key={file.id}
              className={cn(
                'relative rounded-lg p-4 pb-2 text-center transition-all cursor-pointer group',
                'hover:bg-accent',
                isSelected && 'bg-accent'
              )}
              onMouseEnter={() => setHoveredId(file.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={(e) => handleItemClick(file, e)}
              onDoubleClick={() => handleDoubleClick(file)}
            >
              {/* 更多操作 */}
              {!isSelected && (
                <div
                  data-actions
                  className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 bg-background/95 backdrop-blur-sm shadow-sm hover:bg-background hover:shadow-md hover:scale-105"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!file.isDir && (
                        <>
                          <DropdownMenuItem onClick={() => onPreview(file)}>
                            <Eye className="h-4 w-4 mr-2" />
                            预览
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem onClick={() => onShare(file)}>
                        <Share2 className="h-4 w-4 mr-2" />
                        分享
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onFavorite(file)}>
                        <Heart
                          className={cn('h-4 w-4 mr-2', file.isFavorite && 'fill-current text-red-500')}
                        />
                        {file.isFavorite ? '取消收藏' : '收藏'}
                      </DropdownMenuItem>
                      {!file.isDir && (
                        <DropdownMenuItem onClick={() => onDownload(file)}>
                          <Download className="h-4 w-4 mr-2" />
                          下载
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onRename(file)}>
                        <Edit className="h-4 w-4 mr-2" />
                        重命名
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onMove(file)}>
                        <Move className="h-4 w-4 mr-2" />
                        移动到
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDelete(file)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        放入回收站
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* 文件图标 */}
              <div className="mb-3 flex justify-center items-center h-20 pt-1">
                <img
                  src={getFileIcon(file.isDir ? 'dir' : file.suffix || '')}
                  alt={file.displayName}
                  className="w-16 h-16 object-contain transition-transform group-hover:scale-105"
                  onError={handleIconError}
                />
              </div>

              {/* 文件名 */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-sm font-normal text-foreground mb-1 truncate px-1 leading-snug">
                      {file.displayName}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="space-y-1 py-0.5">
                      <div className="flex text-xs">
                        <span className="text-muted-foreground min-w-[70px]">名称：</span>
                        <span className="break-all">{file.displayName}</span>
                      </div>
                      <div className="flex text-xs">
                        <span className="text-muted-foreground min-w-[70px]">大小：</span>
                        <span>{file.size || '-'}</span>
                      </div>
                      <div className="flex text-xs">
                        <span className="text-muted-foreground min-w-[70px]">修改日期：</span>
                        <span>{formatDate(file.updateTime, 'YYYY-MM-DD HH:mm')}</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* 修改时间 */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(file.updateTime, 'YYYY-MM-DD HH:mm')}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="space-y-1 py-0.5">
                      <div className="flex text-xs">
                        <span className="text-muted-foreground min-w-[70px]">名称：</span>
                        <span className="break-all">{file.displayName}</span>
                      </div>
                      <div className="flex text-xs">
                        <span className="text-muted-foreground min-w-[70px]">大小：</span>
                        <span>{file.size || '-'}</span>
                      </div>
                      <div className="flex text-xs">
                        <span className="text-muted-foreground min-w-[70px]">修改日期：</span>
                        <span>{formatDate(file.updateTime, 'YYYY-MM-DD HH:mm')}</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        })}
      </div>
    </div>
  );
}
