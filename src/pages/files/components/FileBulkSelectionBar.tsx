import {
  Download,
  Edit,
  Share2,
  Heart,
  Move,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BulkSelectionBar } from '@/components/bulk-selection-bar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface FileBulkSelectionBarProps {
  selectedCount: number
  hasUnfavorited: boolean
  onDownload: () => void
  onRename: () => void
  onShare: () => void
  onFavorite: () => void
  onMove: () => void
  onDelete: () => void
  onClear: () => void
}

export function FileBulkSelectionBar({
  selectedCount,
  hasUnfavorited,
  onDownload,
  onRename,
  onShare,
  onFavorite,
  onMove,
  onDelete,
  onClear,
}: FileBulkSelectionBarProps) {
  return (
    <BulkSelectionBar
      selectedCount={selectedCount}
      onClear={onClear}
      ariaLabel='文件列表批量操作'
    >
      {selectedCount === 1 ? (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='outline'
                size='icon'
                className='size-8 shrink-0'
                onClick={onDownload}
                aria-label='下载'
              >
                <Download />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>下载</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='outline'
                size='icon'
                className='size-8 shrink-0'
                onClick={onRename}
                aria-label='重命名'
              >
                <Edit />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>重命名</p>
            </TooltipContent>
          </Tooltip>
        </>
      ) : null}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='size-8 shrink-0'
            onClick={onShare}
            aria-label='分享'
          >
            <Share2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>分享</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='size-8 shrink-0'
            onClick={onFavorite}
            aria-label='收藏'
          >
            <Heart fill={hasUnfavorited ? 'none' : 'currentColor'} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>收藏</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='size-8 shrink-0'
            onClick={onMove}
            aria-label='移动到'
          >
            <Move />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>移动到</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type='button'
            variant='destructive'
            size='icon'
            className='size-8 shrink-0'
            onClick={onDelete}
            aria-label='放入回收站'
          >
            <Trash2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>放入回收站</p>
        </TooltipContent>
      </Tooltip>
    </BulkSelectionBar>
  )
}
