import { useTransferStore } from '@/store/transfer'
import type { TransferTask, TaskStatus } from '@/types/transfer'
import { Play, Pause, X, RotateCw } from 'lucide-react'
import { formatFileSize } from '@/utils/format'
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

const formatRemainingTime = (seconds: number): string => {
  if (seconds === 0 || !isFinite(seconds)) return '--'
  if (seconds < 60) return `${Math.round(seconds)}秒`
  if (seconds < 3600) return `${Math.round(seconds / 60)}分钟`
  return `${Math.round(seconds / 3600)}小时`
}

const getStatusText = (status: TaskStatus): string => {
  const statusMap: Record<TaskStatus, string> = {
    idle: '空闲',
    initialized: '准备中',
    checking: '校验中',
    uploading: '上传中',
    paused: '已暂停',
    merging: '处理中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
  }
  return statusMap[status] || '未知'
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
  const { getDisplayData } = useTransferStore()

  const canPause = (status: TaskStatus) => status === 'uploading'
  const canResume = (status: TaskStatus) => status === 'paused'
  const canRetry = (status: TaskStatus) => status === 'failed'
  const canCancel = (status: TaskStatus) =>
    ['initialized', 'checking', 'uploading', 'paused', 'failed'].includes(
      status
    )

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[280px]'>文件名称</TableHead>
            <TableHead className='w-[140px]'>文件大小</TableHead>
            <TableHead className='w-[90px]'>状态</TableHead>
            <TableHead className='w-[400px]'>进度</TableHead>
            {showActions && (
              <TableHead className='w-[180px] text-center'>操作</TableHead>
            )}
            {showCompleteTime && (
              <TableHead className='w-[180px]'>完成时间</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const displayData = getDisplayData(task.taskId)

            return (
              <TableRow key={task.taskId}>
                <TableCell className='font-medium'>{task.fileName}</TableCell>

                <TableCell>
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
                    formatFileSize(task.fileSize)
                  )}
                </TableCell>

                <TableCell>
                  <Badge variant={getStatusColor(task.status)}>
                    {getStatusText(task.status)}
                  </Badge>
                </TableCell>

                <TableCell>
                  {/* Idle/Initialized */}
                  {(task.status === 'idle' ||
                    task.status === 'initialized') && (
                    <div className='flex items-center gap-2'>
                      <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                      <span className='text-sm text-muted-foreground'>
                        准备中...
                      </span>
                    </div>
                  )}

                  {/* Checking */}
                  {task.status === 'checking' && (
                    <div className='flex items-center gap-2'>
                      <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                      <span className='text-sm text-muted-foreground'>
                        校验文件...
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
                            剩余{' '}
                            {formatRemainingTime(displayData.remainingTime)}
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
                        已暂停
                      </span>
                    </div>
                  )}

                  {/* Merging */}
                  {task.status === 'merging' && (
                    <div className='flex items-center gap-2'>
                      <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                      <span className='text-sm text-muted-foreground'>
                        正在处理文件...
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
                      {task.errorMessage || '上传失败'}
                    </span>
                  )}

                  {/* Cancelled */}
                  {task.status === 'cancelled' && (
                    <span className='text-sm text-muted-foreground'>
                      已取消
                    </span>
                  )}
                </TableCell>

                {showActions && (
                  <TableCell>
                    <div className='flex items-center justify-center gap-2'>
                      {canPause(task.status) && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => onPause(task.taskId)}
                        >
                          <Pause className='mr-1 h-4 w-4' />
                          暂停
                        </Button>
                      )}

                      {canResume(task.status) && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => onResume(task.taskId)}
                        >
                          <Play className='mr-1 h-4 w-4' />
                          开始
                        </Button>
                      )}

                      {canRetry(task.status) && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => onRetry(task.taskId)}
                        >
                          <RotateCw className='mr-1 h-4 w-4' />
                          重试
                        </Button>
                      )}

                      {canCancel(task.status) && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => onCancel(task.taskId)}
                        >
                          <X className='mr-1 h-4 w-4' />
                          取消
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}

                {showCompleteTime && (
                  <TableCell>
                    {task.updatedAt && task.status === 'completed'
                      ? new Date(task.updatedAt).toLocaleString('zh-CN')
                      : '-'}
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
