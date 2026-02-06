import { useState, useEffect } from 'react'
import { useTransferStore } from '@/store/transfer'
import { X, FileIcon, CheckCircle2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

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

interface UploadPanelProps {
  onSuccess?: () => void
}

export default function UploadPanel({ onSuccess }: UploadPanelProps) {
  const [showPanel, setShowPanel] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [prevCompletedCount, setPrevCompletedCount] = useState(0)

  const { getCurrentSessionTasks } = useTransferStore()
  const taskList = getCurrentSessionTasks()

  const isUploading = taskList.some((t) =>
    ['initialized', 'checking', 'uploading', 'merging'].includes(t.status)
  )

  const completedCount = taskList.filter((t) => t.status === 'completed').length
  const allCompleted =
    taskList.length > 0 &&
    taskList.every((t) =>
      ['completed', 'failed', 'cancelled'].includes(t.status)
    )

  const summaryText = isUploading
    ? `正在上传... (${completedCount}/${taskList.length})`
    : `上传完成 · 共 ${taskList.length} 项`

  // 显示面板：有任务时显示
  useEffect(() => {
    if (taskList.length > 0) {
      setShowPanel(true)
    }
  }, [taskList.length])

  // 自动关闭：所有任务完成后 3 秒自动关闭
  useEffect(() => {
    if (allCompleted && showPanel) {
      const timer = setTimeout(() => {
        setShowPanel(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [allCompleted, showPanel])

  // 成功回调
  useEffect(() => {
    // 当完成数量增加时，调用 onSuccess 回调
    if (
      completedCount > prevCompletedCount &&
      completedCount > 0 &&
      onSuccess
    ) {
      onSuccess()
    }
    setPrevCompletedCount(completedCount)
  }, [completedCount, prevCompletedCount, onSuccess])

  if (!showPanel) return null

  return (
    <div className='fixed right-10 bottom-6 z-50 rounded-lg border bg-card shadow-2xl'>
      {!isExpanded ? (
        <div
          className='flex cursor-pointer items-center gap-2 px-4 py-3 hover:bg-accent'
          onClick={() => setIsExpanded(true)}
        >
          {isUploading ? (
            <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
          ) : (
            <CheckCircle2 className='h-4 w-4 text-green-600' />
          )}
          <span className='text-sm font-medium'>{summaryText}</span>
          <X
            className='h-4 w-4 text-muted-foreground hover:text-foreground'
            onClick={(e) => {
              e.stopPropagation()
              setShowPanel(false)
            }}
          />
        </div>
      ) : (
        <div className='flex max-h-[400px] w-[360px] flex-col'>
          <div className='flex items-center justify-between border-b px-4 py-3'>
            <span className='text-sm font-medium'>{summaryText}</span>
            <X
              className='h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground'
              onClick={() => setShowPanel(false)}
            />
          </div>

          <div className='flex-1 overflow-y-auto p-2'>
            {taskList.length === 0 ? (
              <div className='py-8 text-center text-sm text-muted-foreground'>
                没有更多内容了
              </div>
            ) : (
              taskList.map((task) => (
                <div
                  key={task.taskId}
                  className='flex items-start gap-3 rounded p-2 hover:bg-accent'
                >
                  <FileIcon className='mt-1 h-6 w-6 flex-shrink-0' />
                  <div className='min-w-0 flex-1'>
                    <div className='truncate text-sm font-medium'>
                      {task.fileName}
                    </div>

                    {/* Idle/Initialized */}
                    {(task.status === 'idle' ||
                      task.status === 'initialized') && (
                      <div className='mt-1 flex items-center gap-2'>
                        <div className='h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                        <span className='text-xs text-muted-foreground'>
                          准备中...
                        </span>
                      </div>
                    )}

                    {/* Checking */}
                    {task.status === 'checking' && (
                      <div className='mt-1 flex items-center gap-2'>
                        <div className='h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                        <span className='text-xs text-muted-foreground'>
                          校验文件...
                        </span>
                      </div>
                    )}

                    {/* Uploading */}
                    {task.status === 'uploading' && (
                      <div className='mt-1 space-y-1'>
                        <Progress value={task.progress} className='h-1' />
                        <div className='flex items-center justify-between text-xs'>
                          <span className='font-medium'>
                            {formatSpeed(task.speed)}
                          </span>
                          {task.remainingTime > 0 && (
                            <span className='text-muted-foreground'>
                              剩余 {formatRemainingTime(task.remainingTime)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Paused */}
                    {task.status === 'paused' && (
                      <div className='mt-1 space-y-1'>
                        <Progress value={task.progress} className='h-1' />
                        <span className='text-xs text-muted-foreground'>
                          已暂停
                        </span>
                      </div>
                    )}

                    {/* Merging */}
                    {task.status === 'merging' && (
                      <div className='mt-1 flex items-center gap-2'>
                        <div className='h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                        <span className='text-xs text-muted-foreground'>
                          正在处理...
                        </span>
                      </div>
                    )}

                    {/* Completed */}
                    {task.status === 'completed' && (
                      <span className='mt-1 block text-xs text-green-600'>
                        已上传至 目标文件夹
                      </span>
                    )}

                    {/* Failed */}
                    {task.status === 'failed' && (
                      <span className='mt-1 block text-xs text-destructive'>
                        {task.errorMessage || '上传失败'}
                      </span>
                    )}

                    {/* Cancelled */}
                    {task.status === 'cancelled' && (
                      <span className='mt-1 block text-xs text-muted-foreground'>
                        已取消
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div
            className='cursor-pointer border-t px-4 py-3 text-center text-sm hover:bg-accent'
            onClick={() => setIsExpanded(false)}
          >
            收起
          </div>
        </div>
      )}
    </div>
  )
}
