import dayjs from 'dayjs'

import type { HomeUsedBytesUnit } from '@/api/home'

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

const compactZh = (value: number) =>
  new Intl.NumberFormat('zh-CN', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)

/**
 * 与首页存储图表纵轴/Tooltip 一致：万级及以上 KB/MB/GB 均用紧凑（如 2.16万）；
 * KB 未过万也保持紧凑；MB/GB 较小值按数量级保留小数。不做单位换算。
 */
export function formatHomeStorageNumber(
  value: number,
  unit: HomeUsedBytesUnit
): string {
  if (!Number.isFinite(value)) return ''
  if (value === 0) return '0'
  const abs = Math.abs(value)

  if (abs >= 10000) {
    return compactZh(value)
  }
  if (unit === 1) {
    return compactZh(value)
  }
  if (abs >= 100) {
    return value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
  }
  if (abs >= 1) {
    return value.toLocaleString('zh-CN', { maximumFractionDigits: 3 })
  }
  return new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: 8,
    minimumFractionDigits: 0,
  }).format(value)
}

/** 首页存储概览：数字格式与图表一致，再拼服务端单位文案 */
export function formatHomeStorageDisplay(
  value: number,
  unitLabel: string,
  storageUnit: HomeUsedBytesUnit
): string {
  if (!Number.isFinite(value)) return '—'
  const num = formatHomeStorageNumber(value, storageUnit)
  const u = unitLabel.trim()
  return u ? `${num} ${u}` : num
}

export const formatDate = (
  date: string | number | Date,
  format = 'YYYY/MM/DD HH:mm:ss'
): string => {
  return dayjs(date).format(format)
}

export const formatFileTime = (date: string | number | Date): string => {
  return dayjs(date).format('YYYY/MM/DD HH:mm:ss')
}

/**
 * 格式化时间
 * 规则：
 * - 今天：显示"今天 HH:mm"
 * - 非今天：显示"YYYY/MM/DD HH:mm"
 *
 * @param dateStr 日期字符串或时间戳
 * @returns 格式化后的时间字符串
 */
export function formatTime(dateStr: string | number | Date): string {
  const date = new Date(dateStr)
  const now = new Date()

  // 获取小时和分钟
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const timeStr = `${hours}:${minutes}`

  // 判断是否是今天
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  if (isToday) {
    return `今天 ${timeStr}`
  }

  // 非今天，显示完整日期 YYYY/MM/DD HH:mm
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  return `${year}/${month}/${day} ${timeStr}`
}

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}
