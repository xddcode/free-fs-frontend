import { request } from './request';
import type { FileListParams, FileItem, FileRecycleItem } from '@/types/file';
import { AxiosProgressEvent } from 'axios';

/**
 * 查询文件列表
 */
export function getFileList(params: FileListParams) {
  return request.get<FileItem[]>('/apis/file/list', { params });
}

/**
 * 获取文件详情
 */
export function getFileDetail(fileId: string) {
  return request.get<FileItem>(`/apis/file/${fileId}`);
}

/**
 * 查询目录列表
 */
export function getFolders(parentId?: string | null) {
  return request.get<FileItem[]>('/apis/file/dirs', {
    params: parentId ? { parentId } : {},
  });
}

/**
 * 获取文件夹路径（面包屑导航）
 */
export function getFolderPath(folderId: string) {
  return request.get<FileItem[]>(`/apis/file/directory/${folderId}/path`);
}

/**
 * 上传文件
 */
export function uploadFile(
  file: File,
  parentId?: string,
  onProgress?: (progressEvent: AxiosProgressEvent) => void
) {
  const formData = new FormData();
  formData.append('file', file);
  if (parentId) {
    formData.append('parentId', parentId);
  }
  return request.post('/apis/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress,
  });
}

/**
 * 创建文件夹
 */
export function createFolder(data: { folderName: string; parentId?: string }) {
  return request.post('/apis/file/directory', data);
}

/**
 * 删除文件（移到回收站）
 */
export function deleteFiles(fileIds: string[]) {
  return request.delete('/apis/file', { data: fileIds });
}

/**
 * 重命名文件
 */
export function renameFile(fileId: string, displayName: string) {
  return request.put(`/apis/file/${fileId}/rename`, { displayName });
}

/**
 * 移动文件
 */
export function moveFiles(dirId: string, fileIds: string[]) {
  return request.put('/apis/file/moves', { dirId, fileIds });
}

/**
 * 获取回收站文件列表
 */
export function getRecycleList(keyword?: string) {
  return request.get<FileRecycleItem[]>('/apis/file/recycles', {
    params: { keyword },
  });
}

/**
 * 还原文件
 */
export function restoreFiles(fileIds: string[]) {
  return request.put('/apis/file/recycles', fileIds);
}

/**
 * 彻底删除文件
 */
export function permanentDeleteFiles(fileIds: string[]) {
  return request.delete('/apis/file/recycles', { data: fileIds });
}

/**
 * 清空回收站
 */
export function clearRecycle() {
  return request.delete('/apis/file/recycles/clear');
}

/**
 * 收藏文件
 */
export function favoriteFile(fileIds: string[]) {
  return request.post('/apis/file/favorites', fileIds);
}

/**
 * 取消收藏文件
 */
export function unfavoriteFile(fileIds: string[]) {
  return request.delete('/apis/file/favorites', { data: fileIds });
}

/**
 * 获取文件访问URL
 */
export function getFilePreviewUrl(fileId: string, expireSeconds = 180) {
  return request.get(`/apis/file/url/${fileId}`, { params: { expireSeconds } });
}
