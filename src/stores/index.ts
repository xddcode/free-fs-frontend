/**
 * Stores 统一导出
 * 集中管理所有状态 store
 */

export { useAuthStore } from './modules/auth-store';
export { useUserStore } from './modules/user-store';
export { useTransferStore } from './modules/transfer-store';
export { useAppStore } from './modules/app-store';

// 导出类型
export type { AuthState } from './modules/auth-store';
export type { UserState } from './modules/user-store';
export type { TransferState } from './modules/transfer-store';
export type { AppState } from './modules/app-store';
