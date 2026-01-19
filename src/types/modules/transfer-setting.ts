/**
 * 传输设置
 */
export interface TransferSetting {
  id?: string;
  userId?: string;
  maxUploadSpeed?: number; // 最大上传速度 (KB/s)
  maxDownloadSpeed?: number; // 最大下载速度 (KB/s)
  autoRetry?: boolean; // 自动重试
  maxRetryCount?: number; // 最大重试次数
  chunkSize?: number; // 分片大小 (KB)
  concurrentUploads?: number; // 并发上传数
  concurrentDownloads?: number; // 并发下载数
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 更新传输设置命令
 */
export interface UpdateTransferSettingCmd {
  maxUploadSpeed?: number;
  maxDownloadSpeed?: number;
  autoRetry?: boolean;
  maxRetryCount?: number;
  chunkSize?: number;
  concurrentUploads?: number;
  concurrentDownloads?: number;
}
