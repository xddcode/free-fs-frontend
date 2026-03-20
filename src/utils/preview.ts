import { toast } from 'sonner'
import { getPreviewToken } from '@/api/file'

/**
 * 通过短时预览令牌打开文件预览页
 */
export async function openFilePreviewWithToken(
  fileId: string,
  previewBaseUrl: string
) {
  const previewWindow = window.open('', '_blank')

  if (!previewWindow) {
    toast.error('浏览器阻止了弹窗，请允许后重试')
    return
  }

  try {
    const token = await getPreviewToken(fileId)
    const previewUrl = `${previewBaseUrl}/preview/${fileId}?previewToken=${encodeURIComponent(token)}`
    previewWindow.location.href = previewUrl
  } catch (error) {
    previewWindow.close()
    toast.error('获取预览凭证失败，请稍后重试')
  }
}
