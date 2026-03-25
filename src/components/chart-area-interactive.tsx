import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  getHomeInfo,
  HOME_INFO_REFETCH_INTERVAL_MS,
  type HomeUsedBytesDateType,
  type HomeUsedBytesUnit,
} from '@/api/home'
import { formatHomeStorageNumber } from '@/utils/format'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'
import { Skeleton } from '@/components/ui/skeleton'

const UNIT_LABELS: Record<HomeUsedBytesUnit, string> = {
  1: 'KB',
  2: 'MB',
  3: 'GB',
}

const Y_AXIS_WIDTH: Record<HomeUsedBytesUnit, number> = {
  1: 64,
  2: 56,
  3: 52,
}

function timeRangeToDateType(range: string): HomeUsedBytesDateType {
  if (range === '30d') return 1
  if (range === '7d') return 2
  return 0
}

type ChartAreaInteractiveProps = {
  className?: string
  /** 由首页提升状态，与存储概览等单位联动 */
  unit: HomeUsedBytesUnit
  onUnitChange: (unit: HomeUsedBytesUnit) => void
}

export function ChartAreaInteractive({
  className,
  unit,
  onUnitChange,
}: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState('90d')

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange('7d')
    }
  }, [isMobile])

  const { data: home, isLoading, isError } = useQuery({
    queryKey: ['homeInfo', 'chart', timeRange, unit],
    queryFn: () =>
      getHomeInfo({
        unit,
        dateType: timeRangeToDateType(timeRange),
      }),
    /** 切换单位/时间范围后需重新请求，避免命中旧缓存不发起网络请求 */
    staleTime: 0,
    refetchInterval: HOME_INFO_REFETCH_INTERVAL_MS,
  })

  const unitLabel = home?.unit ?? UNIT_LABELS[unit]

  const chartConfig = React.useMemo(
    () =>
      ({
        used: {
          label: `已用存储 (${unitLabel})`,
          color: 'var(--chart-1)',
        },
      }) satisfies ChartConfig,
    [unitLabel]
  )

  const chartData = React.useMemo(() => {
    const rawList = home?.usedBytes
    if (!rawList?.length) return []
    return rawList.map((row) => ({
      date: row.date,
      used: Number(row.usedBytes),
    }))
  }, [home?.usedBytes])

  const maxUsed = React.useMemo(
    () => chartData.reduce((m, d) => Math.max(m, d.used), 0),
    [chartData]
  )

  const areaStrokeWidth =
    unit >= 2 && maxUsed > 0 && maxUsed < 0.05 ? 2.5 : 1.5

  return (
    <Card
      className={cn(
        '@container/card flex h-full min-h-0 flex-col gap-3 py-4',
        className
      )}
    >
      <CardHeader className='shrink-0 space-y-1.5 pb-0'>
        <CardTitle>存储增长</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            已用存储随时间变化（{unitLabel}）
          </span>
          <span className='@[540px]/card:hidden'>存储趋势</span>
        </CardDescription>
        <CardAction className='flex flex-wrap items-center justify-end gap-2'>
          <ToggleGroup
            type='single'
            value={timeRange}
            onValueChange={(v) => v && setTimeRange(v)}
            variant='outline'
            className='hidden @[767px]/card:flex [&>button]:px-4'
          >
            <ToggleGroupItem value='90d'>近 3 个月</ToggleGroupItem>
            <ToggleGroupItem value='30d'>近 30 天</ToggleGroupItem>
            <ToggleGroupItem value='7d'>近 7 天</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={String(unit)}
            onValueChange={(v) =>
              onUnitChange(Number(v) as HomeUsedBytesUnit)
            }
          >
            <SelectTrigger
              className='h-8 w-22 shrink-0'
              size='sm'
              aria-label='数据单位'
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='rounded-xl'>
              <SelectItem value='1' className='rounded-lg'>
                KB
              </SelectItem>
              <SelectItem value='2' className='rounded-lg'>
                MB
              </SelectItem>
              <SelectItem value='3' className='rounded-lg'>
                GB
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className='flex w-40 @[767px]/card:hidden'
              size='sm'
              aria-label='选择时间范围'
            >
              <SelectValue placeholder='近 3 个月' />
            </SelectTrigger>
            <SelectContent className='rounded-xl'>
              <SelectItem value='90d' className='rounded-lg'>
                近 3 个月
              </SelectItem>
              <SelectItem value='30d' className='rounded-lg'>
                近 30 天
              </SelectItem>
              <SelectItem value='7d' className='rounded-lg'>
                近 7 天
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className='flex min-h-0 flex-1 flex-col px-2 pb-3 pt-0 sm:px-6 sm:pb-4'>
        {isLoading ? (
          <Skeleton className='min-h-[220px] w-full flex-1 rounded-lg sm:min-h-[260px]' />
        ) : isError ? (
          <div className='flex min-h-[220px] flex-1 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground sm:min-h-[260px]'>
            加载失败，请稍后重试
          </div>
        ) : chartData.length === 0 ? (
          <div className='flex min-h-[220px] flex-1 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground sm:min-h-[260px]'>
            暂无数据
          </div>
        ) : (
        <ChartContainer
          config={chartConfig}
          className='min-h-0 w-full flex-1 aspect-auto text-xs [&_.recharts-responsive-container]:h-full'
        >
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, bottom: 0, left: 12 }}
          >
            <defs>
              <linearGradient id='fillUsed' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-used)'
                  stopOpacity={0.9}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-used)'
                  stopOpacity={0.08}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray='3 6' className='stroke-border/60' />
            <YAxis
              domain={[
                0,
                (max: number) => (Number.isFinite(max) && max > 0 ? max * 1.12 : 1),
              ]}
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              width={Y_AXIS_WIDTH[unit]}
              tickFormatter={(v) =>
                typeof v === 'number'
                  ? formatHomeStorageNumber(v, unit)
                  : String(v)
              }
            />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={28}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('zh-CN', {
                  month: 'short',
                  day: 'numeric',
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const d = new Date(value as string)
                    if (Number.isNaN(d.getTime())) return String(value)
                    return d.toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }}
                  formatter={(value, name) => (
                    <div className='flex w-full items-center justify-between gap-2'>
                      <span className='text-muted-foreground'>{name}</span>
                      <span className='font-mono font-medium tabular-nums text-foreground'>
                        {typeof value === 'number'
                          ? formatHomeStorageNumber(value, unit)
                          : String(value)}{' '}
                        {unitLabel}
                      </span>
                    </div>
                  )}
                  indicator='dot'
                />
              }
            />
            <Area
              name='已用存储'
              dataKey='used'
              type='linear'
              fill='url(#fillUsed)'
              stroke='var(--color-used)'
              strokeWidth={areaStrokeWidth}
            />
          </AreaChart>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
