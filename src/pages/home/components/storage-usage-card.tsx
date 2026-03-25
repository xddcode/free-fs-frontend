import { HardDrive } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  getHomeInfo,
  HOME_INFO_REFETCH_INTERVAL_MS,
  type HomeUsedBytesUnit,
} from '@/api/home'
import { formatHomeStorageDisplay } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/** 存储概览：仅展示服务端已用空间（无总额度时不造百分比）；unit 与图表联动 */
export function StorageOverviewCard({
  className,
  storageUnit,
}: {
  className?: string
  storageUnit: HomeUsedBytesUnit
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['homeInfo', 'summary', storageUnit],
    queryFn: () => getHomeInfo({ unit: storageUnit }),
    staleTime: 0,
    refetchInterval: HOME_INFO_REFETCH_INTERVAL_MS,
  })

  const usedStorage = data?.usedStorage
  const unitLabel = data?.unit ?? ''

  if (isLoading) {
    return (
      <Card
        className={cn(
          'relative flex min-h-[280px] flex-col overflow-hidden rounded-xl border-border/40 bg-linear-to-br from-card via-card to-card/50 p-5 shadow-sm backdrop-blur-sm sm:min-h-[320px] lg:min-h-0',
          className
        )}
      >
        <div className='absolute top-0 right-0 h-32 w-32 rounded-full bg-linear-to-br from-primary/10 to-transparent blur-3xl' />
        <div className='absolute bottom-0 left-0 h-24 w-24 rounded-full bg-linear-to-tr from-purple-500/10 to-transparent blur-3xl' />
        <div className='relative space-y-4'>
          <Skeleton className='h-5 w-28' />
          <div className='flex flex-col items-center gap-4 py-2'>
            <Skeleton className='size-20 rounded-full' />
            <Skeleton className='h-10 w-36' />
            <Skeleton className='h-4 w-16' />
          </div>
          <Skeleton className='h-9 w-full rounded-lg' />
        </div>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border-border/40 bg-linear-to-br from-card via-card to-card/50 p-5 shadow-sm backdrop-blur-sm lg:min-h-0',
        className
      )}
    >
      <div className='pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-linear-to-br from-primary/10 to-transparent blur-3xl' />
      <div className='pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-linear-to-tr from-purple-500/10 to-transparent blur-3xl' />

      <div className='relative flex min-h-0 flex-1 flex-col'>
        <h3 className='mb-4 text-base font-bold'>存储概览</h3>

        <div className='flex flex-1 flex-col items-center justify-center gap-3 py-2'>
          <div
            className='flex size-20 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-500/15 via-violet-500/10 to-blue-500/15 ring-1 ring-sidebar-primary/20'
            aria-hidden
          >
            <HardDrive
              className='size-9 text-sidebar-primary'
              strokeWidth={1.5}
            />
          </div>
          <div className='flex min-h-11 flex-col items-center justify-center gap-1 text-center'>
            <span
              className='max-w-full break-all bg-linear-to-br from-purple-500 via-blue-500 to-blue-600 bg-clip-text text-2xl font-bold leading-tight text-transparent tabular-nums sm:text-3xl'
              title={
                isError || usedStorage === undefined
                  ? undefined
                  : formatHomeStorageDisplay(
                      usedStorage,
                      unitLabel,
                      storageUnit
                    )
              }
            >
              {isError || usedStorage === undefined
                ? '—'
                : formatHomeStorageDisplay(
                    usedStorage,
                    unitLabel,
                    storageUnit
                  )}
            </span>
            <span className='text-xs font-medium text-muted-foreground'>
              已使用空间
            </span>
          </div>
        </div>

        <Button
          className='mt-4 h-9 w-full rounded-lg text-sm font-semibold shadow-sm transition-all hover:shadow-md'
          asChild
        >
          <Link to='/storage'>管理存储空间</Link>
        </Button>
      </div>
    </Card>
  )
}
