import type { PermissionCodeType } from './permission'

/** 0 系统预设 1 自定义 */
export type RoleType = 0 | 1

/** GET `/apis/role/list` 列表项（无 permissions） */
export interface RoleListItem {
  id: number
  roleCode: string
  roleName: string
  /** 后端字段 description */
  description?: string | null
  roleType?: RoleType
  createdAt?: string
  updatedAt?: string
}

/** 创建/更新角色等返回的完整角色（含权限） */
export interface Role extends RoleListItem {
  permissions: PermissionCodeType[]
  userCount?: number
}

export interface CreateRoleParams {
  roleCode: string
  roleName: string
  description?: string
  permissions: PermissionCodeType[]
}

export interface UpdateRoleParams {
  roleName: string
  description?: string
  permissions: PermissionCodeType[]
}
