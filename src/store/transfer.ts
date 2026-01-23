import { create } from 'zustand';
import { TransferTask } from '@/types/transfer';
import { sseService } from '@/services/sse.service';

interface TransferState {
  tasks: Map<string, TransferTask>;
  addTask: (task: TransferTask) => void;
  updateTask: (taskId: string, updates: Partial<TransferTask>) => void;
  removeTask: (taskId: string) => void;
  clearTasks: () => void;
  initSSE: (userId: string) => void;
  disconnectSSE: () => void;
}

export const useTransferStore = create<TransferState>((set, get) => ({
  tasks: new Map(),
  
  addTask: (task) =>
    set((state) => {
      const newTasks = new Map(state.tasks);
      newTasks.set(task.taskId, task);
      return { tasks: newTasks };
    }),
  
  updateTask: (taskId, updates) =>
    set((state) => {
      const newTasks = new Map(state.tasks);
      const existingTask = newTasks.get(taskId);
      if (existingTask) {
        newTasks.set(taskId, { ...existingTask, ...updates, updatedAt: Date.now() });
      }
      return { tasks: newTasks };
    }),
  
  removeTask: (taskId) =>
    set((state) => {
      const newTasks = new Map(state.tasks);
      newTasks.delete(taskId);
      return { tasks: newTasks };
    }),
  
  clearTasks: () => set({ tasks: new Map() }),
  
  initSSE: (userId) => {
    sseService.connect(userId, {
      onProgress: (taskId, data) => {
        get().updateTask(taskId, {
          uploadedBytes: data.uploadedBytes,
          progress: (data.uploadedBytes / data.totalBytes) * 100,
          uploadedChunks: data.uploadedChunks,
        });
      },
      onStatus: (taskId, data) => {
        get().updateTask(taskId, { status: data.status });
      },
      onComplete: (taskId) => {
        get().updateTask(taskId, { status: 'completed', progress: 100 });
      },
      onError: (taskId, data) => {
        get().updateTask(taskId, { status: 'failed', errorMessage: data.message });
      },
    });
  },
  
  disconnectSSE: () => {
    sseService.disconnect();
  },
}));
