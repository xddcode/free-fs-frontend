import type { FileItem } from '@/types/file'
import { request } from './request'

/** 首页 getHomeInfo 定时刷新间隔（毫秒）；标签页失焦时 React Query 默认会暂停轮询 */
export const HOME_INFO_REFETCH_INTERVAL_MS = 60_000

/** 与后端 @Schema 一致：1 KB, 2 MB, 3 GB（无字节） */
export type HomeUsedBytesUnit = 1 | 2 | 3

/** 0 近三个月, 1 近 30 天, 2 近 7 天 */
export type HomeUsedBytesDateType = 0 | 1 | 2

export interface HomeUsedBytesPoint {
  date: string
  usedBytes: number
}

/** 对应 FileHomeVO：合并后的首页信息 */
export interface HomeInfo {
  /** 与 unit 配套，已为展示用数值，无需再按字节换算 */
  usedStorage: number
  /** 与 usedStorage、usedBytes 数值配套的单位文案，由服务端返回 */
  unit?: string
  /** 随 unit、dateType 查询条件变化 */
  usedBytes: HomeUsedBytesPoint[]
  recentFiles: FileItem[]
}

export function getHomeInfo(params?: {
  unit?: HomeUsedBytesUnit
  dateType?: HomeUsedBytesDateType
}) {
  return request.get<HomeInfo>('/apis/home/info', { params })
}
