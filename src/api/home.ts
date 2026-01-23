import { request } from './request';
import type { FileItem } from '@/types/file';

export interface HomeInfo {
  fileCount: number;
  directoryCount: number;
  favoriteCount: number;
  shareCount: number;
  usedStorage: number;
  recentFiles: FileItem[];
}

export function getHomeInfo() {
  return request.get<HomeInfo>('/apis/home/info');
}
