import { Search, Upload, FolderPlus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ToolbarProps {
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  onSearch: (keyword: string) => void;
  onUpload: () => void;
  onCreateFolder: () => void;
  onRefresh: () => void;
  hideActions?: boolean;
}

export function Toolbar({
  searchKeyword,
  onSearchChange,
  onSearch,
  onUpload,
  onCreateFolder,
  onRefresh,
  hideActions = false,
}: ToolbarProps) {
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(searchKeyword);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        {!hideActions && (
          <>
            <Button onClick={onUpload} size="sm">
              <Upload className="h-4 w-4 mr-2" />
              上传文件
            </Button>
            <Button onClick={onCreateFolder} variant="outline" size="sm">
              <FolderPlus className="h-4 w-4 mr-2" />
              新建文件夹
            </Button>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索文件..."
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-9"
          />
        </div>
        <Button variant="ghost" size="icon" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
