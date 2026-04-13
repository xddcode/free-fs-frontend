import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useTransferStore } from '@/store/transfer'
import type { TransferTask, TaskStatus } from '@/types/transfer'
import { Play, Pause, X, RotateCw } from 'lucide-react'
import { formatDate, formatFileSize } from '@/utils/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface TransferTableProps {
  tasks: TransferTask[]
  loading: boolean
  showActions?: boolean
  showCompleteTime?: boolean
  onPause: (taskId: string) => void
  onResume: (taskId: string) => void
  onCancel: (taskId: string) => void
  onRetry: (taskId: string) => void
}

const formatSpeed = (bytesPerSecond: number): string => {
  if (bytesPerSecond === 0) return '0 B/s'
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s']
  const k = 1024
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k))
  return `${(bytesPerSecond / Math.pow(k, i)).toFixed(2)} ${units[i]}`
}

function formatRemainingTime(
  seconds: number,
  tr: (key: string, opt?: Record<string, unknown>) => string
): string {
  if (seconds === 0 || !isFinite(seconds)) return '--'
  if (seconds < 60) return tr('time.sec', { n: Math.round(seconds) })
  if (seconds < 3600)
    return tr('time.min', { n: Math.round(seconds / 60) })
  return tr('time.hour', { n: Math.round(seconds / 3600) })
}

const getStatusColor = (
  status: TaskStatus
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const colorMap: Record<
    TaskStatus,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    idle: 'secondary',
    initialized: 'secondary',
    checking: 'default',
    uploading: 'default',
    paused: 'outline',
    merging: 'secondary',
    completed: 'default',
    failed: 'destructive',
    cancelled: 'secondary',
  }
  return colorMap[status] || 'secondary'
}

