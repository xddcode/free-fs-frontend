import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTransferStore } from '@/store/transfer'
import { RefreshCw, Upload, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TransferTable from './components/TransferTable'

export default function TransferPage() {
  const { t } = useTranslation('transfer')
  const { t: tc } = useTranslation('common')
  const [activeTab, setActiveTab] = useState('uploading')
  const [loading, setLoading] = useState(false)

  const {
    getUploadingTasks,
    getCompletedTasks,
    fetchTasks,
    pauseTask,
    resumeTask,
    cancelTask,
    retryTask,
    clearCompletedTasks,
    sseConnected,
  } = useTransferStore()

  const uploadingTasks = getUploadingTasks()
  const completedTasks = getCompletedTasks()

  const currentDisplayTasks =
    activeTab === 'uploading'
      ? uploadingTasks
      : activeTab === 'downloading'
        ? []
        : completedTasks

  useEffect(() => {
    const initTransfer = async () => {
      if (sseConnected) {
        setLoading(true)
        try {
          await fetchTasks()
        } catch (error) {
          console.error('获取传输列表失败:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    initTransfer()
  }, [sseConnected])

  // 监听tab切换，刷新数据
  useEffect(() => {
    if (sseConnected && activeTab === 'completed') {
      const refreshData = async () => {
        setLoading(true)
        try {
          await fetchTasks()
        } catch (error) {
          console.error('刷新数据失败:', error)
        } finally {
          setLoading(false)
        }
      }
      refreshData()
    }
  }, [activeTab, sseConnected, fetchTasks])

  const handleRefresh = async () => {
    setLoading(true)
    try {
      await fetchTasks()
    } finally {
      setLoading(false)
    }
  }

  const handlePause = async (taskId: string) => {
    try {
      await pauseTask(taskId)
      toast.success(t('page.toastPause'))
    } finally {
      // 无需处理
    }
  }

  const handleResume = async (taskId: string) => {
    try {
      await resumeTask(taskId)
      toast.success(t('page.toastResume'))
    } finally {
      // 无需处理
    }
  }

  const handleCancel = async (taskId: string) => {
    try {
      await cancelTask(taskId)
      toast.success(t('page.toastCancel'))
    } finally {
      // 无需处理
    }
  }

  const handleRetry = async (taskId: string) => {
    try {
      await retryTask(taskId)
      toast.success(t('page.toastRetry'))
    } finally {
      // 无需处理
    }
  }

  const handleClearCompleted = async () => {
    if (completedTasks.length === 0) {
      toast.warning(t('page.toastClearWarn'))
      return
    }

    try {
      await clearCompletedTasks()
      toast.success(t('page.toastClearOk'))
    } finally {
      // 无需处理
    }
  }

  return (
    <div className='flex h-full flex-col'>
      {/* 顶部工具栏 */}
      <div className='flex items-center gap-4 border-b px-6 py-4'>
        <SidebarTrigger className='md:hidden' />

        <div className='flex-1'>
          <h2 className='text-xl font-semibold tracking-tight'>
            {t('page.title')}
          </h2>
        </div>

        <Button variant='outline' size='icon' onClick={handleRefresh}>
          <RefreshCw className='h-4 w-4' />
        </Button>

        {activeTab === 'completed' && completedTasks.length > 0 && (
          <Button
            variant='destructive'
            size='sm'
            onClick={handleClearCompleted}
          >
            <Trash2 className='mr-2 h-4 w-4' />
            {t('page.clearAll')}
          </Button>
        )}
      </div>

      {/* 标签页和操作按钮 */}
      <div className='flex items-center justify-between border-b px-6 py-3'>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value='uploading'>
              {t('page.tabUploading')}{' '}
              {uploadingTasks.length > 0 && `(${uploadingTasks.length})`}
            </TabsTrigger>
            <TabsTrigger value='downloading'>
              {t('page.tabDownloading')} (0)
            </TabsTrigger>
            <TabsTrigger value='completed'>
              {t('page.tabCompleted')}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {currentDisplayTasks.length > 0 && (
          <span className='text-sm text-muted-foreground'>
            {tc('listTotalItems', { count: currentDisplayTasks.length })}
          </span>
        )}
      </div>

      {/* 主内容区域 */}
      <div className='flex-1 overflow-auto p-6'>
        {loading ? (
          <div className='flex h-full items-center justify-center'>
            <p className='text-muted-foreground'>{tc('loading')}</p>
          </div>
        ) : currentDisplayTasks.length === 0 ? (
          <div className='flex h-full items-center justify-center'>
            <Empty className='border-none'>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <Upload className='h-12 w-12' />
                </EmptyMedia>
                <EmptyTitle>
                  {activeTab === 'uploading'
                    ? t('page.emptyUploadingTitle')
                    : activeTab === 'downloading'
                      ? t('page.emptyDownloadingTitle')
                      : t('page.emptyCompletedTitle')}
                </EmptyTitle>
                <EmptyDescription>
                  {activeTab === 'uploading'
                    ? t('page.emptyUploadingDesc')
                    : activeTab === 'downloading'
                      ? t('page.emptyDownloadingDesc')
                      : t('page.emptyCompletedDesc')}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <TransferTable
            tasks={currentDisplayTasks}
            loading={loading}
            showActions={activeTab === 'uploading'}
            showCompleteTime={activeTab === 'completed'}
            onPause={handlePause}
            onResume={handleResume}
            onCancel={handleCancel}
            onRetry={handleRetry}
          />
        )}
      </div>
    </div>
  )
}
