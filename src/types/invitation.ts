/** 邀请详情（验证接口返回） */
export interface InvitationDetail {
  id: string
  workspaceId: string
  workspaceName: string
  email: string
  roleName: string
  inviterName: string
  status: number
  expiresAt: string
  expired: boolean
  createdAt: string
  userExists: boolean // 关键字段：用户是否已存在
}

/** 接受邀请响应 */
export interface AcceptInvitationResponse {
  message?: string
}
