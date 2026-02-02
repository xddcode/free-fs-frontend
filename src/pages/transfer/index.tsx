import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTransferStore } from '@/store/transfer';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import TransferTable from './components/TransferTable';
import { toast } from 'sonner';

export default function TransferPage() {
  const [activeTab, setActiveTab] = useState('uploading');
  const [loading, setLoading] = useState(false);

  const {
    getUploadingTasks,
    getCompletedTasks,
    fetchTasks,
    pauseTask,
    resumeTask,
    cancelTask,
    retryTask,
    sseConnected,
  } = useTransferStore();

  const uploadingTasks = getUploadingTasks();
  const completedTasks = getCompletedTasks();

  const currentDisplayTasks =
    activeTab === 'uploading'
      ? uploadingTasks
      : activeTab === 'downloading'
      ? []
      : completedTasks;

  useEffect(() => {
    const initTransfer = async () => {
      if (sseConnected) {
        setLoading(true);
        try {
          await fetchTasks();
        } catch (error) {
          console.error('获取传输列表失败:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    initTransfer();
  }, [sseConnected]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await fetchTasks();
    } catch (error) {
      toast.error('刷新失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (taskId: string) => {
    try {
      await pauseTask(taskId);
      toast.success('已暂停');
    } catch (error) {
      toast.error('暂停失败');
    }
  };

  const handleResume = async (taskId: string) => {
    try {
      await resumeTask(taskId);
      toast.success('已恢复');
    } catch (error) {
      toast.error('恢复失败');
    }
  };

  const handleCancel = async (taskId: string) => {
    try {
      await cancelTask(taskId);
      toast.success('已取消');
    } catch (error) {
      toast.error('取消失败');
    }
  };

  const handleRetry = async (taskId: string) => {
    try {
      await retryTask(taskId);
      toast.success('已重试');
    } catch (error) {
      toast.error('重试失败');
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* 顶部工具栏 */}
      <div className="flex items-center gap-4 border-b px-6 py-4">
        <SidebarTrigger className="md:hidden" />
        
        <div className="flex-1">
          <h1 className="text-lg font-semibold">传输列表</h1>
        </div>

        <Button variant="outline" size="icon" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* 次级工具栏：标签页 */}
      <div className="flex items-center justify-between border-b px-6 py-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="uploading">
              上传中 {uploadingTasks.length > 0 && `(${uploadingTasks.length})`}
            </TabsTrigger>
            <TabsTrigger value="downloading">下载中 (0)</TabsTrigger>
            <TabsTrigger value="completed">已完成</TabsTrigger>
          </TabsList>
        </Tabs>

        <span className="text-sm text-muted-foreground">
          {currentDisplayTasks.length > 0 && `共 ${currentDisplayTasks.length} 项`}
        </span>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : currentDisplayTasks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Empty className="border-none">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <div className="text-6xl">📦</div>
                </EmptyMedia>
                <EmptyTitle>
                  {activeTab === 'uploading'
                    ? '暂无上传任务'
                    : activeTab === 'downloading'
                    ? '暂无下载任务'
                    : '暂无已完成任务'}
                </EmptyTitle>
                <EmptyDescription>
                  {activeTab === 'uploading'
                    ? '上传文件后，任务会在这里显示'
                    : activeTab === 'downloading'
                    ? '下载功能即将推出'
                    : '已完成的任务会在这里显示'}
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
  );
}
