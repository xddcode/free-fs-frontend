import { useState, useEffect, useMemo } from 'react'
import { shareFiles } from '@/api'
import type { FileItem } from '@/types/file'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { formatFileSize } from '@/utils/format'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { FileIcon } from '@/components/file-icon'

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: FileItem | null
  files: FileItem[]
  onSuccess?: () => void
}

export function ShareModal({
  open,
  onOpenChange,
  file,
  files,
  onSuccess,
}: ShareModalProps) {
  // 表单状态
  const [expireType, setExpireType] = useState<number>(1) // 1-7天 2-30天 3-自定义 4-永久
  const [customExpireTime, setCustomExpireTime] = useState<string>('')
  const [needShareCode, setNeedShareCode] = useState(false)
  const [maxViewCountType, setMaxViewCountType] = useState<
    'unlimited' | 'custom'
  >('unlimited')
  const [maxViewCount, setMaxViewCount] = useState<string>('')
  const [maxDownloadCountType, setMaxDownloadCountType] = useState<
    'unlimited' | 'custom'
  >('unlimited')
  const [maxDownloadCount, setMaxDownloadCount] = useState<string>('')
  const [scopeList, setScopeList] = useState<string[]>(['preview'])

  // 分享结果状态
  const [shareLink, setShareLink] = useState('')
  const [shareCode, setShareCode] = useState('')
  const [shareExpireTime, setShareExpireTime] = useState('')
  const [isPermanent, setIsPermanent] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const sharingFiles = file ? [file] : files
  const isBatchShare = sharingFiles.length > 1
  const displayFiles = sharingFiles.slice(0, 3)

  // 判断是否永久分享
  const isPermanentShare = () => {
    if (shareLink) {
      return isPermanent
    }
    return expireType === 4
  }

  // 文件数量提示文本
  const filesCountText = useMemo(() => {
    const total = sharingFiles.length
    if (total > 3) {
      return `等 ${total} 个文件`
    }
    return `共 ${total} 个文件`
  }, [sharingFiles.length])

  // 重置表单
  const resetForm = () => {
    setExpireType(1)
    setCustomExpireTime('')
    setNeedShareCode(false)
    setMaxViewCountType('unlimited')
    setMaxViewCount('')
    setMaxDownloadCountType('unlimited')
    setMaxDownloadCount('')
    setScopeList(['preview'])
    setShareLink('')
    setShareCode('')
    setShareExpireTime('')
    setIsPermanent(false)
  }

  // 获取过期时间文本
  const getExpireText = () => {
    if (shareExpireTime) {
      return shareExpireTime
    }
    if (expireType === 4) return '永久有效'
    if (expireType === 3 && customExpireTime) {
      return customExpireTime
    }
    const expireMap: Record<number, string> = {
      1: '7天',
      2: '30天',
    }
    return expireMap[expireType] || ''
  }

  // 生成分享链接
  const handleShare = async () => {
    // 验证自定义时间
    if (expireType === 3 && !customExpireTime) {
      toast.warning('请选择过期时间')
      return
    }

    // 验证自定义次数
    if (maxViewCountType === 'custom' && !maxViewCount) {
      toast.warning('请输入最大查看次数')
      return
    }

    if (maxDownloadCountType === 'custom' && !maxDownloadCount) {
      toast.warning('请输入最大下载次数')
      return
    }

    setIsSubmitting(true)
    try {
      const fileIds = sharingFiles.map((f) => f.id)
      const scope = scopeList.join(',')

      const response = await shareFiles({
        fileIds,
        expireType,
        expireTime: expireType === 3 ? customExpireTime : undefined,
        needShareCode,
        maxViewCount:
          maxViewCountType === 'custom' ? Number(maxViewCount) : undefined,
        maxDownloadCount:
          maxDownloadCountType === 'custom'
            ? Number(maxDownloadCount)
            : undefined,
        scope,
      })

      if (response) {
        const shareToken = response.id
        const baseUrl = window.location.origin
        setShareLink(`${baseUrl}/s/${shareToken}`)
        setShareCode(response.shareCode || '')
        setShareExpireTime(response.expireTime || '')
        setIsPermanent(response.isPermanent)

        const successMsg =
          fileIds.length === 1
            ? '分享链接已生成'
            : `成功分享 ${fileIds.length} 个文件`
        toast.success(successMsg)
        onSuccess?.()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 复制链接
  const handleCopyLink = async () => {
    try {
      // 如果有提取码，格式为：链接\n提取码：xxxx
      const textToCopy = shareCode
        ? `${shareLink}\n提取码：${shareCode}`
        : shareLink

      await navigator.clipboard.writeText(textToCopy)
      setCopiedLink(true)
      setTimeout(() => {
        setCopiedLink(false)
      }, 2000)
      toast.success('已复制')
    } catch (error) {
      toast.error('复制失败')
    }
  }

  // 复制提取码
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(shareCode)
      setCopiedCode(true)
      setTimeout(() => {
        setCopiedCode(false)
      }, 2000)
      toast.success('已复制')
    } catch (error) {
      toast.error('复制失败')
    }
  }

  // 处理确认按钮点击
  const handleOk = async () => {
    if (!shareLink) {
      await handleShare()
    }
  }

  // 处理权限选择变化
  const handleScopeChange = (value: string) => {
    if (scopeList.includes(value)) {
      setScopeList(scopeList.filter((v) => v !== value))
    } else {
      setScopeList([...scopeList, value])
    }
  }

  // 关闭时重置
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        resetForm()
        setCopiedLink(false)
        setCopiedCode(false)
      }, 300)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[85vh] max-w-xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>分享文件</DialogTitle>
        </DialogHeader>

        <div className='space-y-6 px-6 pb-4'>
          {/* 文件信息预览 */}
          {!isBatchShare && file ? (
            <div className='flex items-center gap-4 rounded-lg bg-muted/50 p-4'>
              <FileIcon
                type={file.isDir ? 'dir' : file.suffix || ''}
                size={48}
              />
              <div className='min-w-0 flex-1'>
                <div className='truncate text-sm font-medium'>
                  {file.displayName}
                </div>
                <div className='text-xs text-muted-foreground'>
                  {formatFileSize(file.size || 0)}
                </div>
              </div>
            </div>
          ) : (
            <div className='space-y-3'>
              <div className='flex justify-center gap-6 rounded-lg bg-muted/30 p-6'>
                {displayFiles.map((previewFile) => (
                  <div
                    key={previewFile.id}
                    className='flex w-20 flex-col items-center gap-2'
                  >
                    <FileIcon
                      type={
                        previewFile.isDir ? 'dir' : previewFile.suffix || ''
                      }
                      size={64}
                    />
                    <span className='w-full truncate text-center text-xs text-muted-foreground'>
                      {previewFile.displayName}
                    </span>
                  </div>
                ))}
              </div>
              <div className='text-center text-sm text-muted-foreground'>
                {filesCountText}
              </div>
            </div>
          )}

          <Separator />

          {!shareLink ? (
            <>
              {/* 有效期 */}
              <div className='space-y-3'>
                <Label>有效期</Label>
                <RadioGroup
                  value={String(expireType)}
                  onValueChange={(value) => setExpireType(Number(value))}
                  disabled={!!shareLink}
                  className='flex flex-wrap gap-4'
                >
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='1' id='expire-7d' />
                    <Label
                      htmlFor='expire-7d'
                      className='cursor-pointer font-normal'
                    >
                      7天
                    </Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='2' id='expire-30d' />
                    <Label
                      htmlFor='expire-30d'
                      className='cursor-pointer font-normal'
                    >
                      30天
                    </Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='3' id='expire-custom' />
                    <Label
                      htmlFor='expire-custom'
                      className='cursor-pointer font-normal'
                    >
                      自定义
                    </Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='4' id='expire-permanent' />
                    <Label
                      htmlFor='expire-permanent'
                      className='cursor-pointer font-normal'
                    >
                      永久有效
                    </Label>
                  </div>
                </RadioGroup>
                {expireType === 3 && (
                  <Input
                    type='datetime-local'
                    value={customExpireTime}
                    onChange={(e) => setCustomExpireTime(e.target.value)}
                    disabled={!!shareLink}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                )}
              </div>

              {/* 分享类型 */}
              <div className='space-y-3'>
                <Label>分享类型</Label>
                <RadioGroup
                  value={needShareCode ? 'private' : 'public'}
                  onValueChange={(value) =>
                    setNeedShareCode(value === 'private')
                  }
                  disabled={!!shareLink}
                  className='flex gap-4'
                >
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='public' id='share-public' />
                    <Label
                      htmlFor='share-public'
                      className='cursor-pointer font-normal'
                    >
                      公开分享
                    </Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='private' id='share-private' />
                    <Label
                      htmlFor='share-private'
                      className='cursor-pointer font-normal'
                    >
                      私密分享
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* 分享权限 */}
              <div className='space-y-3'>
                <Label>分享权限</Label>
                <div className='flex gap-4'>
                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id='scope-preview'
                      checked={scopeList.includes('preview')}
                      onCheckedChange={() => handleScopeChange('preview')}
                      disabled={!!shareLink}
                    />
                    <Label
                      htmlFor='scope-preview'
                      className='cursor-pointer font-normal'
                    >
                      预览
                    </Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id='scope-download'
                      checked={scopeList.includes('download')}
                      onCheckedChange={() => handleScopeChange('download')}
                      disabled={!!shareLink}
                    />
                    <Label
                      htmlFor='scope-download'
                      className='cursor-pointer font-normal'
                    >
                      下载
                    </Label>
                  </div>
                </div>
              </div>

              {/* 最大查看次数 */}
              <div className='space-y-3'>
                <Label>最大查看次数</Label>
                <div className='flex items-center gap-2'>
                  <RadioGroup
                    value={maxViewCountType}
                    onValueChange={(value) =>
                      setMaxViewCountType(value as 'unlimited' | 'custom')
                    }
                    disabled={!!shareLink}
                    className='flex gap-4'
                  >
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='unlimited' id='view-unlimited' />
                      <Label
                        htmlFor='view-unlimited'
                        className='cursor-pointer font-normal'
                      >
                        不限制
                      </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='custom' id='view-custom' />
                      <Label
                        htmlFor='view-custom'
                        className='cursor-pointer font-normal'
                      >
                        自定义
                      </Label>
                    </div>
                  </RadioGroup>
                  {maxViewCountType === 'custom' && (
                    <Input
                      type='number'
                      min='1'
                      placeholder='请输入次数'
                      value={maxViewCount}
                      onChange={(e) => setMaxViewCount(e.target.value)}
                      disabled={!!shareLink}
                      className='w-32'
                    />
                  )}
                </div>
              </div>

              {/* 最大下载次数 */}
              <div className='space-y-3'>
                <Label>最大下载次数</Label>
                <div className='flex items-center gap-2'>
                  <RadioGroup
                    value={maxDownloadCountType}
                    onValueChange={(value) =>
                      setMaxDownloadCountType(value as 'unlimited' | 'custom')
                    }
                    disabled={!!shareLink}
                    className='flex gap-4'
                  >
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem
                        value='unlimited'
                        id='download-unlimited'
                      />
                      <Label
                        htmlFor='download-unlimited'
                        className='cursor-pointer font-normal'
                      >
                        不限制
                      </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='custom' id='download-custom' />
                      <Label
                        htmlFor='download-custom'
                        className='cursor-pointer font-normal'
                      >
                        自定义
                      </Label>
                    </div>
                  </RadioGroup>
                  {maxDownloadCountType === 'custom' && (
                    <Input
                      type='number'
                      min='1'
                      placeholder='请输入次数'
                      value={maxDownloadCount}
                      onChange={(e) => setMaxDownloadCount(e.target.value)}
                      disabled={!!shareLink}
                      className='w-32'
                    />
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* 分享结果 */}
              <Alert className='border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'>
                <Check className='h-4 w-4 text-green-600 dark:text-green-400' />
                <AlertDescription className='text-green-600 dark:text-green-400'>
                  分享链接已生成
                </AlertDescription>
              </Alert>

              <div className='space-y-3 rounded-lg bg-muted/100 p-4'>
                {/* 分享链接和提取码 */}
                <div className='space-y-1'>
                  <div className='text-sm break-all'>{shareLink}</div>
                  {shareCode && (
                    <div className='text-sm'>
                      <span>提取码：</span>
                      <span>{shareCode}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className='text-center text-sm text-muted-foreground'>
                {isPermanentShare()
                  ? '分享链接永久有效'
                  : `分享链接将在 ${getExpireText()} 后失效`}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {!shareLink ? (
            <>
              <DialogClose asChild>
                <Button variant='outline' disabled={isSubmitting}>
                  取消
                </Button>
              </DialogClose>
              <Button onClick={handleOk} disabled={isSubmitting}>
                {isSubmitting ? '生成中...' : '生成分享链接'}
              </Button>
            </>
          ) : (
            <>
              <DialogClose asChild>
                <Button variant='outline'>取消</Button>
              </DialogClose>
              <Button onClick={handleCopyLink}>
                {copiedLink ? (
                  <>
                    <Check className='mr-2 h-4 w-4' />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className='mr-2 h-4 w-4' />
                    复制链接
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
