import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import {
  getHomeInfo,
  HOME_INFO_REFETCH_INTERVAL_MS,
  type HomeUsedBytesUnit,
} from '@/api/home'
import type { FileItem } from '@/types/file'
import { formatDate, formatFileSize } from '@/utils/format'
import { openFilePreviewWithToken } from '@/utils/preview'
import { FileIcon } from '@/components/file-icon'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

function RecentFilesTableInner({ files }: { files: FileItem[] }) {
  const navigate = useNavigate()

  const openItem = React.useCallback(
    async (file: FileItem) => {
      if (file.isDir) {
        navigate(`/files?parentId=${file.id}`)
        return
      }
      await openFilePreviewWithToken(
        file.id,
        import.meta.env.VITE_API_VIEW_URL
      )
    },
    [navigate]
  )

  return (
    <>
      <div className='mb-4 flex items-center justify-between gap-3'>
        <h2 className='text-lg font-semibold tracking-tight'>最近文件</h2>
        <Link
          to='/files'
          className='text-muted-foreground hover:text-foreground text-sm font-medium transition-colors'
        >
          文件管理
        </Link>
      </div>

      <div className='overflow-hidden rounded-xl border border-border/60'>
        <Table>
          <TableHeader className='bg-muted/30 [&_tr]:border-border/60'>
            <TableRow className='border-border/60 hover:bg-transparent'>
              <TableHead className='text-muted-foreground h-11 px-4 font-medium'>
                名称
              </TableHead>
              <TableHead className='text-muted-foreground h-11 px-4 font-medium'>
                修改日期
              </TableHead>
              <TableHead className='text-muted-foreground h-11 px-4 text-right font-medium'>
                大小
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.length > 0 ? (
              files.map((file) => (
                <TableRow
                  key={file.id}
                  className='border-border/60 hover:bg-muted/25 cursor-pointer border-b last:border-b-0'
                  onDoubleClick={() => void openItem(file)}
                >
                  <TableCell className='px-4 py-3.5'>
                    <div className='flex min-w-0 items-center gap-3'>
                      <span className='flex size-8 shrink-0 items-center justify-center'>
                        {file.thumbnailUrl ? (
                          <img
                            src={file.thumbnailUrl}
                            alt=''
                            className='size-8 rounded-md object-cover'
                          />
                        ) : (
                          <FileIcon
                            type={
                              file.isDir ? 'folder' : file.suffix || 'default'
                            }
                            size={22}
                          />
                        )}
                      </span>
                      <span
                        className='min-w-0 truncate font-medium'
                        title={file.displayName}
                      >
                        {file.displayName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className='text-muted-foreground px-4 py-3.5 tabular-nums'>
                    {formatDate(file.updateTime, 'YYYY/MM/DD')}
                  </TableCell>
                  <TableCell className='text-muted-foreground px-4 py-3.5 text-right tabular-nums'>
                    {file.isDir ? '—' : formatFileSize(file.size)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className='hover:bg-transparent'>
                <TableCell
                  colSpan={3}
                  className='text-muted-foreground h-28 text-center'
                >
                  暂无最近文件
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

function TableSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-7 w-24' />
        <Skeleton className='h-5 w-16' />
      </div>
      <div className='overflow-hidden rounded-xl border border-border/60'>
        <div className='space-y-0'>
          <Skeleton className='h-11 w-full rounded-none' />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className='h-14 w-full rounded-none' />
          ))}
        </div>
      </div>
    </div>
  )
}

export function RecentFilesTable({ unit }: { unit: HomeUsedBytesUnit }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['homeInfo', 'summary', unit],
    queryFn: () => getHomeInfo({ unit }),
    staleTime: 0,
    refetchInterval: HOME_INFO_REFETCH_INTERVAL_MS,
  })

  const files = data?.recentFiles ?? []

  return (
    <div className='px-4 lg:px-6'>
      <Card className='border-border/60 bg-transparent px-4 py-6 shadow-none lg:px-6'>
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <div className='text-muted-foreground py-8 text-center text-sm'>
            加载失败
            <Button
              variant='outline'
              size='sm'
              className='mt-3'
              onClick={() => void refetch()}
            >
              重试
            </Button>
          </div>
        ) : (
          <RecentFilesTableInner files={files} />
        )}
      </Card>
    </div>
  )
}
