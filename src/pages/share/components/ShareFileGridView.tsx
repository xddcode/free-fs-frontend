import { Eye, Download, MoreVertical } from 'lucide-react';
import type { FileItem } from '@/types/file';
import { formatFileTime } from '@/utils/format';
import { FileIcon } from '@/components/file-icon';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ShareFileGridViewProps {
  fileList: FileItem[];
  scope?: string;
  onFileClick: (file: FileItem) => void;
  onPreview: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
}

export function ShareFileGridView({
  fileList,
  scope,
  onFileClick,
  onPreview,
  onDownload,
}: ShareFileGridViewProps) {
  const hasPreviewPermission = () => scope?.includes('preview') ?? true;
  const hasDownloadPermission = () => scope?.includes('download') ?? true;

  const handleDoubleClick = (file: FileItem) => {
    if (file.isDir) {
      onFileClick(file);
    }
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-4">
        {fileList.map((file) => (
          <div
            key={file.id}
            className={cn(
              'relative rounded-lg p-4 pb-2 text-center transition-all group',
              'hover:bg-accent',
              file.isDir && 'cursor-pointer'
            )}
            onDoubleClick={() => handleDoubleClick(file)}
          >
            {/* 更多操作 */}
            {!file.isDir && (hasPreviewPermission() || hasDownloadPermission()) && (
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu modal={false}>
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
                    {hasPreviewPermission() && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreview(file);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        预览
                      </DropdownMenuItem>
                    )}
                    {hasDownloadPermission() && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(file);
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        下载
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

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
            <div className="text-xs text-muted-foreground">{formatFileTime(file.updateTime)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
