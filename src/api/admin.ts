import { request } from './request'

/**
 * 系统级管理 API（跨工作空间的全局操作）
 * 工作空间级的成员管理和邀请已迁移到 workspaceApi
 */
export const adminApi = {
  /** 禁用/启用用户（全局） */
  updateUserStatus: (userId: string, status: number) => {
    return request.put(`/apis/admin/users/${userId}/status`, { status })
  },
}
