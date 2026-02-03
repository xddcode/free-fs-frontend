import { create } from 'zustand';
import { toast } from 'sonner';
import type {
  TransferTask,
  TaskStatus,
  ProgressUpdate,
  FileTransferTaskVO,
  SSEMessage,
} from '@/types/transfer';
import { stateMachine } from '@/utils/transfer-state-machine';
import { progressCalculator } from '@/utils/progress-calculator';
import {
  getTransferFiles,
  pauseUpload,
  resumeUpload,
  cancelUpload,
  initUpload,
  clearCompletedTasks as clearCompletedTasksApi,
} from '@/api/transfer';
import { sseService } from '@/services/sse.service';
import { uploadExecutor } from '@/services/upload-executor';

interface TransferStore {
  tasks: Map<string, TransferTask>;
  sseConnected: boolean;
  currentSessionId: string | null;
  sessionTasks: Map<string, string[]>;
  fileCache: Map<string, File>;
  completedActionsTriggered: Set<string>;
  errorNotificationTriggered: Set<string>;
  
  // Getters
  getTaskList: () => TransferTask[];
  getUploadingTasks: () => TransferTask[];
  getCompletedTasks: () => TransferTask[];
  getCurrentSessionTasks: () => TransferTask[];
  
  // Actions
  setSseConnected: (connected: boolean) => void;
  transitionTo: (taskId: string, newStatus: TaskStatus) => boolean;
  updateProgress: (taskId: string, data: ProgressUpdate) => void;
  setTaskError: (taskId: string, errorMessage: string) => void;
  handleSSEMessage: (message: SSEMessage) => void;
  fetchTasks: () => Promise<void>;
  syncTasks: () => Promise<void>;
  startUploadSession: () => string;
  createTask: (file: File, parentId?: string, sessionId?: string) => Promise<string>;
  pauseTask: (taskId: string) => Promise<void>;
  resumeTask: (taskId: string) => Promise<void>;
  cancelTask: (taskId: string) => Promise<void>;
  retryTask: (taskId: string) => Promise<void>;
  clearCompletedTasks: () => Promise<void>;
  initSSE: (userId: string) => Promise<void>;
  disconnectSSE: () => void;
  getDisplayData: (taskId: string) => { progress: number; speed: number; remainingTime: number };
  
  // Internal methods
  triggerCompletedActions: (task: TransferTask) => void;
  checkUnfinishedTasks: () => Promise<void>;
  checkAndStartPolling: () => void;
  startPolling: () => void;
  stopPolling: () => void;
  setupBeforeUnloadWarning: () => void;
}

let sseMessageUnsubscribe: (() => void) | null = null;
let sseConnectionUnsubscribe: (() => void) | null = null;
let callbacksInitialized = false;
let hasCheckedUnfinishedTasks = false;
let pollingTimerId: number | null = null;
let beforeUnloadWarningSetup = false;
const POLLING_INTERVAL = 3000;

function convertVOToTask(vo: FileTransferTaskVO): TransferTask {
  const now = Date.now();
  const progress = vo.progress ?? 0;
  const formattedProgress = Math.round(progress);

  return {
    taskId: vo.taskId,
    fileName: vo.fileName,
    fileSize: vo.fileSize,
    status: vo.status as TaskStatus,
    progress: formattedProgress,
    uploadedBytes: vo.uploadedSize ?? 0,
    speed: vo.speed ?? 0,
    remainingTime: vo.remainTime ?? 0,
    errorMessage: vo.errorMsg,
    createdAt: vo.startTime ? new Date(vo.startTime).getTime() : now,
    updatedAt: now,
    parentId: vo.parentId,
    totalChunks: vo.totalChunks,
    uploadedChunks: vo.uploadedChunks,
    chunkSize: vo.chunkSize,
  };
}

