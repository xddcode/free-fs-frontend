import { request } from './request';

export interface ShareCreateParams {
  fileIds: string[];
  expireType?: number | null;
  expireTime?: string;
  needShareCode?: boolean;
  maxViewCount?: number;
  maxDownloadCount?: number;
}

export interface ShareCreateResponse {
  shareId: string;
  shareLink: string;
  shareCode?: string;
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
