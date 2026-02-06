/**
 * 任务状态联合类型（9 种状态）
 */
export type TaskStatus =
  | 'idle'
  | 'initialized'
  | 'checking'
  | 'uploading'
  | 'paused'
  | 'merging'
  | 'completed'
  | 'failed'
  | 'cancelled'

/**
 * 传输任务接口
 */
export interface TransferTask {
  taskId: string
  fileName: string
  fileSize: number
  status: TaskStatus
  progress: number
  uploadedBytes: number
  speed: number
  remainingTime: number
  errorMessage?: string
  createdAt: number
  updatedAt: number
  parentId?: string
  mimeType?: string
  fileMd5?: string
  totalChunks?: number
  uploadedChunks?: number
  chunkSize?: number
}

/**
 * 进度更新数据
 */
export interface ProgressUpdate {
  uploadedBytes: number
  totalBytes: number
  uploadedChunks?: number
  totalChunks?: number
}

/**
 * SSE 消息类型
 */
export type SSEMessageType = 'progress' | 'status' | 'complete' | 'error'

/**
 * SSE 进度数据
 */
export interface SSEProgressData {
  uploadedBytes: number
  totalBytes: number
  uploadedChunks: number
  totalChunks: number
}

/**
 * SSE 状态变更数据
 */
export interface SSEStatusData {
  status: TaskStatus
  message?: string
}

/**
 * SSE 完成数据
 */
export interface SSECompleteData {
  fileId: string
  fileName: string
  fileSize: number
}

/**
 * SSE 错误数据
 */
export interface SSEErrorData {
  code: string
  message: string
}

/**
 * SSE 消息联合类型
 */
export type SSEMessageData =
  | SSEProgressData
  | SSEStatusData
  | SSECompleteData
  | SSEErrorData

/**
 * SSE 消息接口
 */
export interface SSEMessage {
  type: SSEMessageType
  taskId: string
  data: SSEMessageData
}

/**
 * 初始化上传请求参数
 */
export interface InitUploadCmd {
  fileName: string
  fileSize: number
  parentId?: string
  totalChunks: number
  chunkSize: number
  mimeType: string
}

/**
 * 校验上传请求参数
 */
export interface CheckUploadCmd {
  taskId: string
  fileMd5: string
  fileName: string
}

/**
 * 校验上传响应结果
 */
export interface CheckUploadResultVO {
  isQuickUpload: boolean
  fileId?: string
  taskId: string
  message?: string
}

/**
 * 文件传输任务VO
 */
export interface FileTransferTaskVO {
  taskId: string
  taskType: 'upload' | 'download'
  userId: string
  parentId?: string
  objectKey: string
  fileName: string
  fileSize: number
  suffix?: string
  totalChunks: number
  uploadedChunks: number
  chunkSize: number
  storagePlatformSettingId: string
  status: TaskStatus
  errorMsg?: string
  startTime?: string
  completeTime?: string
  progress?: number
  speed?: number
  remainTime?: number
  uploadedSize?: number
}
