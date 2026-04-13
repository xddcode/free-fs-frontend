import { useTranslation } from 'react-i18next'
import { Search, Upload, FolderPlus, RefreshCw, FolderUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RequirePermission } from '@/components/require-permission'

interface ToolbarProps {
  searchKeyword: string
  onSearchChange: (keyword: string) => void
  onSearch: (keyword: string) => void
  onUpload: () => void
  onUploadDirectory?: () => void
  onCreateFolder: () => void
  onRefresh: () => void
  hideActions?: boolean
}

export function Toolbar({
  searchKeyword,
  onSearchChange,
  onSearch,
  onUpload,
  onUploadDirectory,
  onCreateFolder,
  onRefresh,
  hideActions = false,
}: ToolbarProps) {
  const { t } = useTranslation('files')
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(searchKeyword)
    }
  }

  return (
    <div className='flex items-center gap-2'>
      <div className='relative w-64'>
        <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          placeholder={t('toolbar.searchPlaceholder')}
          value={searchKeyword}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className='pl-9'
        />
      </div>
      <Button variant='outline' size='icon' onClick={onRefresh}>
        <RefreshCw className='h-4 w-4' />
      </Button>
      {!hideActions && (
        <>
          <RequirePermission code='file:write'>
          <Button onClick={onUpload} size='sm'>
            <Upload className='mr-2 h-4 w-4' />
            {t('index.uploadFile')}
          </Button>
          </RequirePermission>
          {onUploadDirectory && (
            <RequirePermission code='file:write'>
            <Button onClick={onUploadDirectory} variant='outline' size='sm'>
              <FolderUp className='mr-2 h-4 w-4' />
              {t('index.uploadFolder')}
            </Button>
            </RequirePermission>
          )}
          <RequirePermission code='file:write'>
          <Button onClick={onCreateFolder} variant='outline' size='sm'>
            <FolderPlus className='mr-2 h-4 w-4' />
            {t('index.newFolder')}
          </Button>
          </RequirePermission>
        </>
      )}
    </div>
  )
}
