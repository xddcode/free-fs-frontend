/**
 * 获取用户头像的 fallback 文字
 * @param name 用户昵称或用户名
 * @returns 1-2个字符的文字
 */
export function getAvatarFallback(name: string): string {
  if (!name || !name.trim()) {
    return '?'
  }

  const trimmedName = name.trim()

  // 检查是否包含中文字符
  const hasChinese = /[\u4e00-\u9fa5]/.test(trimmedName)

  if (hasChinese) {
    // 如果包含中文，只取第一个汉字
    const firstChinese = trimmedName.match(/[\u4e00-\u9fa5]/)
    return firstChinese ? firstChinese[0] : trimmedName.slice(0, 1)
  } else {
    // 如果是英文或其他字符，取前两个字母并转大写
    const letters = trimmedName.replace(/[^a-zA-Z]/g, '')
    if (letters.length === 0) {
      // 如果没有字母，取前两个字符
      return trimmedName.slice(0, 2).toUpperCase()
    }
    // 取前两个字母
    return letters.slice(0, 2).toUpperCase()
  }
}
