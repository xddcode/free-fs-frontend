/**
 * 获取文件图标路径
 * 根据文件类型返回对应的图标路径
 * 所有图标都从 /i/ 目录获取
 * 
 * @param type - 文件类型（后缀名）或 'dir' 表示文件夹
 * @returns 图标路径
 */
export function getFileIcon(type: string): string {
  const lowerType = type.toLowerCase();
  
  // 文件夹特殊处理
  if (lowerType === 'dir' || lowerType === 'folder') {
    return '/i/folder.svg';
  }
  
  // 直接根据后缀名返回对应的 SVG 图标路径
  // 如果文件不存在，浏览器会显示默认的图标或者可以在组件中处理错误
  return `/i/${lowerType}.svg`;
}

/**
 * 获取文件图标路径（带回退）
 * 如果指定类型的图标不存在，返回默认文件图标
 * 
 * @param type - 文件类型（后缀名）或 'dir' 表示文件夹
 * @returns 图标路径
 */
export function getFileIconWithFallback(type: string): string {
  const lowerType = type.toLowerCase();
  
  // 文件夹特殊处理
  if (lowerType === 'dir' || lowerType === 'folder') {
    return '/i/folder.svg';
  }
  
  // 已知的文件类型列表（可以根据实际情况扩展）
  const knownTypes = [
    'doc', 'docx', 'zip', 'rar', 'pdf', 'txt', 'md',
    'xls', 'xlsx', 'ppt', 'pptx', 'csv',
    'jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp',
    'mp3', 'mp4', 'avi', 'mov', 'wav',
    'html', 'htm', 'css', 'js', 'ts', 'jsx', 'tsx',
    'json', 'xml', 'yaml', 'yml',
    'c', 'cpp', 'h', 'java', 'py', 'go', 'rs',
  ];
  
  // 如果是已知类型，返回对应图标，否则返回通用文件图标
  if (knownTypes.includes(lowerType)) {
    return `/i/${lowerType}.svg`;
  }
  
  return '/i/file.svg';
}
