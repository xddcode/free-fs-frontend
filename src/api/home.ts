import type { FileItem } from '@/types/file'
import { request } from './request'

export interface HomeInfo {
  fileCount: number
  directoryCount: number
  favoriteCount: number
  shareCount: number
  usedStorage: number
  recentFiles: FileItem[]
}

export function getHomeInfo() {
  return request.get<HomeInfo>('/apis/home/info')
}
