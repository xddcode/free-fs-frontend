import { request } from './request';
import { LoginParams, LoginRes, UserInfo, UserRegisterParams, ChangePasswordParams, ForgotPasswordParams } from '@/types/user';
import { TransferSetting, UpdateTransferSettingCmd } from '@/types/transfer';

export const userApi = {
  // 登录
  login: (data: LoginParams) => {
    return request.post<LoginRes>('/apis/auth/login', data);
  },

  // 注册
  register: (data: UserRegisterParams) => {
    return request.post<UserInfo>('/apis/user/register', data);
  },

  // 获取用户信息
  getUserInfo: () => {
    return request.get<UserInfo>('/apis/user/info');
  },

  // 更新用户信息
  updateUserInfo: (data: Partial<UserInfo>) => {
    return request.put<UserInfo>('/apis/user/info', data);
  },

  // 修改密码
  changePassword: (data: ChangePasswordParams) => {
    return request.put('/apis/user/password', data);
  },

  // 退出登录
  logout: () => {
    return request.post('/apis/auth/logout');
  },

  // 发送忘记密码验证码
  sendForgetPasswordCode: (mail: string) => {
    return request.get(`/apis/user/forget-password/code/${mail}`);
  },

  // 忘记密码-修改密码
  updateForgetPassword: (data: ForgotPasswordParams) => {
    return request.put('/apis/user/forget-password', data);
  },

  // 获取传输设置
  getTransferSetting: () => {
    return request.get<TransferSetting>('/apis/user/transfer/setting');
  },

  // 更新传输设置
  updateTransferSetting: (data: UpdateTransferSettingCmd) => {
    return request.put<TransferSetting>('/apis/user/transfer/setting', data);
  },
};