export default function TransferTable({
  tasks,
  loading,
  showActions = false,
  showCompleteTime = false,
  onPause,
  onResume,
  onCancel,
  onRetry,
}: TransferTableProps) {
  const { t } = useTranslation('transfer')
  const { getDisplayData } = useTransferStore()

  const statusMap = React.useMemo(
    () =>
      ({
        idle: t('status.idle'),
        initialized: t('status.initialized'),
        checking: t('status.checking'),
        uploading: t('status.uploading'),
        paused: t('status.paused'),
        merging: t('status.merging'),
        completed: t('status.completed'),
        failed: t('status.failed'),
        cancelled: t('status.cancelled'),
      }) satisfies Record<TaskStatus, string>,
    [t]
  )

  const statusText = (status: TaskStatus) =>
    statusMap[status] ?? t('status.unknown')

  const canPause = (status: TaskStatus) => status === 'uploading'
  const canResume = (status: TaskStatus) => status === 'paused'
  const canRetry = (status: TaskStatus) => status === 'failed'
  const canCancel = (status: TaskStatus) =>
    ['initialized', 'checking', 'uploading', 'paused', 'failed'].includes(
      status
    )

  return (
    <div className='overflow-hidden rounded-xl border border-border/60'>
      <Table>
        <TableHeader className='bg-muted/30 [&_tr]:border-border/60'>
          <TableRow className='border-border/60 hover:bg-transparent'>
            <TableHead className='text-muted-foreground h-11 px-4 font-medium'>
              {t('table.colFileName')}
            </TableHead>
            <TableHead className='text-muted-foreground h-11 px-4 font-medium'>
              {t('table.colSize')}
            </TableHead>
            <TableHead className='text-muted-foreground h-11 px-4 font-medium'>
              {t('table.colStatus')}
            </TableHead>
            <TableHead className='text-muted-foreground h-11 min-w-[200px] px-4 font-medium'>
              {t('table.colProgress')}
            </TableHead>
            {showActions && (
              <TableHead className='text-muted-foreground h-11 px-4 text-center font-medium'>
                {t('table.colActions')}
              </TableHead>
            )}
            {showCompleteTime && (
              <TableHead className='text-muted-foreground h-11 px-4 text-right font-medium'>
                {t('table.colCompletedAt')}
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const displayData = getDisplayData(task.taskId)

            return (
              <TableRow
                key={task.taskId}
                className='border-border/60 hover:bg-muted/25 border-b last:border-b-0'
              >
                <TableCell className='px-4 py-3.5'>
                  <span
                    className='block min-w-0 truncate font-medium'
                    title={task.fileName}
                  >
                    {task.fileName}
                  </span>
                </TableCell>

                <TableCell className='px-4 py-3.5 tabular-nums'>
                  {task.status === 'uploading' || task.status === 'paused' ? (
                    <span className='text-sm'>
                      <span className='font-medium'>
                        {formatFileSize(task.uploadedBytes || 0)}
                      </span>
                      <span className='text-muted-foreground'> / </span>
                      <span className='text-muted-foreground'>
                        {formatFileSize(task.fileSize)}
                      </span>
                    </span>
                  ) : (
                    <span className='text-muted-foreground'>
                      {formatFileSize(task.fileSize)}
                    </span>
                  )}
                </TableCell>

                <TableCell className='px-4 py-3.5'>
                  <Badge
                    variant={getStatusColor(task.status)}
                    className='rounded-full px-2.5'
                  >
                    {statusText(task.status)}
                  </Badge>
                </TableCell>

                <TableCell className='px-4 py-3.5'>
                  {/* Idle/Initialized */}
                  {(task.status === 'idle' ||
                    task.status === 'initialized') && (
                    <div className='flex items-center gap-2'>
                      <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                      <span className='text-sm text-muted-foreground'>
                        {t('table.prep')}
                      </span>
                    </div>
                  )}

                  {/* Checking */}
                  {task.status === 'checking' && (
                    <div className='flex items-center gap-2'>
                      <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                      <span className='text-sm text-muted-foreground'>
                        {t('table.checking')}
                      </span>
                    </div>
                  )}

                  {/* Uploading */}
                  {task.status === 'uploading' && (
                    <div className='flex items-center gap-3'>
                      <Progress
                        value={displayData.progress}
                        className='w-[200px]'
                      />
                      <div className='flex min-w-[100px] flex-col gap-0.5'>
                        <span className='text-sm font-medium'>
                          {formatSpeed(displayData.speed || 0)}
                        </span>
                        {displayData.remainingTime > 0 && (
                          <span className='text-xs text-muted-foreground'>
                            {t('table.remaining', {
                              time: formatRemainingTime(
                                displayData.remainingTime,
                                t
                              ),
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Paused */}
                  {task.status === 'paused' && (
                    <div className='flex items-center gap-3'>
                      <Progress
                        value={displayData.progress}
                        className='w-[200px]'
                      />
                      <span className='min-w-[100px] text-sm text-muted-foreground'>
                        {t('table.paused')}
                      </span>
                    </div>
                  )}

                  {/* Merging */}
                  {task.status === 'merging' && (
                    <div className='flex items-center gap-2'>
                      <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                      <span className='text-sm text-muted-foreground'>
                        {t('table.merging')}
                      </span>
                    </div>
                  )}

                  {/* Completed */}
                  {task.status === 'completed' && (
                    <span className='text-sm font-medium text-green-600'>
                      100%
                    </span>
                  )}

                  {/* Failed */}
                  {task.status === 'failed' && (
                    <span className='text-sm text-destructive'>
                      {task.errorMessage || t('table.uploadFailed')}
                    </span>
                  )}

                  {/* Cancelled */}
                  {task.status === 'cancelled' && (
                    <span className='text-sm text-muted-foreground'>
                      {t('table.cancelled')}
                    </span>
                  )}
                </TableCell>

                {showActions && (
                  <TableCell className='px-4 py-3.5'>
                    <div className='flex items-center justify-center gap-2'>
                      {canPause(task.status) && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => onPause(task.taskId)}
                        >
                          <Pause className='mr-1 h-4 w-4' />
                          {t('table.btnPause')}
                        </Button>
                      )}

                      {canResume(task.status) && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => onResume(task.taskId)}
                        >
                          <Play className='mr-1 h-4 w-4' />
                          {t('table.btnResume')}
                        </Button>
                      )}

                      {canRetry(task.status) && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => onRetry(task.taskId)}
                        >
                          <RotateCw className='mr-1 h-4 w-4' />
                          {t('table.btnRetry')}
                        </Button>
                      )}

                      {canCancel(task.status) && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => onCancel(task.taskId)}
                        >
                          <X className='mr-1 h-4 w-4' />
                          {t('table.btnCancel')}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}

                {showCompleteTime && (
                  <TableCell className='text-muted-foreground px-4 py-3.5 text-right tabular-nums'>
                    {task.updatedAt && task.status === 'completed'
                      ? formatDate(task.updatedAt, 'YYYY/M/D HH:mm:ss')
                      : '—'}
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
