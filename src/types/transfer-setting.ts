/**
 * 用户传输设置类型定义
 */

/**
 * 用户传输设置接口
 */
export interface TransferSetting {
  /** 主键ID */
  id?: number;

  /** 用户ID */
  userId: string;

  /** 文件下载位置 */
  downloadLocation?: string;

  /** 是否默认该路径为下载路径，如果否则每次下载询问保存地址 */
  isDefaultDownloadLocation: number; // 0-否 1-是

  /** 下载速率限制 单位：MB/S */
  downloadSpeedLimit: number;

  /** 并发上传数量 */
  concurrentUploadQuantity: number;

  /** 并发下载数量 */
  concurrentDownloadQuantity: number;

  /** 分片大小 单位：字节 */
  chunkSize: number;

  /** 创建时间 */
  createdAt?: string;

  /** 修改时间 */
  updatedAt?: string;
}

/**
 * 更新传输设置请求参数
 */
export interface UpdateTransferSettingCmd {
  /** 文件下载位置（必填） */
  downloadLocation: string;

  /** 是否默认该路径为下载路径（必填，0或1） */
  isDefaultDownloadLocation: number;

  /** 下载速率限制 单位：MB/S（必填，0表示不限制） */
  downloadSpeedLimit: number;

  /** 并发上传数量（必填，最大3） */
  concurrentUploadQuantity: number;

  /** 并发下载数量（必填，最大3） */
  concurrentDownloadQuantity: number;

  /** 分片大小（必填，单位：字节） */
  chunkSize: number;
}

/**
 * 传输设置表单数据（用于前端表单）
 */
export interface TransferSettingForm {
  /** 文件下载位置 */
  downloadLocation: string;

  /** 是否默认该路径为下载路径 */
  isDefaultDownloadLocation: boolean;

  /** 下载速率限制 单位：MB/S，0 表示不限制 */
  downloadSpeedLimit: number;

  /** 是否启用下载速率限制 */
  enableDownloadSpeedLimit: boolean;

  /** 并发上传数量 */
  concurrentUploadQuantity: number;

  /** 并发下载数量 */
  concurrentDownloadQuantity: number;

  /** 分片大小 单位：字节 */
  chunkSize: number;
}
