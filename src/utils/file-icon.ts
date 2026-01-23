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
 * 获取默认文件图标路径
 * 当指定类型的图标加载失败时使用
 * 
 * @returns 默认图标路径
 */
export function getDefaultFileIcon(): string {
  return '/i/default.svg';
}

/**
 * 处理图标加载错误
 * 用于 img 标签的 onError 事件
 * 
 * @param event - 错误事件
 */
export function handleIconError(event: React.SyntheticEvent<HTMLImageElement, Event>): void {
  const img = event.currentTarget;
  // 避免无限循环：如果已经是默认图标了就不再替换
  if (!img.src.endsWith('/default.svg')) {
    img.src = getDefaultFileIcon();
  }
}
