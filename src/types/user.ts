import type { PermissionCodeType } from './permission'

/** 用户在某个工作空间内的角色与权限 */
export interface UserRolePermissions {
  roleCode: string
  roleName: string
  permissions: PermissionCodeType[]
}

/** 与 GET/PUT `/apis/user/info` 返回的 `data` 对象一致（全局信息，不含权限） */
export interface UserInfo {
  id: string
  username: string
  nickname: string
  email: string
  avatar: string
  status: number
  createdAt: string
  updatedAt: string
  lastLoginAt: string
  /** 是否已设置登录密码（邮箱验证码注册未设密码时为 false） */
  isSetPassword?: boolean
}

export interface LoginRes {
  accessToken: string
}

/** 与登录接口一致:password 账号/邮箱+密码;email_code 邮箱+验证码(验证码走 password 字段) */
export type LoginType = 'password' | 'email_code'

export interface LoginParams {
  loginType: LoginType
  account: string
  password: string
  isRemember?: boolean
}

export interface UserRegisterParams {
  username: string
  password: string
  confirmPassword: string
  email: string
  nickname: string
  avatar?: string
  inviteToken?: string
}

export interface ForgotPasswordParams {
  mail: string
  code: string
  newPassword: string
  confirmPassword: string
}

export interface UpdateUserInfoParams {
  nickname?: string
  email?: string
  avatar?: string
}

export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

/** 首次设置密码 POST `/apis/user/password` */
export interface SetPasswordParams {
  newPassword: string
  confirmPassword: string
}
