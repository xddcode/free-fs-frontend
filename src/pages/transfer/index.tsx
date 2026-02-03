import { useState, useEffect } from 'react';
import { RefreshCw, Upload, Trash2 } from 'lucide-react';
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
    clearCompletedTasks,
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

  // 监听tab切换，刷新数据
  useEffect(() => {
    if (sseConnected && activeTab === 'completed') {
      const refreshData = async () => {
        setLoading(true);
        try {
          await fetchTasks();
        } catch (error) {
          console.error('刷新数据失败:', error);
        } finally {
          setLoading(false);
        }
      };
      refreshData();
    }
  }, [activeTab, sseConnected, fetchTasks]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await fetchTasks();
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (taskId: string) => {
    try {
      await pauseTask(taskId);
      toast.success('已暂停');
    } finally {
      // 无需处理
    }
  };

  const handleResume = async (taskId: string) => {
    try {
      await resumeTask(taskId);
      toast.success('已恢复');
    } finally {
      // 无需处理
    }
  };

  const handleCancel = async (taskId: string) => {
    try {
      await cancelTask(taskId);
      toast.success('已取消');
    } finally {
      // 无需处理
    }
  };

  const handleRetry = async (taskId: string) => {
    try {
      await retryTask(taskId);
      toast.success('已重试');
    } finally {
      // 无需处理
    }
  };

  const handleClearCompleted = async () => {
    if (completedTasks.length === 0) {
      toast.warning('没有可清空的任务');
      return;
    }

    try {
      await clearCompletedTasks();
      toast.success('已清空所有已完成任务');
    } finally {
      // 无需处理
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* 顶部工具栏 */}
      <div className="flex items-center gap-4 border-b px-6 py-4">
        <SidebarTrigger className="md:hidden" />
        
        <div className="flex-1">
          <h2 className="text-base font-normal">传输列表</h2>
        </div>

        <Button variant="outline" size="icon" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
        
        {activeTab === 'completed' && completedTasks.length > 0 && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleClearCompleted}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            全部清空
          </Button>
        )}
      </div>

      {/* 标签页和操作按钮 */}
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

        {currentDisplayTasks.length > 0 && (
          <span className="text-sm text-muted-foreground">
            共 {currentDisplayTasks.length} 项
          </span>
        )}
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
                  <Upload className="h-12 w-12" />
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
