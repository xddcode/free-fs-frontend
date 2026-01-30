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
import type { FileItem, SortOrder } from '@/types/file';
import { formatFileSize, formatTime } from '@/utils/format';
import { FileIcon } from '@/components/file-icon';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileListViewProps {
  fileList: FileItem[];
  selectedKeys: string[];
  onSelectionChange: (keys: string[]) => void;
  onFileClick: (file: FileItem) => void;
  onSortChange: (field: string, direction: SortOrder) => void;
  onDownload: (file: FileItem) => void;
  onShare: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onRename: (file: FileItem) => void;
  onMove: (file: FileItem) => void;
  onFavorite: (file: FileItem) => void;
  onPreview: (file: FileItem) => void;
  onDetail: (file: FileItem) => void;
}

export function FileListView({
  fileList,
  selectedKeys,
  onSelectionChange,
  onFileClick,
  onSortChange,
  onDownload,
  onShare,
  onDelete,
  onRename,
  onMove,
  onFavorite,
  onPreview,
  onDetail,
}: FileListViewProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleSelectChange = (fileId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedKeys, fileId]);
    } else {
      onSelectionChange(selectedKeys.filter((id) => id !== fileId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(fileList.map((f) => f.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleRowClick = (file: FileItem, event: React.MouseEvent) => {
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

  const isAllSelected = fileList.length > 0 && selectedKeys.length === fileList.length;

  return (
    <div className="flex-1 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">
              <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} aria-label="全选" />
            </TableHead>
            <TableHead className="font-medium text-muted-foreground">文件名</TableHead>
            <TableHead className="w-32 font-medium text-muted-foreground">大小</TableHead>
            <TableHead className="w-48 font-medium text-muted-foreground">修改时间</TableHead>
            <TableHead className="w-52 text-center font-medium text-muted-foreground">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fileList.map((file) => {
            const isSelected = selectedKeys.includes(file.id);
            return (
              <ContextMenu key={file.id}>
                <ContextMenuTrigger asChild>
                  <TableRow
                    className={cn('transition-colors group', isSelected && 'bg-primary/5')}
                    onClick={(e) => handleRowClick(file, e)}
                    onDoubleClick={() => handleDoubleClick(file)}
                  >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectChange(file.id, checked as boolean)}
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
                  {formatTime(file.updateTime)}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div 
                    className={cn(
                      "flex items-center justify-center gap-1 transition-opacity",
                      openMenuId === file.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                    style={{ visibility: isSelected ? 'hidden' : 'visible' }}
                  >
                    {!file.isDir && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onPreview(file); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onDownload(file); }}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onShare(file); }}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn('h-8 w-8', file.isFavorite && 'text-red-500')}
                        onClick={(e) => { e.stopPropagation(); onFavorite(file); }}
                      >
                        <Heart className={cn('h-4 w-4', file.isFavorite && 'fill-current')} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={(e) => { e.stopPropagation(); onDelete(file); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <DropdownMenu modal={false} onOpenChange={(open) => setOpenMenuId(open ? file.id : null)}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                  </TableRow>
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
        </TableBody>
      </Table>
    </div>
  );
}
