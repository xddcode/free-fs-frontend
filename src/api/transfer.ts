import { request } from './request';
import type {
  FileTransferTaskVO,
  InitUploadCmd,
  CheckUploadCmd,
  CheckUploadResultVO,
} from '@/types/transfer';

/**
 * 初始化上传
 */
export function initUpload(params: InitUploadCmd) {
  return request.post<string>('/apis/transfer/init', params);
}

/**
 * 校验文件
 */
export function checkUpload(params: CheckUploadCmd) {
  return request.post<CheckUploadResultVO>('/apis/transfer/check', params);
}

/**
 * 上传分片
 */
export function uploadChunk(
  file: Blob,
  taskId: string,
  chunkIndex: number,
  chunkMd5: string
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('taskId', taskId);
  formData.append('chunkIndex', chunkIndex.toString());
  formData.append('chunkMd5', chunkMd5);

  return request.post('/apis/transfer/chunk', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000,
  });
}

/**
 * 查询已上传的分片
 */
export function getUploadedChunks(taskId: string) {
  return request.get<number[]>(`/apis/transfer/chunks/${taskId}`);
}

/**
 * 合并分片
 */
export function mergeChunks(taskId: string) {
  return request.post<string>(`/apis/transfer/merge/${taskId}`);
}

/**
 * 取消上传任务
 */
export function cancelUpload(taskId: string) {
  return request.delete(`/apis/transfer/cancel/${taskId}`);
}

/**
 * 获取传输文件列表
 */
export function getTransferFiles() {
  return request.get<FileTransferTaskVO[]>('/apis/transfer/files');
}

/**
 * 暂停上传任务
 */
export function pauseUpload(taskId: string) {
  return request.post(`/apis/transfer/pause/${taskId}`);
}

/**
 * 恢复上传任务
 */
export function resumeUpload(taskId: string) {
  return request.post(`/apis/transfer/resume/${taskId}`);
}

/**
 * 清空已完成任务
 */
export function clearCompletedTasks() {
  return request.delete('/apis/transfer/clears');
}
