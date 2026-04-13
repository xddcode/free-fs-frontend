import { toast } from 'sonner'
import { getPreviewToken } from '@/api/file'
import i18n from '@/i18n'

/**
 * 通过短时预览令牌打开文件预览页
 */
export async function openFilePreviewWithToken(
  fileId: string,
  previewBaseUrl: string
) {
  const previewWindow = window.open('', '_blank')

  if (!previewWindow) {
    toast.error(i18n.t('common:preview.popupBlocked'))
    return
  }

  try {
    const token = await getPreviewToken(fileId)
    const previewUrl = `${previewBaseUrl}/preview/${fileId}?previewToken=${encodeURIComponent(token)}`
    previewWindow.location.href = previewUrl
  } catch (error) {
    previewWindow.close()
    toast.error(i18n.t('common:preview.tokenFailed'))
  }
}
