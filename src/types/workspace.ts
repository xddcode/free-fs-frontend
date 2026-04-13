import type { PermissionCodeType } from './permission'

export interface Workspace {
  id: string
  name: string
  slug: string
  description?: string
  ownerId: string
  memberCount: number
  createdAt: string
  updatedAt: string
}

/** GET `/apis/workspace/current` 返回，附带当前用户在该空间内的角色与权限 */
export interface WorkspaceDetail extends Workspace {
  roleCode: string
  roleName: string
  permissions: PermissionCodeType[]
}

export interface WorkspaceMember {
  id: string
  userId: string
  workspaceId: string
  username: string
  nickname: string
  email: string
  avatar: string
  roleId: number
  roleCode: string
  roleName: string
  status: number
  joinedAt: string
  lastLoginAt?: string
}

export interface CreateWorkspaceParams {
  name: string
  slug: string
  description?: string
}

export interface UpdateWorkspaceParams {
  name?: string
  slug?: string
  description?: string
}

export interface WorkspaceInvitation {
  id: string
  workspaceId: string
  email: string
  roleId: number
  roleName?: string
  invitedBy: string
  invitedByName?: string
  status: number
  expiresAt: string
  createdAt: string
}

export interface CreateWorkspaceInvitationParams {
  email: string
  roleId: number
}

export interface WorkspaceMemberQueryParams {
  page: number
  size: number
  keyword?: string
}
