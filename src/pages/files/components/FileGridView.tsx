import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTime } from '@/utils/format'
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
}: FileGridViewProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

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
    } else {
      onPreview(file)
    }
  }

  return (
    <div
      className='p-4'
      onClick={(e) => {
        // 点击空白区域取消选择
        if (e.target === e.currentTarget) {
          onSelectionChange([])
        }
      }}
    >
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
                  className={cn(
                    'group relative cursor-pointer rounded-lg p-4 pb-2 text-center transition-all',
                    'hover:bg-accent',
                    isSelected && 'bg-primary/10 selected',
                    isDragging && 'cursor-move opacity-50',
                    isDropTarget && 'bg-primary/15'
                  )}
                  draggable={!openMenuId}
                  onDragStart={(e) => handleDragStart(e, file)}
                  onDragEnd={handleDragEnd}
                  onDragEnter={(e) => handleDragEnter(e, file)}
                  onDragOver={(e) => handleDragOver(e, file)}
                  onDragLeave={(e) => handleDragLeave(e, file)}
                  onDrop={(e) => handleDrop(e, file)}
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
                        {!file.isDir && (
                          <>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onPreview(file)
                              }}
                            >
                              <Eye className='mr-2 h-4 w-4' />
                              预览
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onShare(file)
                          }}
                        >
                          <Share2 className='mr-2 h-4 w-4' />
                          分享
                        </DropdownMenuItem>
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
                          {file.isFavorite ? '取消收藏' : '收藏'}
                        </DropdownMenuItem>
                        {!file.isDir && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onDownload(file)
                            }}
                          >
                            <Download className='mr-2 h-4 w-4' />
                            下载
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onRename(file)
                          }}
                        >
                          <Edit className='mr-2 h-4 w-4' />
                          重命名
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onMove(file)
                          }}
                        >
                          <Move className='mr-2 h-4 w-4' />
                          移动到
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onDetail(file)
                          }}
                        >
                          <Info className='mr-2 h-4 w-4' />
                          详细信息
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(file)
                          }}
                          className='text-destructive'
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          放入回收站
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* 文件图标或缩略图 */}
                  <div className='mb-3 flex h-20 items-center justify-center pt-1'>
                    {file.thumbnailUrl ? (
                      <img
                        src={file.thumbnailUrl}
                        alt={file.displayName}
                        className='h-14 w-14 rounded object-cover transition-transform group-hover:scale-105 pointer-events-none select-none'
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    ) : (
                      <FileIcon
                        type={file.isDir ? 'dir' : file.suffix || ''}
                        size={56}
                        className='transition-transform group-hover:scale-105'
                      />
                    )}
                  </div>

                  {/* 文件名 */}
                  <div className='mb-1 truncate px-1 text-sm leading-snug font-normal text-foreground'>
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
                    {downloadableFiles.length > 0 && (
                      <ContextMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onDownload(downloadableFiles)
                        }}
                      >
                        <Download className='mr-2 h-4 w-4' />
                        下载
                      </ContextMenuItem>
                    )}
                    {onBatchShare && (
                      <ContextMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onBatchShare(selectedFiles)
                        }}
                      >
                        <Share2 className='mr-2 h-4 w-4' />
                        分享
                      </ContextMenuItem>
                    )}
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
                      {hasUnfavorited ? '收藏' : '取消收藏'}
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    {onBatchMove && (
                      <ContextMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onBatchMove(selectedFiles)
                        }}
                      >
                        <Move className='mr-2 h-4 w-4' />
                        移动到
                      </ContextMenuItem>
                    )}
                    <ContextMenuSeparator />
                    {onBatchDelete && (
                      <ContextMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onBatchDelete(selectedFiles)
                        }}
                        className='text-destructive focus:text-destructive'
                      >
                        <Trash2 className='mr-2 h-4 w-4' />
                        放入回收站
                      </ContextMenuItem>
                    )}
                  </>
                ) : (
                  // 单选菜单
                  <>
                    {!file.isDir && (
                      <>
                        <ContextMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onPreview(file)
                          }}
                        >
                          <Eye className='mr-2 h-4 w-4' />
                          预览
                        </ContextMenuItem>
                      </>
                    )}
                    <ContextMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onShare(file)
                      }}
                    >
                      <Share2 className='mr-2 h-4 w-4' />
                      分享
                    </ContextMenuItem>
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
                      {file.isFavorite ? '取消收藏' : '收藏'}
                    </ContextMenuItem>
                    {!file.isDir && (
                      <ContextMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onDownload(file)
                        }}
                      >
                        <Download className='mr-2 h-4 w-4' />
                        下载
                      </ContextMenuItem>
                    )}
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onRename(file)
                      }}
                    >
                      <Edit className='mr-2 h-4 w-4' />
                      重命名
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onMove(file)
                      }}
                    >
                      <Move className='mr-2 h-4 w-4' />
                      移动到
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onDetail(file)
                      }}
                    >
                      <Info className='mr-2 h-4 w-4' />
                      详细信息
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(file)
                      }}
                      className='text-destructive focus:text-destructive'
                    >
                      <Trash2 className='mr-2 h-4 w-4' />
                      放入回收站
                    </ContextMenuItem>
                  </>
                )}
              </ContextMenuContent>
            </ContextMenu>
          )
        })}
      </div>
    </div>
  )
}