export const useTransferStore = create<TransferStore>((set, get) => ({
  tasks: new Map(),
  sseConnected: false,
  currentSessionId: null,
  sessionTasks: new Map(),
  fileCache: new Map(),
  completedActionsTriggered: new Set(),
  errorNotificationTriggered: new Set(),

  getTaskList: () => Array.from(get().tasks.values()),
  
  getUploadingTasks: () =>
    get().getTaskList().filter((task) =>
      ['idle', 'initialized', 'checking', 'uploading', 'paused', 'merging'].includes(task.status)
    ),
  
  getCompletedTasks: () =>
    get().getTaskList().filter((task) =>
      ['completed', 'failed', 'cancelled'].includes(task.status)
    ),
  
  getCurrentSessionTasks: () => {
    const { currentSessionId, sessionTasks, tasks } = get();
    if (!currentSessionId) return [];
    const taskIds = sessionTasks.get(currentSessionId) || [];
    return taskIds
      .map((id) => tasks.get(id))
      .filter((task): task is TransferTask => task !== undefined);
  },

  setSseConnected: (connected) => set({ sseConnected: connected }),

  transitionTo: (taskId, newStatus) => {
    const { tasks, completedActionsTriggered } = get();
    const task = tasks.get(taskId);
    if (!task) return false;

    if (task.status === newStatus) {
      if (newStatus === 'completed' && !completedActionsTriggered.has(taskId)) {
        get().triggerCompletedActions(task);
      }
      return true;
    }

    const updatedTask = stateMachine.transition(task, newStatus);
    if (updatedTask) {
      const newTasks = new Map(tasks);
      newTasks.set(taskId, updatedTask);
      set({ tasks: newTasks });

      if (newStatus === 'completed' && !completedActionsTriggered.has(taskId)) {
        get().triggerCompletedActions(updatedTask);
      }

      get().checkAndStartPolling();
      return true;
    }

    return false;
  },

  triggerCompletedActions: (task: TransferTask) => {
    const { completedActionsTriggered, fileCache } = get();
    completedActionsTriggered.add(task.taskId);

    toast.success(`文件 "${task.fileName}" 上传完成`);

    window.dispatchEvent(
      new CustomEvent('file-upload-complete', {
        detail: { parentId: task.parentId },
      })
    );

    progressCalculator.clear(task.taskId);
    fileCache.delete(task.taskId);

    if (uploadExecutor.getTaskContext(task.taskId)) {
      uploadExecutor.cancel(task.taskId);
    }
  },

  setTaskError: (taskId, errorMessage) => {
    const { tasks, errorNotificationTriggered } = get();
    const task = tasks.get(taskId);
    if (task) {
      get().transitionTo(taskId, 'failed');
      const updatedTask = tasks.get(taskId);
      if (updatedTask) {
        const newTasks = new Map(tasks);
        newTasks.set(taskId, { ...updatedTask, errorMessage });
        set({ tasks: newTasks });
      }

      if (!errorNotificationTriggered.has(taskId)) {
        errorNotificationTriggered.add(taskId);
        toast.error(`文件 "${task.fileName}" 上传失败: ${errorMessage}`);
      }
    }
  },

  updateProgress: (taskId, data) => {
    const { tasks } = get();
    const task = tasks.get(taskId);
    if (!task) return;

    const shouldUpdate = progressCalculator.update(
      taskId,
      data.uploadedBytes,
      data.totalBytes
    );

    if (shouldUpdate) {
      const displayData = progressCalculator.getDisplayData(taskId);

      const updatedTask: TransferTask = {
        ...task,
        uploadedBytes: data.uploadedBytes,
        progress: displayData.progress,
        speed: displayData.speed,
        remainingTime: displayData.remainingTime,
        updatedAt: Date.now(),
      };

      if (data.uploadedChunks !== undefined) {
        updatedTask.uploadedChunks = data.uploadedChunks;
      }
      if (data.totalChunks !== undefined) {
        updatedTask.totalChunks = data.totalChunks;
      }

      const newTasks = new Map(tasks);
      newTasks.set(taskId, updatedTask);
      set({ tasks: newTasks });
    }
  },

  handleSSEMessage: (message) => {
    const { type, taskId, data } = message;

    switch (type) {
      case 'progress': {
        const progressData = data as any;
        get().updateProgress(taskId, {
          uploadedBytes: progressData.uploadedBytes,
          totalBytes: progressData.totalBytes,
          uploadedChunks: progressData.uploadedChunks,
          totalChunks: progressData.totalChunks,
        });
        break;
      }

      case 'status': {
        const statusData = data as any;
        if (statusData.status) {
          get().transitionTo(taskId, statusData.status);
        }
        break;
      }

      case 'complete': {
        get().transitionTo(taskId, 'completed');
        break;
      }

      case 'error': {
        const errorData = data as any;
        get().setTaskError(taskId, errorData.message || '上传失败');
        break;
      }

      default:
        break;
    }
  },

  fetchTasks: async () => {
    try {
      const taskVOs = await getTransferFiles();

      const newTasks = new Map<string, TransferTask>();
      progressCalculator.clearAll();

      // 确保 taskVOs 是数组
      const tasks = Array.isArray(taskVOs) ? taskVOs : [];
      
      tasks.forEach((vo) => {
        const task = convertVOToTask(vo);
        newTasks.set(task.taskId, task);
      });

      set({ tasks: newTasks });

      await get().checkUnfinishedTasks();
    } catch (error) {
      console.error('获取传输任务列表失败:', error);
      // 静默失败，不抛出错误
    }
  },

  checkUnfinishedTasks: async () => {
    if (hasCheckedUnfinishedTasks) return;
    hasCheckedUnfinishedTasks = true;

    const { tasks } = get();
    const unfinishedTasks = Array.from(tasks.values()).filter(
      (task) => 
        task.status === 'idle' ||
        task.status === 'initialized' ||
        task.status === 'uploading' || 
        task.status === 'checking' ||
        task.status === 'paused' ||
        task.status === 'merging'
    );

    if (unfinishedTasks.length === 0) return;

    const results = await Promise.allSettled(
      unfinishedTasks.map(async (task) => {
        try {
          await cancelUpload(task.taskId);
          get().transitionTo(task.taskId, 'cancelled');
          return { success: true, taskId: task.taskId };
        } catch (error: any) {
          // 如果任务不存在，也算成功（因为目标已达成）
          if (error?.message?.includes('任务不存在') || error?.response?.data?.message?.includes('任务不存在')) {
            get().transitionTo(task.taskId, 'cancelled');
            return { success: true, taskId: task.taskId };
          }
          console.error('取消任务失败:', task.taskId, error);
          return { success: false, taskId: task.taskId, error };
        }
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failCount = results.length - successCount;

    if (successCount > 0) {
      toast.info(`已自动取消 ${successCount} 个未完成的上传任务`, {
        description: failCount > 0 ? `${failCount} 个任务取消失败` : '页面刷新会中断上传，建议等待上传完成后再刷新',
      });
    }
  },

  syncTasks: async () => {
    try {
      const taskVOs = await getTransferFiles();
      const { tasks } = get();

      const newTasks = new Map(tasks);

      // 确保 taskVOs 是数组
      const taskList = Array.isArray(taskVOs) ? taskVOs : [];

      taskList.forEach((vo) => {
        const existingTask = newTasks.get(vo.taskId);
        const newTask = convertVOToTask(vo);

        if (!existingTask) {
          newTasks.set(vo.taskId, newTask);
        } else {
          const statePriority: Record<TaskStatus, number> = {
            idle: 0,
            initialized: 1,
            checking: 2,
            paused: 3,
            uploading: 4,
            merging: 5,
            cancelled: 6,
            failed: 7,
            completed: 8,
          };

          const existingPriority = statePriority[existingTask.status] || 0;
          const newPriority = statePriority[newTask.status] || 0;

          if (
            newPriority > existingPriority ||
            newTask.status === 'completed' ||
            newTask.status === 'failed' ||
            newTask.status === 'cancelled'
          ) {
            newTasks.set(vo.taskId, newTask);
          } else {
            newTasks.set(vo.taskId, {
              ...existingTask,
              uploadedBytes: newTask.uploadedBytes,
              uploadedChunks: newTask.uploadedChunks,
              totalChunks: newTask.totalChunks,
            });
          }
        }
      });

      const backendTaskIds = new Set(taskList.map((vo) => vo.taskId));
      newTasks.forEach((_, taskId) => {
        if (!backendTaskIds.has(taskId)) {
          newTasks.delete(taskId);
          progressCalculator.clear(taskId);
        }
      });

      set({ tasks: newTasks });
    } catch (error) {
      console.error('同步传输任务失败:', error);
      // 静默失败，不抛出错误
    }
  },

  startUploadSession: () => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const { sessionTasks } = get();
    const newSessionTasks = new Map(sessionTasks);
    newSessionTasks.set(sessionId, []);
    set({ currentSessionId: sessionId, sessionTasks: newSessionTasks });
    return sessionId;
  },

  createTask: async (file, parentId, sessionId) => {
    if (!callbacksInitialized) {
      callbacksInitialized = true;
      uploadExecutor.setCallbacks({
        onTransition: (taskId, status) => {
          get().transitionTo(taskId, status as TaskStatus);
        },
        onProgress: (taskId, data) => {
          get().updateProgress(taskId, data);
        },
        onError: (taskId, errorMessage) => {
          get().setTaskError(taskId, errorMessage);
        },
      });
    }

    const chunkSize = 5 * 1024 * 1024;
    const totalChunks = Math.ceil(file.size / chunkSize);

    const taskId = await initUpload({
      fileName: file.name,
      fileSize: file.size,
      parentId,
      totalChunks,
      chunkSize,
      mimeType: file.type || 'application/octet-stream',
    });

    const now = Date.now();

    const task: TransferTask = {
      taskId,
      fileName: file.name,
      fileSize: file.size,
      status: 'idle',
      progress: 0,
      uploadedBytes: 0,
      speed: 0,
      remainingTime: 0,
      createdAt: now,
      updatedAt: now,
      parentId,
      mimeType: file.type || 'application/octet-stream',
      totalChunks,
      uploadedChunks: 0,
      chunkSize,
    };

    const { tasks, fileCache, sessionTasks, currentSessionId } = get();
    const newTasks = new Map(tasks);
    newTasks.set(taskId, task);

    const newFileCache = new Map(fileCache);
    newFileCache.set(taskId, file);

    const targetSessionId = sessionId || currentSessionId;
    const newSessionTasks = new Map(sessionTasks);
    if (targetSessionId) {
      const sessionTaskList = newSessionTasks.get(targetSessionId) || [];
      sessionTaskList.push(taskId);
      newSessionTasks.set(targetSessionId, sessionTaskList);
    }

    set({ tasks: newTasks, fileCache: newFileCache, sessionTasks: newSessionTasks });

    get().transitionTo(taskId, 'initialized');

    const currentConcurrency = 3;
    uploadExecutor.start(taskId, file, currentConcurrency, chunkSize).catch(() => {
      // Silent
    });

    return taskId;
  },

  pauseTask: async (taskId) => {
    const { tasks } = get();
    const task = tasks.get(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);

    uploadExecutor.pause(taskId);

    if (!get().transitionTo(taskId, 'paused')) {
      throw new Error(`Cannot pause task in status: ${task.status}`);
    }

    try {
      await pauseUpload(taskId);
    } catch (error) {
      get().transitionTo(taskId, task.status);
      throw error;
    }
  },

  resumeTask: async (taskId) => {
    const { tasks } = get();
    const task = tasks.get(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);

    if (!get().transitionTo(taskId, 'uploading')) {
      throw new Error(`Cannot resume task in status: ${task.status}`);
    }

    try {
      await resumeUpload(taskId);
      uploadExecutor.resume(taskId).catch(() => {
        // Silent
      });
    } catch (error) {
      get().transitionTo(taskId, task.status);
      throw error;
    }
  },

  cancelTask: async (taskId) => {
    const { tasks } = get();
    const task = tasks.get(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);

    uploadExecutor.cancel(taskId);

    if (!get().transitionTo(taskId, 'cancelled')) {
      throw new Error(`Cannot cancel task in status: ${task.status}`);
    }

    try {
      await cancelUpload(taskId);
      progressCalculator.clear(taskId);
      const { fileCache } = get();
      const newFileCache = new Map(fileCache);
      newFileCache.delete(taskId);
      set({ fileCache: newFileCache });
    } catch (error) {
      get().transitionTo(taskId, task.status);
      throw error;
    }
  },

  retryTask: async (taskId) => {
    const { tasks, fileCache, completedActionsTriggered, errorNotificationTriggered } = get();
    const task = tasks.get(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);

    if (task.status !== 'failed') {
      throw new Error(`Cannot retry task in status: ${task.status}`);
    }

    const file = fileCache.get(taskId);
    if (!file) {
      throw new Error('File not found in cache, cannot retry');
    }

    progressCalculator.reset(taskId);
    completedActionsTriggered.delete(taskId);
    errorNotificationTriggered.delete(taskId);

    if (!get().transitionTo(taskId, 'initialized')) {
      throw new Error('Failed to transition task to initialized state');
    }

    const updatedTask = tasks.get(taskId);
    if (updatedTask) {
      const newTasks = new Map(tasks);
      newTasks.set(taskId, {
        ...updatedTask,
        progress: 0,
        uploadedBytes: 0,
        uploadedChunks: 0,
        speed: 0,
        remainingTime: 0,
        errorMessage: undefined,
      });
      set({ tasks: newTasks });
    }

    const currentConcurrency = 3;
    const currentChunkSize = 5 * 1024 * 1024;
    uploadExecutor.start(taskId, file, currentConcurrency, currentChunkSize).catch(() => {
      // Silent
    });
  },

  clearCompletedTasks: async () => {
    try {
      await clearCompletedTasksApi();
      
      const { tasks } = get();
      const newTasks = new Map(tasks);
      
      // 删除所有已完成、失败和取消的任务
      Array.from(newTasks.values()).forEach((task) => {
        if (['completed', 'failed', 'cancelled'].includes(task.status)) {
          newTasks.delete(task.taskId);
          progressCalculator.clear(task.taskId);
        }
      });
      
      set({ tasks: newTasks });
    } catch (error) {
      console.error('清空已完成任务失败:', error);
      throw error;
    }
  },

  initSSE: async (userId: string) => {
    try {
      await get().fetchTasks();

      sseService.setReconnectSyncCallback(async () => {
        await get().syncTasks();
      });

      if (sseMessageUnsubscribe) {
        sseMessageUnsubscribe();
      }
      sseMessageUnsubscribe = sseService.onMessage(get().handleSSEMessage);

      if (sseConnectionUnsubscribe) {
        sseConnectionUnsubscribe();
      }
      sseConnectionUnsubscribe = sseService.onConnectionChange((connected) => {
        get().setSseConnected(connected);
      });

      sseService.connect(userId);

      get().checkAndStartPolling();
      get().setupBeforeUnloadWarning();
    } catch (error) {
      console.error('初始化 SSE 失败:', error);
    }
  },

  disconnectSSE: () => {
    if (sseMessageUnsubscribe) {
      sseMessageUnsubscribe();
      sseMessageUnsubscribe = null;
    }

    if (sseConnectionUnsubscribe) {
      sseConnectionUnsubscribe();
      sseConnectionUnsubscribe = null;
    }

    sseService.disconnect();
    get().setSseConnected(false);
    get().stopPolling();
  },

  checkAndStartPolling: () => {
    const { tasks } = get();
    const hasActiveTasks = Array.from(tasks.values()).some(
      (task) =>
        task.status === 'uploading' ||
        task.status === 'checking' ||
        task.status === 'merging'
    );

    if (hasActiveTasks && pollingTimerId === null) {
      get().startPolling();
    }
  },

  startPolling: () => {
    if (pollingTimerId !== null) return;
    
    pollingTimerId = window.setInterval(async () => {
      const { tasks } = get();
      const activeTasks = Array.from(tasks.values()).filter(
        (task) =>
          task.status === 'uploading' ||
          task.status === 'checking' ||
          task.status === 'merging'
      );

      if (activeTasks.length === 0) {
        get().stopPolling();
        return;
      }

      try {
        await get().syncTasks();
      } catch {
        // Silent
      }
    }, POLLING_INTERVAL);
  },

  stopPolling: () => {
    if (pollingTimerId !== null) {
      window.clearInterval(pollingTimerId);
      pollingTimerId = null;
    }
  },

  setupBeforeUnloadWarning: () => {
    if (beforeUnloadWarningSetup) return;
    beforeUnloadWarningSetup = true;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const { tasks } = get();
      const hasUploadingTasks = Array.from(tasks.values()).some(
        (task) =>
          task.status === 'idle' ||
          task.status === 'initialized' ||
          task.status === 'uploading' ||
          task.status === 'checking' ||
          task.status === 'merging' ||
          task.status === 'paused'
      );

      if (hasUploadingTasks) {
        event.preventDefault();
        event.returnValue = '有文件正在上传，离开页面将取消所有上传任务';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
  },

  getDisplayData: (taskId) => {
    return progressCalculator.getDisplayData(taskId);
  },
}));
