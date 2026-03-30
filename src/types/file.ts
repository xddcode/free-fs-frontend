export interface FileItem {
  id: string
  objectKey: string
  originalName: string
  displayName: string
  suffix: string
  size: number
  mimeType: string
  isDir: boolean
  parentId?: string
  userId: string
  uploadTime: string
  updateTime: string
  lastAccessTime?: string
  isFavorite?: boolean
  thumbnailUrl?: string
  // 文件夹详情字段
  includeFiles?: number
  includeFolders?: number
  createTime?: string
}

export interface FileRecycleItem {
  id: string
  displayName: string
  suffix: string
  size: number
  isDir: boolean
  deletedTime: string
}

/** 回收站分页列表查询（与后端 /apis/recycle/pages 一致） */
export interface RecyclePageQuery {
  keyword?: string
  page?: number
  pageSize?: number
}

export type FileType = 'image' | 'video' | 'audio' | 'document' | 'other'
export type SortOrder = 'ASC' | 'DESC'

export interface FileListParams {
  orderBy?: string
  orderDirection?: SortOrder
  parentId?: string
  keyword?: string
  fileType?: FileType
  isFavorite?: boolean
  isRecents?: boolean
  isDir?: boolean
  page?: number
  pageSize?: number
}

export interface BreadcrumbItem {
  id: string
  name: string
}
