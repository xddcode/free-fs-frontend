import type { UserInfo } from '@/types/user'

/** 将接口返回的用户片段合并进当前用户，避免 PUT 只返回部分字段时清空头像等 */
export function mergeUserInfo(
  prev: UserInfo,
  patch: Partial<UserInfo>
): UserInfo {
  const next = { ...prev }
  for (const key of Object.keys(patch) as (keyof UserInfo)[]) {
    const v = patch[key]
    if (v !== undefined && v !== null) {
      ;(next as Record<keyof UserInfo, UserInfo[keyof UserInfo]>)[key] = v
    }
  }
  return next
}
