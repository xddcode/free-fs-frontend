import { request } from '@/api/interceptor';
import type {
  LoginParams,
  LoginRes,
  UserInfo,
  UserRegisterParams,
  UpdateUserInfoParams,
  ChangeEmailParams,
  ChangePasswordParams,
  ForgotPasswordParams,
  SecurityLogQueryParams,
  SecurityLogResponse,
} from '@/types/modules/user';

/**
 * 用户登录
 */
export function login(data: LoginParams) {
  return request.post<LoginRes>('/apis/auth/login', data);
}

/**
 * 用户注册
 */
export function register(data: UserRegisterParams) {
  return request.post<void>('/apis/user/register', data);
}

/**
 * 用户登出
 */
export function logout() {
  return request.post<void>('/apis/auth/logout');
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return request.get<UserInfo>('/apis/user/info');
}

/**
 * 发送忘记密码验证码
 */
export function sendForgetPasswordCode(mail: string) {
  return request.get<void>(`/apis/user/forget-password/code/${mail}`);
}

/**
 * 忘记密码-修改密码
 */
export function updateForgetPassword(data: ForgotPasswordParams) {
  return request.put<void>('/apis/user/forget-password', data);
}

/**
 * 修改密码
 */
export function changePassword(data: ChangePasswordParams) {
  return request.put<void>('/apis/user/password', data);
}

/**
 * 更新用户信息
 */
export function updateUserInfo(data: UpdateUserInfoParams) {
  return request.put<UserInfo>('/apis/user/info', data);
}

/**
 * 发送修改邮箱验证码
 */
export function sendChangeEmailCode(email: string) {
  return request.get<void>(`/apis/user/change-email/code/${email}`);
}

/**
 * 修改邮箱
 */
export function changeEmail(data: ChangeEmailParams) {
  return request.put<void>('/apis/user/change-email', data);
}

/**
 * 获取安全日志
 */
export function getSecurityLogs(params?: SecurityLogQueryParams) {
  return request.get<SecurityLogResponse>('/apis/user/security-logs', {
    params,
  });
}

/**
 * 获取用户传输设置
 */
export function getTransferSetting() {
  return request.get<import('@/types/modules/transfer-setting').TransferSetting>(
    '/apis/user/transfer/setting'
  );
}

/**
 * 更新用户传输设置
 */
export function updateTransferSetting(
  data: import('@/types/modules/transfer-setting').UpdateTransferSettingCmd
) {
  return request.put<void>('/apis/user/transfer/setting', data);
}
