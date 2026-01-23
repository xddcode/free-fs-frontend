export interface FileItem {
  id: string;
  objectKey: string;
  originalName: string;
  displayName: string;
  suffix: string;
  size: number;
  mimeType: string;
  isDir: boolean;
  parentId?: string;
  userId: string;
  uploadTime: string;
  updateTime: string;
  lastAccessTime?: string;
  isFavorite?: boolean;
}

export interface FileRecycleItem {
  id: string;
  displayName: string;
  suffix: string;
  size: number;
  isDir: boolean;
  deletedTime: string;
}

export type FileType = 'image' | 'video' | 'audio' | 'document' | 'other';
export type SortOrder = 'ASC' | 'DESC';

export interface FileListParams {
  orderBy?: string;
  orderDirection?: SortOrder;
  parentId?: string;
  keyword?: string;
  fileType?: FileType;
  isFavorite?: boolean;
  isRecents?: boolean;
  isDir?: boolean;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
}
