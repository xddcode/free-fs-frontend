export interface UserInfo {
  id: string
  username: string
  nickname: string
  email: string
  avatar: string
  status: number
  createdAt?: string
  updatedAt?: string
  lastLoginAt?: string
}

export interface LoginRes {
  accessToken: string
}

export interface LoginParams {
  username: string
  password: string
  isRemember: boolean
}

export interface UserRegisterParams {
  username: string
  password: string
  confirmPassword: string
  email: string
  nickname: string
  avatar?: string
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
