/**
 * 文件分享信息
 */
export interface ShareItem {
  /** 分享ID（用于唯一标识） */
  id: string
  /** 分享名称 */
  shareName: string
  /** 分享链接 */
  shareUrl: string | null
  /** 提取码 */
  shareCode: string | null
  /** 过期时间 */
  expireTime: string | null
  /** 是否永久有效 */
  isPermanent: boolean | null
  /** 查看次数 */
  viewCount: number
  /** 下载次数 */
  downloadCount: number
  /** 最大查看次数 */
  maxViewCount: number
  /** 最大下载次数 */
  maxDownloadCount: number
  /** 文件数量 */
  fileCount?: number
  /** 创建时间 */
  createdAt: string
  /** 分享权限（preview,download 逗号拼接） */
  scope?: string
}

/**
 * 分享简要信息
 */
export interface ShareThin {
  /** 分享ID（用于唯一标识） */
  id: string
  /** 分享名称 */
  shareName: string
  /** 过期时间 */
  expireTime: string | null
  /** 文件数量 */
  fileCount?: number
  /** 是否有验证码 */
  hasCheckCode: boolean
  /** 是否已过期 */
  isExpire: boolean
  /** 分享权限（preview,download 逗号拼接） */
  scope?: string
}

/**
 * 分享列表查询参数
 */
export interface ShareListQuery {
  /** 分享名称关键词 */
  keyword?: string
  /** 排序字段 */
  orderBy?: string
  /** 排序方向 ASC | DESC */
  orderDirection?: 'ASC' | 'DESC'
}

export interface ShareCreateParams {
  /** 文件ID列表（支持多个文件/文件夹） */
  fileIds: string[]
  /** 分享名称（可选，默认取第一个文件名） */
  shareName?: string
  /** 有效期类型：1-7天 2-30天 3-自定义 4-永久 */
  expireType?: number | null
  /** 自定义有效期（可选） */
  expireTime?: string
  /** 是否需要提取码 */
  needShareCode?: boolean
  /** 最大查看次数（可选） */
  maxViewCount?: number
  /** 最大下载次数（可选） */
  maxDownloadCount?: number
  /** 分享权限（preview,download 逗号拼接） */
  scope?: string
}

export interface ShareCreateResponse {
  /** 分享ID */
  id: string
  /** 分享名称 */
  shareName: string
  /** 分享链接 */
  shareUrl: string
  /** 提取码 */
  shareCode: string | null
  /** 过期时间 */
  expireTime: string | null
  /** 是否永久有效 */
  isPermanent: boolean
  /** 查看次数 */
  viewCount: number
  /** 下载次数 */
  downloadCount: number
  /** 最大查看次数 */
  maxViewCount: number | null
  /** 最大下载次数 */
  maxDownloadCount: number | null
  /** 文件数量 */
  fileCount: number
  /** 创建时间 */
  createdAt: string
}

/**
 * 分享验证参数
 */
export interface ShareValidParams {
  /** 分享ID */
  shareId: string
  /** 分享码 */
  shareCode: string | null
}

/**
 * 分享访问记录
 */
export interface ShareAccessRecord {
  /** 自增ID */
  id: string
  /** 分享ID */
  shareId: string
  /** 访问IP */
  accessIp: string
  /** 访问地址 */
  accessAddress: string
  /** 访问浏览器 */
  browser: string
  /** 访问操作系统 */
  os: string
  /** 访问时间 */
  accessTime: string
}
