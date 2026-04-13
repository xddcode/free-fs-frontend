import type {
  Workspace,
  WorkspaceDetail,
  WorkspaceMember,
  WorkspaceInvitation,
  CreateWorkspaceParams,
  UpdateWorkspaceParams,
  CreateWorkspaceInvitationParams,
  WorkspaceMemberQueryParams,
} from '@/types/workspace'
import type { PageResult } from '@/types/permission'
import { request } from './request'

export const workspaceApi = {
  /** 获取当前用户的工作空间列表（不需要 X-Workspace-Id） */
  list: () => request.get<Workspace[]>('/apis/workspace/list'),

  /** 创建工作空间 */
  create: (data: CreateWorkspaceParams) =>
    request.post<Workspace>('/apis/workspace', data),

  /** 获取当前工作空间详情 + 用户在其中的角色权限（需要 X-Workspace-Id） */
  getCurrent: () =>
    request.get<WorkspaceDetail>('/apis/workspace/current'),

  /** 更新工作空间信息 */
  update: (data: UpdateWorkspaceParams) =>
    request.put<Workspace>('/apis/workspace', data),

  /** 删除工作空间（仅 owner） */
  delete: () => request.delete('/apis/workspace'),

  /** 检查 slug 是否可用 */
  checkSlug: (slug: string) =>
    request.get<boolean>('/apis/workspace/check-slug', { params: { slug } }),

  // ---- 成员管理 ----

  /** 获取工作空间成员列表（分页） */
  getMembers: (params: WorkspaceMemberQueryParams) =>
    request.get<PageResult<WorkspaceMember>>('/apis/workspace/members', {
      params,
    }),

  /** 更新成员角色 */
  updateMemberRole: (userId: string, roleId: number) =>
    request.put(`/apis/workspace/members/${userId}/role`, { roleId }),

  /** 移除成员 */
  removeMember: (userId: string) =>
    request.delete(`/apis/workspace/members/${userId}`),

  // ---- 邀请管理 ----

  /** 获取邀请列表 */
  getInvitations: () =>
    request.get<WorkspaceInvitation[]>('/apis/workspace/invitations'),

  /** 创建邀请 */
  createInvitation: (data: CreateWorkspaceInvitationParams) =>
    request.post<WorkspaceInvitation>('/apis/workspace/invitations', data),

  /** 取消邀请 */
  deleteInvitation: (id: string) =>
    request.delete(`/apis/workspace/invitations/${id}`),
}
