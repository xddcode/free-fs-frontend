/**
 * 用户信息
 */
export interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  email: string;
  avatar: string;
  status: number;
  createdAt?: string; // 注册时间
  updatedAt?: string; // 更新时间
  lastLoginAt?: string; // 最后登录时间
}

/**
 * 登录响应
 */
export interface LoginRes {
  id: string;
  username: string;
  accessToken: string;
  // 可能还有其他字段
  [key: string]: any;
}

/**
 * 登录参数
 */
export interface LoginParams {
  username: string;
  password: string;
  isRemember: boolean;
}

/**
 * 注册参数
 */
export interface UserRegisterParams {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  nickname: string;
  avatar?: string; // 头像，可选
}

/**
 * 忘记密码参数
 */
export interface ForgotPasswordParams {
  mail: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * 更新用户信息参数
 */
export interface UpdateUserInfoParams {
  nickname?: string;
  email?: string;
  avatar?: string;
}

/**
 * 修改邮箱参数
 */
export interface ChangeEmailParams {
  newEmail: string;
  code: string; // 验证码
}

/**
 * 修改密码参数
 */
export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * 安全日志
 */
export interface SecurityLog {
  id: string;
  userId: string;
  action: string; // 操作类型
  ip: string; // IP地址
  location: string; // 地理位置
  os: string; // 操作系统
  browser: string; // 浏览器
  createdAt: string; // 操作时间
}

/**
 * 安全日志查询参数
 */
export interface SecurityLogQueryParams {
  page?: number;
  pageSize?: number;
}

/**
 * 安全日志响应
 */
export interface SecurityLogResponse {
  list: SecurityLog[];
  total: number;
}
