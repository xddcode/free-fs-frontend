import { useState, useEffect } from 'react'
import type { FileItem, BreadcrumbItem } from '@/types/file'
import { toast } from 'sonner'
import { getFileDetail } from '@/api/file'
import { formatFileSize, formatTime } from '@/utils/format'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { FileIcon } from '@/components/file-icon'

interface FileDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: FileItem | null
  breadcrumbPath: BreadcrumbItem[]
}

export function FileDetailModal({
  open,
  onOpenChange,
  file,
  breadcrumbPath,
}: FileDetailModalProps) {
  const [loading, setLoading] = useState(false)
  const [detailData, setDetailData] = useState<FileItem | null>(null)

  // 加载文件详情
  useEffect(() => {
    if (open && file) {
      loadFileDetail()
    } else {
      setDetailData(null)
    }
  }, [open, file])

  const loadFileDetail = async () => {
    if (!file) return

    setLoading(true)
    try {
      const data = await getFileDetail(file.id)
      setDetailData(data)
    } finally {
      setLoading(false)
    }
  }

  if (!file) return null

  const displayFile = detailData || file

  // 格式化大小显示
  const formatSizeDisplay = () => {
    if (displayFile.isDir) {
      const sizeStr = formatFileSize(displayFile.size || 0)
      const fileCount = displayFile.includeFiles ?? 0
      const folderCount = displayFile.includeFolders ?? 0
      return `${sizeStr}（包含 ${fileCount} 个文件，${folderCount} 个文件夹）`
    }
    return formatFileSize(displayFile.size || 0)
  }

  // 格式化文件位置
  const formatFileLocation = () => {
    if (breadcrumbPath.length === 0) {
      return '全部文件'
    }
    return '全部文件 / ' + breadcrumbPath.map((item) => item.name).join(' / ')
  }

  const detailItems = [
    { label: '文件名', value: displayFile.displayName },
    { label: '大小', value: formatSizeDisplay() },
    { label: '文件位置', value: formatFileLocation() },
    { label: '上传时间', value: formatTime(displayFile.uploadTime) },
    {
      label: '最后访问时间',
      value: displayFile.lastAccessTime
        ? formatTime(displayFile.lastAccessTime)
        : '-',
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='sm:max-w-[500px]'
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>详细信息</DialogTitle>
        </DialogHeader>

        <div className='space-y-6 px-6 pb-4'>
          {/* 文件图标或缩略图 */}
          <div className='flex justify-center'>
            {displayFile.thumbnailUrl ? (
              <img
                src={displayFile.thumbnailUrl}
                alt={displayFile.displayName}
                className='h-[100px] w-[100px] rounded object-cover pointer-events-none select-none'
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            ) : (
              <FileIcon
                type={displayFile.isDir ? 'dir' : displayFile.suffix || ''}
                size={100}
              />
            )}
          </div>

          {/* 详细信息列表 */}
          <div className='space-y-3'>
            {loading ? (
              // 加载骨架屏
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className='space-y-1.5'>
                    <Skeleton className='h-3 w-20' />
                    <Skeleton className='h-4 w-full' />
                  </div>
                ))}
              </>
            ) : (
              detailItems.map((item, index) => (
                <div key={index} className='space-y-1.5'>
                  <div className='text-xs text-muted-foreground'>
                    {item.label}
                  </div>
                  <div className='text-sm break-all text-foreground'>
                    {item.value}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
