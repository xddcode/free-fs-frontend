import { request } from './request';
import type {
  StoragePlatform,
  StorageSetting,
  ActiveStoragePlatform,
  AddStorageSettingParams,
  UpdateStorageSettingParams,
} from '@/types/storage';

/**
 * 获取存储平台列表（用于下拉选择）
 */
export function getStoragePlatforms() {
  return request.get<StoragePlatform[]>('/apis/storage/platforms');
}

/**
 * 获取用户已配置的存储平台列表
 */
export function getUserStorageSettings() {
  return request.get<StorageSetting[]>('/apis/storage/platform/settings');
}

/**
 * 添加新的存储平台配置
 */
export function addStorageSetting(data: AddStorageSettingParams) {
  return request.post('/apis/storage/settings', data);
}

/**
 * 更新存储平台配置
 */
export function updateStorageSetting(data: UpdateStorageSettingParams) {
  return request.put('/apis/storage/settings', data);
}

/**
 * 删除存储平台配置
 */
export function deleteStorageSetting(id: number) {
  return request.delete(`/apis/storage/settings/${id}`);
}

/**
 * 启用/禁用存储平台配置
 */
export function toggleStorageSetting(id: string, action: number) {
  return request.post(`/apis/storage/settings/${id}/${action}`);
}

/**
 * 获取用户的存储平台配置
 */
export function getStoragePlatformsSettings(identifier: string) {
  return request.get<StorageSetting>(`/apis/storage/settings/${identifier}`);
}

/**
 * 获取当前用户已开通且已配置的存储平台列表
 */
export function getActiveStoragePlatforms() {
  return request.get<ActiveStoragePlatform[]>('/apis/storage/active-platforms');
}
