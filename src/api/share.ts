import { request } from './request';
import service from './request';
import type { 
  ShareCreateParams, 
  ShareCreateResponse,
  ShareItem,
  ShareListQuery,
  ShareThin,
  ShareValidParams,
  ShareAccessRecord,
} from '@/types/share';
import type { FileItem } from '@/types/file';

/**
 * 获取我的分享列表
 */
export function getMyShareList(params?: ShareListQuery) {
  return request.get<ShareItem[]>('/apis/share/list', { params });
}

/**
 * 创建分享
 */
export function shareFiles(params: ShareCreateParams) {
  return request.post<ShareCreateResponse>('/apis/share/create', params);
}

/**
 * 取消分享（支持单个和批量）
 */
export function cancelShares(ids: string[]) {
  return request.delete('/apis/share/cancels', { data: ids });
}

/**
 * 查看分享详情
 */
export function getShareDetail(shareId: string) {
  return request.get<ShareThin>(`/apis/share/${shareId}/info`);
}

/**
 * 验证分享码
 */
export function validateShareCode(params: ShareValidParams) {
  return request.post<boolean>('/apis/share/verify/code', params);
}

/**
 * 获取分享文件列表
 */
export function getShareItemList(shareId: string, parentId?: string) {
  return request.get<FileItem[]>(`/apis/share/${shareId}/items`, {
    params: parentId ? { parentId } : undefined,
  });
}

/**
 * 获取分享详细信息（用于查看详情）
 */
export function getShareDetailById(shareId: string) {
  return request.get<ShareItem>(`/apis/share/${shareId}`);
}

/**
 * 获取分享访问记录列表
 */
export function getShareAccessRecords(shareId: string) {
  return request.get<ShareAccessRecord[]>(`/apis/share/${shareId}/access/records`);
}

/**
 * 下载分享文件
 */
export function downloadShareFile(shareId: string, fileId: string) {
  return service.get(`/apis/share/${shareId}/download/${fileId}`, {
    responseType: 'blob',
  });
}
