import { useState, useEffect } from 'react'
import type { ShareItem, ShareAccessRecord } from '@/types/share'
import dayjs from 'dayjs'
import {
  Copy,
  Eye,
  FileText,
  Trash2,
  Link as LinkIcon,
  X,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getMyShareList,
  cancelShares,
  getShareDetailById,
  getShareAccessRecords,
} from '@/api/share'
import { cn } from '@/lib/utils'
import { formatTime, formatFileTime } from '@/utils/format'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Dock, DockIcon } from '@/components/ui/dock'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function MySharesView() {
  const [loading, setLoading] = useState(false)
  const [shareList, setShareList] = useState<ShareItem[]>([])
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  // 分享详情弹窗
  const [shareDetailVisible, setShareDetailVisible] = useState(false)
  const [shareDetailLoading, setShareDetailLoading] = useState(false)
  const [currentShare, setCurrentShare] = useState<ShareItem | null>(null)
  const [copiedShareDetail, setCopiedShareDetail] = useState(false)
  const [copiedDetailLink, setCopiedDetailLink] = useState(false)
  const [copiedDetailCode, setCopiedDetailCode] = useState(false)

  // 访问记录弹窗
  const [accessRecordsVisible, setAccessRecordsVisible] = useState(false)
  const [accessRecordsLoading, setAccessRecordsLoading] = useState(false)
  const [accessRecords, setAccessRecords] = useState<ShareAccessRecord[]>([])
  const [currentShareForRecords, setCurrentShareForRecords] =
    useState<ShareItem | null>(null)

  // 删除确认弹窗
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
  const [deletingShare, setDeletingShare] = useState<ShareItem | null>(null)
  const [batchDeleteDialogVisible, setBatchDeleteDialogVisible] =
    useState(false)

  // 获取分享列表
  const fetchShareList = async () => {
    setLoading(true)
    try {
      const data = await getMyShareList()
      setShareList(data)
    } finally {
      setLoading(false)
    }
  }

  // 判断是否已过期
  const isExpired = (expireTime: string | null) => {
    if (!expireTime) return false
    return dayjs(expireTime).isBefore(dayjs())
  }

  // 格式化过期时间
  const formatExpireTime = (expireTime: string | null) => {
    if (!expireTime) return '-'

    const now = dayjs()
    const expireDate = dayjs(expireTime)

    if (expireDate.isBefore(now)) return '已过期'

    const hoursLeft = expireDate.diff(now, 'hour')
    if (hoursLeft < 1) return '即将到期'
    if (hoursLeft < 24) return `${hoursLeft}小时后到期`

    const daysLeft = expireDate.diff(now, 'day')
    return `${daysLeft}天后到期`
  }

  // 获取分享链接
  const getShareUrl = (share: ShareItem) => {
    if (share.shareUrl) return share.shareUrl
    if (share.id) {
      const baseUrl = window.location.origin
      return `${baseUrl}/s/${share.id}`
    }
    return null
  }

  // 格式化权限文本
  const formatScopeText = (scope?: string) => {
    if (!scope) return '预览 + 下载'
    const permissions: string[] = []
    if (scope.includes('preview')) permissions.push('预览')
    if (scope.includes('download')) permissions.push('下载')
    return permissions.length > 0 ? permissions.join(' + ') : '-'
  }

  // 快捷复制
  const handleQuickCopy = async (share: ShareItem) => {
    const content: string[] = []
    content.push(`分享名称: ${share.shareName}`)

    const shareUrl = getShareUrl(share)
    if (shareUrl) {
      content.push(`分享链接: ${shareUrl}`)
    }

    if (share.shareCode) {
      content.push(`提取码: ${share.shareCode}`)
    }

    try {
      await navigator.clipboard.writeText(content.join('\n'))
      toast.success('已复制')
    } catch (error) {
      toast.error('复制失败')
    }
  }

  // 复制链接
  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      setCopiedDetailLink(true)
      setTimeout(() => setCopiedDetailLink(false), 2000)
      toast.success('已复制')
    } catch (error) {
      toast.error('复制失败')
    }
  }

  // 复制提取码
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedDetailCode(true)
      setTimeout(() => setCopiedDetailCode(false), 2000)
      toast.success('已复制')
    } catch (error) {
      toast.error('复制失败')
    }
  }

  // 复制分享详情
  const handleCopyShareDetail = async () => {
    if (!currentShare) return

    const detailText: string[] = []
    detailText.push(`分享名称: ${currentShare.shareName}`)

    const shareUrl = getShareUrl(currentShare)
    if (shareUrl) {
      detailText.push(`分享链接: ${shareUrl}`)
    }

    if (currentShare.shareCode) {
      detailText.push(`提取码: ${currentShare.shareCode}`)
    }

    try {
      await navigator.clipboard.writeText(detailText.join('\n'))
      setCopiedShareDetail(true)
      setTimeout(() => setCopiedShareDetail(false), 2000)
      toast.success('已复制')
    } catch (error) {
      toast.error('复制失败')
    }
  }

  // 查看分享详情
  const handleViewShare = async (share: ShareItem) => {
    setShareDetailVisible(true)
    setShareDetailLoading(true)
    try {
      const data = await getShareDetailById(share.id)
      setCurrentShare(data)
    } finally {
      setShareDetailLoading(false)
    }
  }

  const handleViewAccessRecords = async (share: ShareItem) => {
    setCurrentShareForRecords(share)
    setAccessRecordsVisible(true)
    setAccessRecordsLoading(true)
    setAccessRecords([])
    try {
      const data = await getShareAccessRecords(share.id)
      setAccessRecords(data)
    } finally {
      setAccessRecordsLoading(false)
    }
  }

  const handleCancelShare = (share: ShareItem) => {
    setDeletingShare(share)
    setDeleteDialogVisible(true)
  }

  const confirmCancelShare = async () => {
    if (!deletingShare) return
    try {
      await cancelShares([deletingShare.id])
      toast.success('取消成功')
      setDeleteDialogVisible(false)
      setDeletingShare(null)
      fetchShareList()
    } finally {
      // 无需处理
    }
  }

  const handleBatchCancel = () => {
    if (selectedKeys.length === 0) {
      toast.warning('请选择要取消的分享')
      return
    }
    setBatchDeleteDialogVisible(true)
  }

  const confirmBatchCancel = async () => {
    try {
      await cancelShares(selectedKeys)
      toast.success(`成功取消 ${selectedKeys.length} 个分享`)
      setBatchDeleteDialogVisible(false)
      setSelectedKeys([])
      fetchShareList()
    } finally {
      // 无需处理
    }
  }

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedKeys(shareList.map((s) => s.id))
    } else {
      setSelectedKeys([])
    }
  }

  // ESC 键取消选择
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedKeys.length > 0) {
        setSelectedKeys([])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedKeys.length])

  useEffect(() => {
    fetchShareList()
  }, [])

  const isAllSelected =
    shareList.length > 0 && selectedKeys.length === shareList.length

  return (
    <div className='flex h-full flex-col'>
      {/* 工具栏 */}
      <div className='flex items-center justify-between border-b px-6 py-3'>
        <div className='flex items-center gap-3'>
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={handleSelectAll}
            aria-label='全选'
          />
          <span className='text-sm text-muted-foreground'>
            {selectedKeys.length > 0
              ? `已选 ${selectedKeys.length} 项`
              : `共 ${shareList.length} 项`}
          </span>
        </div>
      </div>

      {/* 表格内容 */}
      <div className='flex-1 overflow-auto p-6'>
        {loading ? (
          <div className='flex h-full items-center justify-center'>
            <p className='text-muted-foreground'>加载中...</p>
          </div>
        ) : shareList.length === 0 ? (
          <div className='flex h-full items-center justify-center'>
            <div className='text-center'>
              <LinkIcon className='mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50' />
              <p className='text-muted-foreground'>暂无分享</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className='bg-muted/50'>
                <TableHead className='w-12'>
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label='全选'
                  />
                </TableHead>
                <TableHead className='font-medium'>名称</TableHead>
                <TableHead className='w-36 font-medium'>有效期</TableHead>
                <TableHead className='w-28 text-center font-medium'>
                  查看次数
                </TableHead>
                <TableHead className='w-28 text-center font-medium'>
                  下载次数
                </TableHead>
                <TableHead className='w-32 text-center font-medium'>
                  分享权限
                </TableHead>
                <TableHead className='w-44 font-medium'>创建时间</TableHead>
                <TableHead className='w-48 text-center font-medium'>
                  操作
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shareList.map((share) => {
                const isSelected = selectedKeys.includes(share.id)
                return (
                  <TableRow
                    key={share.id}
                    className={cn('group', isSelected && 'bg-primary/5')}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedKeys([...selectedKeys, share.id])
                          } else {
                            setSelectedKeys(
                              selectedKeys.filter((id) => id !== share.id)
                            )
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <LinkIcon className='h-4 w-4 shrink-0 text-primary' />
                        <span className='truncate text-sm'>
                          {share.shareName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {share.isPermanent ? (
                        <Badge
                          variant='outline'
                          className='border-green-600 text-green-600'
                        >
                          永久有效
                        </Badge>
                      ) : (
                        <span
                          className={cn(
                            'text-sm',
                            isExpired(share.expireTime)
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                          )}
                        >
                          {formatExpireTime(share.expireTime)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className='text-center text-sm'>
                      {share.viewCount}
                      {share.maxViewCount > 0 && (
                        <span className='text-xs text-muted-foreground'>
                          {' '}
                          / {share.maxViewCount}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className='text-center text-sm'>
                      {share.downloadCount}
                      {share.maxDownloadCount > 0 && (
                        <span className='text-xs text-muted-foreground'>
                          {' '}
                          / {share.maxDownloadCount}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className='text-center'>
                      <div className='flex items-center justify-center gap-1'>
                        {(!share.scope || share.scope.includes('preview')) && (
                          <Badge variant='secondary' className='text-xs'>
                            预览
                          </Badge>
                        )}
                        {(!share.scope || share.scope.includes('download')) && (
                          <Badge
                            variant='secondary'
                            className='bg-green-100 text-xs text-green-700'
                          >
                            下载
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {formatTime(share.createdAt)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className='flex items-center justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => handleQuickCopy(share)}
                          title='快捷复制'
                        >
                          <Copy className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => handleViewShare(share)}
                          title='查看详情'
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => handleViewAccessRecords(share)}
                          title='访问记录'
                        >
                          <FileText className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 text-destructive'
                          onClick={() => handleCancelShare(share)}
                          title='取消分享'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* 底部批量操作 Dock */}
      {selectedKeys.length > 0 && (
        <div className='fixed bottom-8 left-1/2 z-50 -translate-x-1/2'>
          <TooltipProvider>
            <Dock direction='middle' className='h-16 px-4'>
              <DockIcon>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='size-12 rounded-full'
                      onClick={handleBatchCancel}
                      aria-label='取消分享'
                    >
                      <Trash2 className='size-5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>取消分享</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>

              <Separator orientation='vertical' className='mx-2 h-8' />

              <DockIcon>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='size-12 rounded-full'
                      onClick={() => setSelectedKeys([])}
                      aria-label='取消选择'
                    >
                      <X className='size-5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>取消选择</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>
            </Dock>
          </TooltipProvider>
        </div>
      )}

      {/* 分享详情弹窗 */}
      <Dialog open={shareDetailVisible} onOpenChange={setShareDetailVisible}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>详细信息</DialogTitle>
          </DialogHeader>

          <div className='space-y-6 px-6 pb-4'>
            {shareDetailLoading ? (
              <div className='py-8 text-center text-sm text-muted-foreground'>
                加载中...
              </div>
            ) : (
              currentShare && (
                <div className='space-y-3'>
                  <div className='space-y-1.5'>
                    <div className='text-xs text-muted-foreground'>
                      分享名称
                    </div>
                    <div className='text-sm break-all text-foreground'>
                      {currentShare.shareName}
                    </div>
                  </div>

                  {getShareUrl(currentShare) && (
                    <div className='space-y-1.5'>
                      <div className='text-xs text-muted-foreground'>
                        分享链接
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='flex-1 text-sm break-all text-foreground'>
                          {getShareUrl(currentShare)}
                        </div>
                        <Button
                          size='icon'
                          variant='outline'
                          className='h-8 w-8 shrink-0'
                          onClick={() =>
                            handleCopyLink(getShareUrl(currentShare)!)
                          }
                        >
                          {copiedDetailLink ? (
                            <Check className='h-4 w-4 text-green-600' />
                          ) : (
                            <Copy className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className='space-y-1.5'>
                    <div className='text-xs text-muted-foreground'>提取码</div>
                    <div className='flex items-center gap-2'>
                      <div className='text-sm font-semibold tracking-wider text-foreground text-primary'>
                        {currentShare.shareCode || '-'}
                      </div>
                      {currentShare.shareCode && (
                        <Button
                          size='icon'
                          variant='outline'
                          className='h-8 w-8 shrink-0'
                          onClick={() =>
                            handleCopyCode(currentShare.shareCode!)
                          }
                        >
                          {copiedDetailCode ? (
                            <Check className='h-4 w-4 text-green-600' />
                          ) : (
                            <Copy className='h-4 w-4' />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className='space-y-1.5'>
                    <div className='text-xs text-muted-foreground'>有效期</div>
                    <div className='text-sm text-foreground'>
                      {currentShare.isPermanent
                        ? '永久有效'
                        : formatExpireTime(currentShare.expireTime)}
                    </div>
                  </div>

                  <div className='space-y-1.5'>
                    <div className='text-xs text-muted-foreground'>
                      分享权限
                    </div>
                    <div className='text-sm text-foreground'>
                      {formatScopeText(currentShare.scope)}
                    </div>
                  </div>

                  <div className='space-y-1.5'>
                    <div className='text-xs text-muted-foreground'>
                      查看次数
                    </div>
                    <div className='text-sm text-foreground'>
                      {currentShare.viewCount}
                      {currentShare.maxViewCount > 0 &&
                        ` / ${currentShare.maxViewCount}`}
                    </div>
                  </div>

                  <div className='space-y-1.5'>
                    <div className='text-xs text-muted-foreground'>
                      下载次数
                    </div>
                    <div className='text-sm text-foreground'>
                      {currentShare.downloadCount}
                      {currentShare.maxDownloadCount > 0 &&
                        ` / ${currentShare.maxDownloadCount}`}
                    </div>
                  </div>

                  <div className='space-y-1.5'>
                    <div className='text-xs text-muted-foreground'>
                      创建时间
                    </div>
                    <div className='text-sm text-foreground'>
                      {formatFileTime(currentShare.createdAt)}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>关闭</Button>
            </DialogClose>
            <Button onClick={handleCopyShareDetail}>
              {copiedShareDetail ? (
                <>
                  <Check className='mr-2 h-4 w-4' />
                  已复制
                </>
              ) : (
                <>
                  <Copy className='mr-2 h-4 w-4' />
                  复制分享
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 访问记录弹窗 */}
      <Dialog
        open={accessRecordsVisible}
        onOpenChange={setAccessRecordsVisible}
      >
        <DialogContent className='max-h-[85vh] max-w-5xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              访问记录 - {currentShareForRecords?.shareName || ''}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-6 px-6 pb-4'>
            {accessRecordsLoading ? (
              <div className='py-8 text-center text-sm text-muted-foreground'>
                加载中...
              </div>
            ) : accessRecords.length === 0 ? (
              <div className='py-8 text-center text-sm text-muted-foreground'>
                暂无访问记录
              </div>
            ) : (
              <div className='max-h-[60vh] overflow-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='font-medium text-muted-foreground'>
                        访问IP
                      </TableHead>
                      <TableHead className='font-medium text-muted-foreground'>
                        访问地址
                      </TableHead>
                      <TableHead className='font-medium text-muted-foreground'>
                        浏览器
                      </TableHead>
                      <TableHead className='font-medium text-muted-foreground'>
                        操作系统
                      </TableHead>
                      <TableHead className='font-medium text-muted-foreground'>
                        访问时间
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className='text-sm'>
                          {record.accessIp}
                        </TableCell>
                        <TableCell className='text-sm'>
                          {record.accessAddress || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant='secondary' className='text-xs'>
                            {record.browser || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline' className='text-xs'>
                            {record.os || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-sm text-muted-foreground'>
                          {formatFileTime(record.accessTime)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <AlertDialog
        open={deleteDialogVisible}
        onOpenChange={setDeleteDialogVisible}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认取消分享</AlertDialogTitle>
            <AlertDialogDescription>
              确定要取消分享 "{deletingShare?.shareName}" 吗？取消后将无法恢复！
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelShare}
              className='bg-destructive hover:bg-destructive/90'
            >
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 批量删除确认弹窗 */}
      <AlertDialog
        open={batchDeleteDialogVisible}
        onOpenChange={setBatchDeleteDialogVisible}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认批量取消</AlertDialogTitle>
            <AlertDialogDescription>
              确定要取消选中的 {selectedKeys.length}{' '}
              个分享吗？取消后将无法恢复！
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBatchCancel}
              className='bg-destructive hover:bg-destructive/90'
            >
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
