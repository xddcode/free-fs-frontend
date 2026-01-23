import { request } from './request';
import { InitUploadCmd, CheckUploadCmd, CheckUploadResultVO } from '@/types/transfer';

export const transferApi = {
  // 初始化上传任务
  initUpload: (data: InitUploadCmd) => {
    return request.post<{ taskId: string }>('/apis/transfer/init', data);
  },

  // 校验上传（秒传检测）
  checkUpload: (data: CheckUploadCmd) => {
    return request.post<CheckUploadResultVO>('/apis/transfer/check', data);
  },

  // 上传分片
  uploadChunk: (data: FormData) => {
    return request.post('/apis/transfer/upload-chunk', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 合并分片
  mergeChunks: (taskId: string) => {
    return request.post('/apis/transfer/merge', { taskId });
  },

  // 取消任务
  cancelTask: (taskId: string) => {
    return request.post('/apis/transfer/cancel', { taskId });
  },

  // 暂停任务
  pauseTask: (taskId: string) => {
    return request.post('/apis/transfer/pause', { taskId });
  },

  // 恢复任务
  resumeTask: (taskId: string) => {
    return request.post('/apis/transfer/resume', { taskId });
  },

  // 获取任务列表
  getTaskList: () => {
    return request.get('/apis/transfer/tasks');
  },
};
