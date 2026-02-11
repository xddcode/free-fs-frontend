/**
 * 上传目录功能的限制配置
 * 可以根据实际需求调整这些值
 */

export const UPLOAD_LIMITS = {
  /**
   * 单次上传最多文件数量
   * 推荐值：1000（个人网盘）、500（企业网盘）、5000（内部系统）
   */
  MAX_FILES: 1000,

  /**
   * 单次上传总大小限制（字节）
   * 推荐值：10GB（个人网盘）、5GB（企业网盘）、50GB（内部系统）
   */
  MAX_TOTAL_SIZE: 10 * 1024 * 1024 * 1024, // 10GB

  /**
   * 最大目录深度
   * 推荐值：10（个人网盘）、8（企业网盘）、15（内部系统）
   */
  MAX_DEPTH: 10,

  /**
   * 文件名最大长度
   * 推荐值：255（文件系统限制）
   */
  MAX_FILENAME_LENGTH: 255,

  /**
   * 完整路径最大长度
   * 推荐值：1024
   */
  MAX_PATH_LENGTH: 1024,

  /**
   * 是否允许空文件夹
   * 推荐值：true
   */
  ALLOW_EMPTY_FOLDERS: true,

  /**
   * 是否自动过滤系统文件
   * 推荐值：true
   */
  AUTO_FILTER_SYSTEM_FILES: true,

  /**
   * 需要过滤的文件/文件夹模式
   * 这些文件会被自动跳过，不会上传
   */
  IGNORED_PATTERNS: [
    '.DS_Store',      // macOS 系统文件
    'Thumbs.db',      // Windows 缩略图缓存
    'desktop.ini',    // Windows 桌面配置
    '.git/',          // Git 版本控制
    'node_modules/',  // Node.js 依赖
    '__pycache__/',   // Python 缓存
    '.vscode/',       // VS Code 配置
    '.idea/',         // IntelliJ IDEA 配置
    '.svn/',          // SVN 版本控制
    '.hg/',           // Mercurial 版本控制
    'dist/',          // 构建输出（可选）
    'build/',         // 构建输出（可选）
  ],

  /**
   * 阻止的文件扩展名（可选，默认为空）
   * 如果需要阻止某些文件类型，取消注释并添加
   */
  BLOCKED_EXTENSIONS: [
    // '.exe',
    // '.bat',
    // '.cmd',
    // '.sh',
    // '.dll',
    // '.scr',
  ] as string[],

  /**
   * 阻止的 MIME 类型（可选，默认为空）
   */
  BLOCKED_MIMETYPES: [
    // 'application/x-msdownload',
    // 'application/x-sh',
  ] as string[],
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * 检查文件是否应该被过滤
 */
export function shouldFilterFile(filePath: string): boolean {
  if (!UPLOAD_LIMITS.AUTO_FILTER_SYSTEM_FILES) {
    return false
  }

  return UPLOAD_LIMITS.IGNORED_PATTERNS.some((pattern) =>
    filePath.includes(pattern)
  )
}

/**
 * 检查文件扩展名是否被阻止
 */
export function isExtensionBlocked(fileName: string): boolean {
  if (UPLOAD_LIMITS.BLOCKED_EXTENSIONS.length === 0) {
    return false
  }

  const ext = '.' + fileName.split('.').pop()?.toLowerCase()
  return UPLOAD_LIMITS.BLOCKED_EXTENSIONS.includes(ext)
}

/**
 * 检查 MIME 类型是否被阻止
 */
export function isMimeTypeBlocked(mimeType: string): boolean {
  if (UPLOAD_LIMITS.BLOCKED_MIMETYPES.length === 0) {
    return false
  }

  return UPLOAD_LIMITS.BLOCKED_MIMETYPES.includes(mimeType)
}

/**
 * 预设配置
 */
export const PRESET_CONFIGS = {
  /**
   * 个人网盘配置（推荐）
   */
  PERSONAL: {
    MAX_FILES: 1000,
    MAX_TOTAL_SIZE: 10 * 1024 * 1024 * 1024, // 10GB
    MAX_DEPTH: 10,
    AUTO_FILTER_SYSTEM_FILES: true,
    BLOCKED_EXTENSIONS: [],
  },

  /**
   * 企业网盘配置
   */
  ENTERPRISE: {
    MAX_FILES: 500,
    MAX_TOTAL_SIZE: 5 * 1024 * 1024 * 1024, // 5GB
    MAX_DEPTH: 8,
    AUTO_FILTER_SYSTEM_FILES: true,
    BLOCKED_EXTENSIONS: ['.exe', '.bat', '.cmd', '.sh', '.dll'],
  },

  /**
   * 内部系统配置
   */
  INTERNAL: {
    MAX_FILES: 5000,
    MAX_TOTAL_SIZE: 50 * 1024 * 1024 * 1024, // 50GB
    MAX_DEPTH: 15,
    AUTO_FILTER_SYSTEM_FILES: false,
    BLOCKED_EXTENSIONS: [],
  },
}
