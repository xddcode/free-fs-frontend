import { useState, useEffect, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import type { FileItem, SortOrder } from '@/types/file'
import {
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
import { formatFileListDisplayTime, formatFileSize } from '@/utils/format'
import { usePermission } from '@/hooks/use-permission'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileIcon } from '@/components/file-icon'
import { useFileDragDrop } from '../hooks/useFileDragDrop'
import { FileListScrollSentinel } from './FileListScrollSentinel'

export function FileListRowActionIcon() {
  return (
    <span
      className='inline-flex flex-col items-center justify-center gap-[3px]'
      aria-hidden
    >
      <span className='size-1 rounded-full bg-current opacity-80' />
      <span className='size-1 rounded-full bg-current opacity-80' />
    </span>
  )
}

interface FileListViewProps {
  fileList: FileItem[]
  selectedKeys: string[]
  onSelectionChange: (keys: string[]) => void
  onFileClick: (file: FileItem) => void
  onSortChange: (field: string, direction: SortOrder) => void
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
  scrollRootRef?: RefObject<HTMLElement | null>
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
}: FileListViewProps) {
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

  const handleSelectChange = (fileId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedKeys, fileId])
    } else {
      onSelectionChange(selectedKeys.filter((id) => id !== fileId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(fileList.map((f) => f.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleRowClick = (file: FileItem, event: React.MouseEvent) => {
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

  const isAllSelected =
    fileList.length > 0 && selectedKeys.length === fileList.length

  const showNoMoreHint =
    !hasMore && !loadingMore && fileList.length > 0

  return (
    <div className='min-w-0'>
      <div className='overflow-hidden rounded-xl bg-background'>
        <Table>
          <TableHeader className='[&_tr]:border-0'>
            <TableRow className='border-0 hover:bg-transparent'>
              <TableHead className='text-muted-foreground h-[48px] w-12 px-3'>
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label={t('list.ariaSelectAll')}
                />
              </TableHead>
              <TableHead className='text-muted-foreground h-[48px] px-4 text-left text-sm font-medium'>
                {t('table.colName')}
              </TableHead>
              <TableHead className='text-muted-foreground h-[48px] w-[7.5rem] px-4 text-left text-sm font-medium'>
                {t('table.colSize')}
              </TableHead>
              <TableHead className='text-muted-foreground h-[48px] min-w-[11rem] px-4 text-left text-sm font-medium'>
                {t('table.colModified')}
              </TableHead>
              <TableHead className='text-muted-foreground h-[48px] w-14 px-2 text-right text-sm font-medium'>
                <span className='sr-only'>{t('list.ariaMore')}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {fileList.map((file) => {
            const isSelected = selectedKeys.includes(file.id)
            const isDragging = dragState.draggedItems.some(
              (f) => f.id === file.id
            )
            const isDropTarget =
              file.isDir && dragState.dropTargetId === file.id
            const isMultiSelected = selectedKeys.length > 1 && isSelected
            const selectedFiles = fileList.filter((f) =>
              selectedKeys.includes(f.id)
            )
            const hasUnfavorited = selectedFiles.some((f) => !f.isFavorite)
            const downloadableFiles = selectedFiles.filter((f) => !f.isDir)
            return (
              <ContextMenu key={file.id}>
                <ContextMenuTrigger asChild>
                  <TableRow
                    data-file-id={file.id}
                    className={cn(
                      'group min-h-[48px] border-b-0 transition-colors duration-150',
                      'hover:bg-primary/[0.06]',
                      isSelected &&
                        !isDropTarget &&
                        'bg-primary/[0.08] selected',
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
                    onClick={(e) => handleRowClick(file, e)}
                    onDoubleClick={() => handleDoubleClick(file)}
                  >
                    <TableCell
                      className='min-h-[48px] align-middle px-3 py-1.5'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleSelectChange(file.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className='min-h-[48px] align-middle px-4 py-1.5'>
                      <div className='flex min-w-0 items-center gap-2'>
                        <div className='flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/40'>
                          {file.thumbnailUrl ? (
                            <img
                              src={file.thumbnailUrl}
                              alt={file.displayName}
                              className='size-7 rounded object-cover pointer-events-none select-none'
                              draggable={false}
                              onContextMenu={(e) => e.preventDefault()}
                            />
                          ) : (
                            <FileIcon
                              type={file.isDir ? 'dir' : file.suffix || ''}
                              size={24}
                              className='shrink-0'
                            />
                          )}
                        </div>
                        <span
                          className={cn(
                            'min-w-0 line-clamp-2 break-words text-sm font-medium text-foreground/90 transition-colors',
                            'group-hover:text-primary'
                          )}
                          title={file.displayName}
                        >
                          {file.displayName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell
                      className={cn(
                        'min-h-[48px] align-middle px-4 py-1.5 text-sm tabular-nums text-muted-foreground transition-colors',
                        'group-hover:text-primary'
                      )}
                    >
                      {file.isDir ? '—' : formatFileSize(file.size)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'min-h-[48px] align-middle px-4 py-1.5 text-sm tabular-nums text-muted-foreground transition-colors',
                        'group-hover:text-primary'
                      )}
                    >
                      {formatFileListDisplayTime(file.updateTime)}
                    </TableCell>
                    <TableCell
                      className='min-h-[48px] align-middle px-2 py-1.5 text-right'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu
                        modal={false}
                        onOpenChange={(open) =>
                          setOpenMenuId(open ? file.id : null)
                        }
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className={cn(
                              'size-8 rounded-lg text-muted-foreground transition-colors',
                              'hover:bg-primary/10 hover:text-primary',
                              'group-hover:text-primary',
                              openMenuId === file.id && 'bg-primary/10 text-primary'
                            )}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={t('list.ariaMore')}
                          >
                            <FileListRowActionIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          {!file.isDir && canRead && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onPreview(file)
                              }}
                            >
                              <Eye className='size-4' />
                              {t('rowMenu.preview')}
                            </DropdownMenuItem>
                          )}
                          {canShare && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onShare(file)
                              }}
                            >
                              <Share2 className='size-4' />
                              {t('rowMenu.share')}
                            </DropdownMenuItem>
                          )}
                          {!file.isDir && canRead && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onDownload(file)
                              }}
                            >
                              <Download className='size-4' />
                              {t('rowMenu.download')}
                            </DropdownMenuItem>
                          )}
                          {canWrite && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onMove(file)
                              }}
                            >
                              <Move className='size-4' />
                              {t('rowMenu.move')}
                            </DropdownMenuItem>
                          )}
                          {canWrite && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onRename(file)
                              }}
                            >
                              <Edit className='size-4' />
                              {t('rowMenu.rename')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onDetail(file)
                            }}
                          >
                            <Info className='size-4' />
                            {t('rowMenu.detail')}
                          </DropdownMenuItem>
                          {canWrite && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onFavorite(file)
                              }}
                            >
                              <Heart
                                className={cn(
                                  'size-4',
                                  file.isFavorite && 'fill-current text-red-500'
                                )}
                              />
                              {file.isFavorite
                                ? t('rowMenu.unfavorite')
                                : t('rowMenu.favorite')}
                            </DropdownMenuItem>
                          )}
                          {canWrite && (
                            <>
                              <DropdownMenuSeparator className='bg-border' />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDelete(file)
                                }}
                                className='text-destructive focus:text-destructive'
                              >
                                <Trash2 className='size-4' />
                                {t('rowMenu.trash')}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
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
        </TableBody>
          </Table>
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
        <p className='py-6 text-center text-sm text-muted-foreground/55'>
          {t('index.noMore')}
        </p>
      )}
    </div>
  )
}
