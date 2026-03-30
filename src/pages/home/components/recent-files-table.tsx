import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import {
  getHomeInfo,
  HOME_INFO_REFETCH_INTERVAL_MS,
  type HomeUsedBytesUnit,
} from '@/api/home'
import type { FileItem } from '@/types/file'
import { formatFileListDisplayTime, formatFileSize } from '@/utils/format'
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
        import.meta.env.VITE_API_BASE_URL
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

      <div className='overflow-hidden rounded-xl bg-background'>
        <Table containerClassName='overflow-visible'>
          <TableHeader className='[&_tr]:border-0'>
            <TableRow className='border-0 hover:bg-transparent'>
              <TableHead className='text-muted-foreground h-[48px] px-4 text-left text-sm font-medium'>
                名称
              </TableHead>
              <TableHead className='text-muted-foreground h-[48px] min-w-[11rem] px-4 text-left text-sm font-medium'>
                修改时间
              </TableHead>
              <TableHead className='text-muted-foreground h-[48px] px-4 text-right text-sm font-medium'>
                大小
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.length > 0 ? (
              files.map((file) => (
                <TableRow
                  key={file.id}
                  className='group min-h-[48px] border-b-0 transition-colors duration-150 hover:bg-primary/[0.06] cursor-pointer'
                  onDoubleClick={() => void openItem(file)}
                >
                  <TableCell className='min-h-[48px] align-middle px-4 py-1.5'>
                    <div className='flex min-w-0 items-center gap-2'>
                      <span className='flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/40'>
                        {file.thumbnailUrl ? (
                          <img
                            src={file.thumbnailUrl}
                            alt=''
                            className='size-7 rounded object-cover'
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
                        className='min-w-0 line-clamp-2 break-words text-sm font-medium text-foreground/90 transition-colors group-hover:text-primary'
                        title={file.displayName}
                      >
                        {file.displayName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className='text-muted-foreground min-h-[48px] align-middle px-4 py-1.5 text-sm tabular-nums transition-colors group-hover:text-primary'>
                    {formatFileListDisplayTime(file.updateTime)}
                  </TableCell>
                  <TableCell className='text-muted-foreground min-h-[48px] align-middle px-4 py-1.5 text-right text-sm tabular-nums transition-colors group-hover:text-primary'>
                    {file.isDir ? '—' : formatFileSize(file.size)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className='border-b-0 hover:bg-transparent'>
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
      <div className='overflow-hidden rounded-xl'>
        <div className='space-y-0'>
          <Skeleton className='h-[48px] w-full rounded-none' />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className='h-[48px] w-full rounded-none' />
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
