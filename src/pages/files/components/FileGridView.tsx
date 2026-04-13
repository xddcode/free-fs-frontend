import { useState, useEffect, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import type { FileItem } from '@/types/file'
import {
  MoreHorizontal,
  Download,
  Share2,
  Heart,
  Move,
  Trash2,
  Edit,
  Eye,
  Info,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTime } from '@/utils/format'
import { usePermission } from '@/hooks/use-permission'
import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FileIcon } from '@/components/file-icon'
import { useFileDragDrop } from '../hooks/useFileDragDrop'
import { FileListScrollSentinel } from './FileListScrollSentinel'

interface FileGridViewProps {
  fileList: FileItem[]
  selectedKeys: string[]
  onSelectionChange: (keys: string[]) => void
  onFileClick: (file: FileItem) => void
  onDownload: (file: FileItem | FileItem[]) => void
  onShare: (file: FileItem) => void
  onDelete: (file: FileItem) => void
  onRename: (file: FileItem) => void
  onMove: (file: FileItem) => void
  onMoveFiles: (fileIds: string[], targetDirId: string) => Promise<void>
  onFavorite: (file: FileItem | FileItem[]) => void
  onPreview: (file: FileItem) => void
  onDetail: (file: FileItem) => void
  onDragStateChange?: (
    dropTargetName: string | null,
    draggedCount: number
  ) => void
  onBatchShare?: (files: FileItem[]) => void
  onBatchMove?: (files: FileItem[]) => void
  onBatchDelete?: (files: FileItem[]) => void
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
  /** 主内容区滚动容器，用于触底自动加载 */
  scrollRootRef?: RefObject<HTMLElement | null>
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
  onMoveFiles,
  onFavorite,
  onPreview,
  onDetail,
  onDragStateChange,
  onBatchShare,
  onBatchMove,
  onBatchDelete,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  scrollRootRef,
}: FileGridViewProps) {
  const { t } = useTranslation('files')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const { hasPermission } = usePermission()
  const canRead = hasPermission('file:read')
  const canWrite = hasPermission('file:write')
  const canShare = hasPermission('file:share')

  // 拖拽功能
  const {
    dragState,
    handleDragStart,
    handleDragEnd,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useFileDragDrop(selectedKeys, fileList, onMoveFiles)

  // 通知父组件拖拽状态变化
  useEffect(() => {
    if (onDragStateChange) {
      onDragStateChange(dragState.dropTargetName, dragState.draggedItems.length)
    }
  }, [
    dragState.dropTargetName,
    dragState.draggedItems.length,
    onDragStateChange,
  ])

  const handleItemClick = (file: FileItem, event: React.MouseEvent) => {
    const isMultiSelect = event.ctrlKey || event.metaKey
    const newSelectedKeys = [...selectedKeys]
    const isCurrentlySelected = selectedKeys.includes(file.id)

    if (isMultiSelect) {
      // CTRL + Click: 切换当前项状态
      if (isCurrentlySelected) {
        const index = newSelectedKeys.indexOf(file.id)
        if (index > -1) newSelectedKeys.splice(index, 1)
      } else {
        newSelectedKeys.push(file.id)
      }
    } else {
      // 普通左键点击: 仅选中当前项
      newSelectedKeys.splice(0, newSelectedKeys.length, file.id)
    }

    onSelectionChange(newSelectedKeys)
  }

  const handleDoubleClick = (file: FileItem) => {
    if (file.isDir) {
      onFileClick(file)
    } else if (canRead) {
      onPreview(file)
    }
  }

  /** 已全部拉取且无加载中时展示（与常见网盘底部提示一致） */
  const showNoMoreHint =
    !hasMore && !loadingMore && fileList.length > 0

  return (
    <div className='p-4'>
      <div className='relative'>
        <div className='grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-4'>
        {fileList.map((file) => {
          const isSelected = selectedKeys.includes(file.id)
          const isDragging = dragState.draggedItems.some(
            (f) => f.id === file.id
          )
          const isDropTarget = file.isDir && dragState.dropTargetId === file.id
          const isMultiSelected = selectedKeys.length > 1 && isSelected
          const selectedFiles = fileList.filter((f) =>
            selectedKeys.includes(f.id)
          )
          const hasUnfavorited = selectedFiles.some((f) => !f.isFavorite)
          const downloadableFiles = selectedFiles.filter((f) => !f.isDir)

          return (
            <ContextMenu key={file.id}>
              <ContextMenuTrigger asChild>
                <div
                  data-file-id={file.id}
                  className={cn(
                    'group relative cursor-pointer rounded-lg p-4 pb-2 text-center transition-all',
                    'hover:bg-accent',
                    isSelected && 'bg-primary/10 selected',
                    isDragging && 'cursor-move opacity-50',
                    isDropTarget && 'bg-primary/15 is-folder-drop-target'
                  )}
                  draggable={canWrite && !openMenuId}
                  onDragStart={(e) => canWrite && handleDragStart(e, file)}
                  onDragEnd={() => canWrite && handleDragEnd()}
                  onDragEnter={(e) => canWrite && handleDragEnter(e, file)}
                  onDragOver={(e) => canWrite && handleDragOver(e, file)}
                  onDragLeave={(e) => canWrite && handleDragLeave(e, file)}
                  onDrop={(e) => canWrite && handleDrop(e, file)}
                  onClick={(e) => handleItemClick(file, e)}
                  onDoubleClick={() => handleDoubleClick(file)}
                >
                  {/* 更多操作 */}
                  <div
                    className={cn(
                      'absolute top-2 right-2 z-10 transition-opacity',
                      openMenuId === file.id
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    )}
                    style={{ visibility: isSelected ? 'hidden' : 'visible' }}
                  >
                    <DropdownMenu
                      modal={false}
                      onOpenChange={(open) =>
                        setOpenMenuId(open ? file.id : null)
                      }
                    >
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 bg-background/95 shadow-sm backdrop-blur-sm hover:scale-105 hover:bg-background hover:shadow-md'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        {!file.isDir && canRead && (
                          <>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onPreview(file)
                              }}
                            >
                              <Eye className='mr-2 h-4 w-4' />
                              {t('rowMenu.preview')}
                            </DropdownMenuItem>
                          </>
                        )}
                        {canShare && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onShare(file)
                            }}
                          >
                            <Share2 className='mr-2 h-4 w-4' />
                            {t('rowMenu.share')}
                          </DropdownMenuItem>
                        )}
                        {canWrite && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onFavorite(file)
                            }}
                          >
                            <Heart
                              className={cn(
                                'mr-2 h-4 w-4',
                                file.isFavorite && 'fill-current text-red-500'
                              )}
                            />
                            {file.isFavorite
                              ? t('rowMenu.unfavorite')
                              : t('rowMenu.favorite')}
                          </DropdownMenuItem>
                        )}
                        {!file.isDir && canRead && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onDownload(file)
                            }}
                          >
                            <Download className='mr-2 h-4 w-4' />
                            {t('rowMenu.download')}
                          </DropdownMenuItem>
                        )}
                        {canWrite && <DropdownMenuSeparator />}
                        {canWrite && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onRename(file)
                            }}
                          >
                            <Edit className='mr-2 h-4 w-4' />
                            {t('rowMenu.rename')}
                          </DropdownMenuItem>
                        )}
                        {canWrite && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onMove(file)
                            }}
                          >
                            <Move className='mr-2 h-4 w-4' />
                            {t('rowMenu.move')}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onDetail(file)
                          }}
                        >
                          <Info className='mr-2 h-4 w-4' />
                          {t('rowMenu.detail')}
                        </DropdownMenuItem>
                        {canWrite && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onDelete(file)
                              }}
                              className='text-destructive'
                            >
                              <Trash2 className='mr-2 h-4 w-4' />
                              {t('rowMenu.trash')}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* 缩略图 95×75；文件夹同宽，略增高以容纳 Folder 顶部标签（勿 overflow-hidden） */}
                  <div className='mb-3 flex min-h-[90px] items-center justify-center overflow-visible pt-1'>
                    {file.thumbnailUrl ? (
                      <div className='h-[75px] w-[95px] shrink-0 overflow-hidden rounded-md shadow-sm transition-transform group-hover:scale-[1.02]'>
                        <img
                          src={file.thumbnailUrl}
                          alt={file.displayName}
                          className='h-full w-full object-cover object-center pointer-events-none select-none'
                          draggable={false}
                          onContextMenu={(e) => e.preventDefault()}
                        />
                      </div>
                    ) : file.isDir ? (
                      <div className='flex w-[95px] shrink-0 items-center justify-center overflow-visible pt-1'>
                        <FileIcon
                          type='dir'
                          size={86}
                          className='transition-transform group-hover:scale-[1.02]'
                        />
                      </div>
                    ) : (
                      <FileIcon
                        type={file.suffix || ''}
                        size={56}
                        className='transition-transform group-hover:scale-105'
                      />
                    )}
                  </div>

                  {/* 文件名 */}
                  <div
                    className='mb-1 line-clamp-2 break-words px-1 text-center text-sm leading-snug font-normal text-foreground'
                    title={file.displayName}
                  >
                    {file.displayName}
                  </div>

                  {/* 修改时间 */}
                  <div className='text-xs text-muted-foreground'>
                    {formatTime(file.updateTime)}
                  </div>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                {isMultiSelected ? (
                  // 多选菜单
                  <>
                    {canRead && downloadableFiles.length > 0 && (
                      <ContextMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onDownload(downloadableFiles)
                        }}
                      >
                        <Download className='mr-2 h-4 w-4' />
                        {t('rowMenu.download')}
                      </ContextMenuItem>
                    )}
                    {canShare && onBatchShare && (
                      <ContextMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onBatchShare(selectedFiles)
                        }}
                      >
                        <Share2 className='mr-2 h-4 w-4' />
                        {t('rowMenu.share')}
                      </ContextMenuItem>
                    )}
                    {canWrite && (
                      <ContextMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onFavorite(selectedFiles)
                        }}
                      >
                        <Heart
                          className={cn(
                            'mr-2 h-4 w-4',
                            !hasUnfavorited && 'fill-current text-red-500'
                          )}
                        />
                        {hasUnfavorited
                          ? t('rowMenu.favorite')
                          : t('rowMenu.unfavorite')}
                      </ContextMenuItem>
                    )}
                    {canWrite && <ContextMenuSeparator />}
                    {canWrite && onBatchMove && (
                      <ContextMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onBatchMove(selectedFiles)
                        }}
                      >
                        <Move className='mr-2 h-4 w-4' />
                        {t('rowMenu.move')}
                      </ContextMenuItem>
                    )}
                    {canWrite && onBatchDelete && (
                      <ContextMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onBatchDelete(selectedFiles)
                        }}
                        className='text-destructive focus:text-destructive'
                      >
                        <Trash2 className='mr-2 h-4 w-4' />
                        {t('rowMenu.trash')}
                      </ContextMenuItem>
                    )}
                  </>
                ) : (
                  // 单选菜单
                  <>
                    {!file.isDir && canRead && (
                      <>
                        <ContextMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onPreview(file)
                          }}
                        >
                          <Eye className='mr-2 h-4 w-4' />
                          {t('rowMenu.preview')}
                        </ContextMenuItem>
                      </>
                    )}
                    {canShare && (
                      <ContextMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onShare(file)
                        }}
                      >
                        <Share2 className='mr-2 h-4 w-4' />
                        {t('rowMenu.share')}
                      </ContextMenuItem>
                    )}
                    {canWrite && (
                      <ContextMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onFavorite(file)
                        }}
                      >
                        <Heart
                          className={cn(
                            'mr-2 h-4 w-4',
                            file.isFavorite && 'fill-current text-red-500'
                          )}
                        />
                        {file.isFavorite
                          ? t('rowMenu.unfavorite')
                          : t('rowMenu.favorite')}
                      </ContextMenuItem>
                    )}
                    {!file.isDir && canRead && (
                      <ContextMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onDownload(file)
                        }}
                      >
                        <Download className='mr-2 h-4 w-4' />
                        {t('rowMenu.download')}
                      </ContextMenuItem>
                    )}
                    {canWrite && <ContextMenuSeparator />}
                    {canWrite && (
                      <ContextMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onRename(file)
                        }}
                      >
                        <Edit className='mr-2 h-4 w-4' />
                        {t('rowMenu.rename')}
                      </ContextMenuItem>
                    )}
                    {canWrite && (
                      <ContextMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onMove(file)
                        }}
                      >
                        <Move className='mr-2 h-4 w-4' />
                        {t('rowMenu.move')}
                      </ContextMenuItem>
                    )}
                    <ContextMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onDetail(file)
                      }}
                    >
                      <Info className='mr-2 h-4 w-4' />
                      {t('rowMenu.detail')}
                    </ContextMenuItem>
                    {canWrite && (
                      <>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(file)
                          }}
                          className='text-destructive focus:text-destructive'
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          {t('rowMenu.trash')}
                        </ContextMenuItem>
                      </>
                    )}
                  </>
                )}
              </ContextMenuContent>
            </ContextMenu>
          )
        })}
        </div>
      </div>
      {scrollRootRef && onLoadMore && (
        <FileListScrollSentinel
          scrollRootRef={scrollRootRef}
          hasMore={!!hasMore}
          onLoadMore={onLoadMore}
        />
      )}
      {loadingMore && (
        <div className='flex justify-center py-4'>
          <Loader2
            className='h-5 w-5 shrink-0 animate-spin text-muted-foreground'
            aria-hidden
          />
          <span className='sr-only'>{t('list.loading')}</span>
        </div>
      )}
      {showNoMoreHint && (
        <p className='mt-6 pb-2 text-center text-sm text-muted-foreground/55'>
          {t('index.noMore')}
        </p>
      )}
    </div>
  )
}
