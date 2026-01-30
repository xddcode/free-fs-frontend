export interface ShareCreateParams {
  /** 文件ID列表（支持多个文件/文件夹） */
  fileIds: string[];
  /** 分享名称（可选，默认取第一个文件名） */
  shareName?: string;
  /** 有效期类型：1-7天 2-30天 3-自定义 4-永久 */
  expireType?: number | null;
  /** 自定义有效期（可选） */
  expireTime?: string;
  /** 是否需要提取码 */
  needShareCode?: boolean;
  /** 最大查看次数（可选） */
  maxViewCount?: number;
  /** 最大下载次数（可选） */
  maxDownloadCount?: number;
  /** 分享权限（preview,download 逗号拼接） */
  scope?: string;
}

export interface ShareCreateResponse {
  /** 分享ID */
  id: string;
  /** 分享名称 */
  shareName: string;
  /** 分享链接 */
  shareUrl: string;
  /** 提取码 */
  shareCode: string | null;
  /** 过期时间 */
  expireTime: string | null;
  /** 是否永久有效 */
  isPermanent: boolean;
  /** 查看次数 */
  viewCount: number;
  /** 下载次数 */
  downloadCount: number;
  /** 最大查看次数 */
  maxViewCount: number | null;
  /** 最大下载次数 */
  maxDownloadCount: number | null;
  /** 文件数量 */
  fileCount: number;
  /** 创建时间 */
  createdAt: string;
}
