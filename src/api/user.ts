import {
  TransferSetting,
  UpdateTransferSettingCmd,
} from '@/types/transfer-setting'
import {
  LoginParams,
  LoginRes,
  UserInfo,
  UserRegisterParams,
  ChangePasswordParams,
  SetPasswordParams,
  ForgotPasswordParams,
  UpdateUserInfoParams,
} from '@/types/user'
import { request } from './request'

export const userApi = {
  // 登录
  login: (data: LoginParams) => {
    return request.post<LoginRes>('/apis/auth/login', data)
  },

  /** 登录-邮箱验证码：向 account 对应邮箱发送验证码（与后端路径对齐） */
  sendLoginEmailCode: (account: string) => {
    return request.post<unknown>('/apis/auth/login/email-code', null, {
      params: { account },
    })
  },

  // 注册
  register: (data: UserRegisterParams) => {
    return request.post<UserInfo>('/apis/user/register', data)
  },

  // 获取用户信息
  getUserInfo: () => {
    return request.get<UserInfo>('/apis/user/info')
  },

  // 更新用户信息（请求体仅传可改字段；成功后需再调 getUserInfo，因接口可能不返回 data）
  updateUserInfo: async (data: UpdateUserInfoParams): Promise<void> => {
    await request.put<unknown>('/apis/user/info', data)
  },

  /** 上传头像（multipart，字段名 file；成功后请 getUserInfo） */
  uploadAvatar: async (file: File): Promise<void> => {
    const formData = new FormData()
    formData.append('file', file)
    await request.put<unknown>('/apis/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // 修改密码（需原密码）
  changePassword: (data: ChangePasswordParams) => {
    return request.put('/apis/user/password', data)
  },

  /** 首次设置密码（无原密码，邮箱验证码注册用户） */
  setPassword: async (data: SetPasswordParams): Promise<void> => {
    await request.post<unknown>('/apis/user/password', data)
  },

  // 退出登录
  logout: () => {
    return request.post('/apis/auth/logout')
  },

  // 发送忘记密码验证码
  sendForgetPasswordCode: (mail: string) => {
    return request.get(`/apis/user/forget-password/code/${mail}`)
  },

  // 忘记密码-修改密码
  updateForgetPassword: (data: ForgotPasswordParams) => {
    return request.put('/apis/user/forget-password', data)
  },

  // 获取传输设置
  getTransferSetting: () => {
    return request.get<TransferSetting>('/apis/user/transfer/setting')
  },

  // 更新传输设置
  updateTransferSetting: (data: UpdateTransferSettingCmd) => {
    return request.put<TransferSetting>('/apis/user/transfer/setting', data)
  },
}
