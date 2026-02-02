import { Eye, Download } from 'lucide-react';
import type { FileItem } from '@/types/file';
import { formatFileSize, formatFileTime } from '@/utils/format';
import { FileIcon } from '@/components/file-icon';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface ShareFileListViewProps {
  fileList: FileItem[];
  scope?: string;
  onFileClick: (file: FileItem) => void;
  onPreview: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
}

export function ShareFileListView({
  fileList,
  scope,
  onFileClick,
  onPreview,
  onDownload,
}: ShareFileListViewProps) {
  const hasPreviewPermission = () => scope?.includes('preview') ?? true;
  const hasDownloadPermission = () => scope?.includes('download') ?? true;

  const handleDoubleClick = (file: FileItem) => {
    if (file.isDir) {
      onFileClick(file);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-medium text-muted-foreground">文件名</TableHead>
            <TableHead className="w-32 font-medium text-muted-foreground">大小</TableHead>
            <TableHead className="w-48 font-medium text-muted-foreground">修改时间</TableHead>
            <TableHead className="w-40 text-center font-medium text-muted-foreground">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fileList.map((file) => (
            <TableRow
              key={file.id}
              className={cn('transition-colors group', file.isDir && 'cursor-pointer')}
              onDoubleClick={() => handleDoubleClick(file)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded">
                    <FileIcon type={file.isDir ? 'dir' : file.suffix || ''} size={28} className="shrink-0" />
                  </div>
                  <span className="text-sm font-normal text-foreground/90 truncate">{file.displayName}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {file.isDir ? '-' : formatFileSize(file.size)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatFileTime(file.updateTime)}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!file.isDir && hasPreviewPermission() && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreview(file);
                      }}
                      title="预览"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {!file.isDir && hasDownloadPermission() && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload(file);
                      }}
                      title="下载"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
