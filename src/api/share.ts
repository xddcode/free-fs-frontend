import { request } from './request';
import type { ShareCreateParams, ShareCreateResponse } from '@/types/share';

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
