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
import type { FileItem, SortOrder } from '@/types/file';
import { formatFileSize, formatDate } from '@/utils/format';
import { getFileIcon } from '@/utils/file-icon';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
}: FileListViewProps) {
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
              <TableRow
                key={file.id}
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
                      <img
                        src={getFileIcon(file.isDir ? 'dir' : file.suffix || '')}
                        alt={file.displayName}
                        className="w-7 h-7 object-contain"
                      />
                    </div>
                    <span className="text-sm font-normal text-foreground/90 truncate">{file.displayName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {file.isDir ? '-' : formatFileSize(file.size)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(file.updateTime, 'YYYY-MM-DD HH:mm')}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {!isSelected && (
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!file.isDir && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onPreview(file)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDownload(file)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onShare(file)}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn('h-8 w-8', file.isFavorite && 'text-red-500')}
                        onClick={() => onFavorite(file)}
                      >
                        <Heart className={cn('h-4 w-4', file.isFavorite && 'fill-current')} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => onDelete(file)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onRename(file)}>
                            <Edit className="h-4 w-4 mr-2" />
                            重命名
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onMove(file)}>
                            <Move className="h-4 w-4 mr-2" />
                            移动到
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
