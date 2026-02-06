import { useState, useEffect } from 'react'
import type { FileItem } from '@/types/file'
import type { ShareThin } from '@/types/share'
import {
  Clock,
  Lock,
  RefreshCw,
  XCircle,
  FileText,
  List,
  LayoutGrid,
  Share2,
} from 'lucide-react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  getShareDetail,
  validateShareCode,
  getShareItemList,
} from '@/api/share'
import { getToken } from '@/utils/auth'
import { getAvatarFallback } from '@/utils/avatar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { FileIcon } from '@/components/file-icon'
import { ShareFileListView, ShareFileGridView } from './components'

type ViewMode = 'list' | 'grid'

interface BreadcrumbItem {
  name: string
  id: string
}

export default function SharePage() {
  const { shareToken } = useParams<{ shareToken: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [shareData, setShareData] = useState<ShareThin>({
    id: '',
    shareName: '',
    expireTime: '',
    hasCheckCode: false,
    isExpire: false,
  })
  const [fileList, setFileList] = useState<FileItem[]>([])
  const [bodyLoading, setBodyLoading] = useState(false)
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>(
    (searchParams.get('viewMode') as ViewMode) || 'list'
  )

  const parentId = searchParams.get('parentId') || undefined

  // 验证提取码
  const handleVerify = async () => {
    if (!accessCode.trim()) {
      toast.warning('请输入提取码')
      return
    }
    setVerifying(true)
    try {
      const result = await validateShareCode({
        shareId: shareToken!,
        shareCode: accessCode,
      })
      if (result) {
        setIsVerified(true)
        const params = new URLSearchParams(searchParams)
        params.set('shareCode', accessCode)
        navigate(`/s/${shareToken}?${params.toString()}`, { replace: true })
      } else {
        toast.error('提取码错误')
      }
    } finally {
      setVerifying(false)
    }
  }

  // 获取分享信息
  const fetchShare = async () => {
    setIsLoading(true)
    setHasError(false)
    setErrorMessage('')

    try {
      const data = await getShareDetail(shareToken!)
      setShareData(data)

      if (data.isExpire) {
        setIsLoading(false)
        return
      }

      if (!data.hasCheckCode) {
        setIsVerified(true)
      } else {
        const urlCode = searchParams.get('shareCode')
        if (urlCode) {
          setAccessCode(urlCode)
          handleVerify()
        }
      }
    } catch (error: any) {
      setHasError(true)
      if (
        error.message?.includes('Network Error') ||
        error.code === 'ERR_NETWORK'
      ) {
        setErrorMessage('网络连接失败，请检查网络')
      } else if (error.response?.status === 404) {
        setErrorMessage('分享不存在或已被删除')
      } else if (error.response?.status >= 500) {
        setErrorMessage('服务器错误，请稍后重试')
      } else {
        setErrorMessage(error.message || '获取分享信息失败')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 获取分享文件列表
  const fetchShareFile = async () => {
    if (!isVerified) return
    setBodyLoading(true)
    try {
      const data = await getShareItemList(shareToken!, parentId)
      setFileList(data)
    } finally {
      setBodyLoading(false)
    }
  }

  // 处理文件点击
  const handleFileClick = (file: FileItem) => {
    if (file.isDir) {
      setBreadcrumbs([...breadcrumbs, { name: file.originalName, id: file.id }])
      const params = new URLSearchParams(searchParams)
      params.set('parentId', file.id)
      params.set('viewMode', viewMode)
      navigate(`/s/${shareToken}?${params.toString()}`)
    }
  }

  // 处理面包屑导航
  const handleBreadcrumb = (index: number) => {
    const params = new URLSearchParams(searchParams)
    if (index === -1) {
      setBreadcrumbs([])
      params.delete('parentId')
    } else {
      const target = breadcrumbs[index]
      setBreadcrumbs(breadcrumbs.slice(0, index + 1))
      params.set('parentId', target.id)
    }
    navigate(`/s/${shareToken}?${params.toString()}`)
  }

  // 格式化到期时间
  const formatExpireTime = (expireTime: string | null) => {
    if (!expireTime) return '永久有效'

    const expireDate = new Date(expireTime)
    const now = new Date()
    const diffTime = expireDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return '已过期'
    if (diffDays === 0) return '今天到期'
    if (diffDays === 1) return '明天到期'
    if (diffDays <= 7) return `${diffDays}天后到期`

    const year = expireDate.getFullYear()
    const month = String(expireDate.getMonth() + 1).padStart(2, '0')
    const day = String(expireDate.getDate()).padStart(2, '0')
    return `${year}/${month}/${day} 到期`
  }

  // 处理预览
  const handlePreview = (file: FileItem) => {
    window.open(
      `${import.meta.env.VITE_API_BASE_URL}/preview/${file.id}`,
      '_blank'
    )
  }

  // 处理下载
  const handleDownload = (file: FileItem) => {
    try {
      const token = getToken()
      // 构建下载链接，将 token 放到 URL 参数中（需要包含 Bearer 前缀）
      const downloadUrl = `${import.meta.env.VITE_API_BASE_URL}/apis/share/${shareToken}/download/${file.id}?Authorization=Bearer ${token}`

      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = file.originalName
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('开始下载文件')
    } catch (error) {
      toast.error('下载失败，请稍后重试')
    }
  }

  useEffect(() => {
    if (shareToken) {
      fetchShare()
    }
  }, [shareToken])

  useEffect(() => {
    if (isVerified) {
      fetchShareFile()
      if (!parentId) {
        setBreadcrumbs([])
      }
    }
  }, [isVerified, parentId])

  // 加载中状态
  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-gray-50'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary'></div>
          <p className='text-muted-foreground'>正在获取分享信息...</p>
        </div>
      </div>
    )
  }

  // 错误状态
  if (hasError) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-gray-50 p-4'>
        <div className='w-full max-w-md rounded-2xl bg-white p-12 text-center shadow-lg'>
          <XCircle className='mx-auto mb-6 h-20 w-20 text-destructive opacity-80' />
          <h2 className='mb-3 text-2xl font-semibold'>{errorMessage}</h2>
          <p className='mb-6 text-muted-foreground'>
            无法获取分享信息，请稍后重试
          </p>
          <Button onClick={fetchShare}>
            <RefreshCw className='mr-2 h-4 w-4' />
            重新加载
          </Button>
        </div>
      </div>
    )
  }

  // 已过期状态
  if (shareData.isExpire) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-gray-50 p-4'>
        <div className='w-full max-w-md rounded-2xl bg-white p-12 text-center shadow-lg'>
          <Clock className='mx-auto mb-6 h-20 w-20 text-muted-foreground opacity-60' />
          <h2 className='mb-3 text-2xl font-semibold'>分享已过期</h2>
          <p className='mb-6 text-muted-foreground'>
            该分享链接已过期，无法访问
          </p>
          <div className='space-y-3 rounded-lg bg-muted p-5'>
            <div className='flex items-center justify-center gap-2 text-sm'>
              <Share2 className='h-4 w-4' />
              <span>{shareData.shareName}</span>
            </div>
            {shareData.expireTime && (
              <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
                <Clock className='h-4 w-4' />
                <span>过期时间：{shareData.expireTime}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 需要验证码状态
  if (!isVerified) {
    const avatarFallback = getAvatarFallback(shareData.shareName || 'Free-fs')

    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-gray-50 p-4'>
        <div className='w-full max-w-md rounded-2xl bg-white p-10 shadow-lg'>
          <div className='mb-8 text-center'>
            <Avatar className='mx-auto mb-4 h-16 w-16'>
              <AvatarFallback className='bg-sidebar-accent text-xl font-semibold text-sidebar-accent-foreground'>
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <h2 className='mb-2 text-xl font-semibold'>
              {shareData.shareName || 'Free-fs'} 的文件分享
            </h2>
            <p className='text-muted-foreground'>需要提取码才能访问</p>
          </div>
          <div className='space-y-4'>
            <div className='relative'>
              <Lock className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                type='text'
                placeholder='请输入提取码'
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                className='pl-10'
              />
            </div>
            <Button
              className='w-full'
              onClick={handleVerify}
              disabled={verifying}
            >
              {verifying ? '验证中...' : '查看文件'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 文件浏览状态
  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-gray-50 p-4'>
      <div
        className='flex w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-lg'
        style={{ maxHeight: '85vh', minHeight: '500px' }}
      >
        {/* 头部 */}
        <div className='flex items-center justify-between border-b bg-muted/30 px-8 py-6'>
          <div className='flex items-center gap-3'>
            <div className='rounded-xl bg-primary/10 p-3'>
              <Share2 className='h-8 w-8 text-primary' />
            </div>
            <div>
              <div className='text-lg font-semibold'>{shareData.shareName}</div>
              <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                <span>{shareData.fileCount ?? 1} 个文件</span>
                {shareData.expireTime && (
                  <span className='flex items-center gap-1 rounded bg-muted px-2 py-0.5'>
                    <Clock className='h-3.5 w-3.5' />
                    {formatExpireTime(shareData.expireTime)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 面包屑导航 */}
        <div className='border-b bg-white px-8 py-3'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => handleBreadcrumb(-1)}
                  className='flex cursor-pointer items-center gap-1.5'
                >
                  <FileIcon type='folder' size={16} />
                  根目录
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbs.map((item, index) => (
                <>
                  <BreadcrumbSeparator key={`sep-${index}`} />
                  <BreadcrumbItem key={item.id}>
                    <BreadcrumbLink
                      onClick={() => handleBreadcrumb(index)}
                      className='cursor-pointer'
                    >
                      {item.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* 工具栏 */}
        <div className='flex items-center justify-between border-b px-8 py-3'>
          <span className='text-sm text-muted-foreground'>
            共 {fileList.length} 个文件
          </span>
          <div className='flex items-center gap-2'>
            <ToggleGroup
              type='single'
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as ViewMode)}
            >
              <ToggleGroupItem value='list' aria-label='列表视图' size='sm'>
                <List className='h-4 w-4' />
              </ToggleGroupItem>
              <ToggleGroupItem value='grid' aria-label='网格视图' size='sm'>
                <LayoutGrid className='h-4 w-4' />
              </ToggleGroupItem>
            </ToggleGroup>
            <Button variant='outline' size='sm' onClick={fetchShareFile}>
              <RefreshCw className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* 文件列表 */}
        <div className='flex-1 overflow-auto p-4'>
          {bodyLoading ? (
            <div className='flex h-full items-center justify-center'>
              <div className='text-center'>
                <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary'></div>
                <p className='text-muted-foreground'>加载中...</p>
              </div>
            </div>
          ) : fileList.length === 0 ? (
            <div className='flex h-full items-center justify-center'>
              <div className='text-center'>
                <FileText className='mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50' />
                <p className='text-muted-foreground'>暂无文件</p>
              </div>
            </div>
          ) : viewMode === 'list' ? (
            <ShareFileListView
              fileList={fileList}
              scope={shareData.scope}
              onFileClick={handleFileClick}
              onPreview={handlePreview}
              onDownload={handleDownload}
            />
          ) : (
            <ShareFileGridView
              fileList={fileList}
              scope={shareData.scope}
              onFileClick={handleFileClick}
              onPreview={handlePreview}
              onDownload={handleDownload}
            />
          )}
        </div>

        {/* 底部 */}
        <div className='border-t bg-muted/20 px-8 py-3 text-center text-xs text-muted-foreground'>
          已加载全部内容
        </div>
      </div>
    </div>
  )
}
