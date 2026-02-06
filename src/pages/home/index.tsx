import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import {
  File,
  Folder,
  Share2,
  Star,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Zap,
  Code,
  Link as LinkIcon,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getHomeInfo } from '@/api/home'
import { formatFileSize, formatTime } from '@/utils/format'
import { AnimatedCircularProgressBar } from '@/components/ui/animated-circular-progress-bar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { FileIcon } from '@/components/file-icon'

const MAX_STORAGE = 107374182400 // 100GB

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // 使用 React Query 来管理数据获取
  const {
    data: homeInfo,
    isLoading: loading,
    refetch,
    isError,
  } = useQuery({
    queryKey: ['homeInfo'],
    queryFn: getHomeInfo,
    staleTime: 30000,
    retry: 2,
  })

  const getTimeState = () => {
    const hours = new Date().getHours()
    if (hours < 6) return '凌晨好'
    if (hours < 9) return '早上好'
    if (hours < 12) return '上午好'
    if (hours < 14) return '中午好'
    if (hours < 18) return '下午好'
    if (hours < 22) return '晚上好'
    return '夜深了'
  }

  const usedStorage = homeInfo?.usedStorage || 0
  const storagePercent = Math.min(
    100,
    Math.round((usedStorage / MAX_STORAGE) * 100)
  )

  const quickTiles = [
    {
      label: '全部文件',
      count: homeInfo?.fileCount || 0,
      icon: File,
      bg: 'rgba(42, 111, 232, 0.1)',
      color: 'text-blue-600',
      action: () => navigate('/files'),
    },
    {
      label: '收藏夹',
      count: homeInfo?.favoriteCount || 0,
      icon: Star,
      bg: 'rgba(255, 125, 0, 0.1)',
      color: 'text-orange-600',
      action: () => navigate('/files?view=favorites'),
    },
    {
      label: '我的分享',
      count: homeInfo?.shareCount || 0,
      icon: Share2,
      bg: 'rgba(0, 180, 42, 0.1)',
      color: 'text-green-600',
      action: () => navigate('/files?view=shares'),
    },
    {
      label: '文件夹',
      count: homeInfo?.directoryCount || 0,
      icon: Folder,
      bg: 'rgba(168, 127, 251, 0.1)',
      color: 'text-purple-600',
      action: () => navigate('/files?isDir=true'),
    },
  ]

  const handleUpload = () => {
    navigate('/files')
    toast.info('请在文件页面上传文件')
  }

  const handleFileClick = (file: any) => {
    if (file.isDir) {
      navigate(`/files?parentId=${file.id}`)
    } else {
      // 预览文件
      const previewUrl = `${import.meta.env.VITE_API_VIEW_URL}/preview/${file.id}`
      window.open(previewUrl, '_blank')
    }
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const keyword = formData.get('search') as string
    if (keyword?.trim()) {
      // 跳转到文件页面，并传递搜索关键词
      navigate(`/files?keyword=${encodeURIComponent(keyword.trim())}`)
    } else {
      // 如果搜索框为空，直接跳转到文件页面
      navigate('/files')
    }
  }

  // 骨架屏组件
  const QuickTilesSkeleton = () => (
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className='border-border/40 p-5'>
          <div className='flex items-center gap-4'>
            <Skeleton className='h-12 w-12 rounded-xl' />
            <div className='flex-1'>
              <Skeleton className='mb-1.5 h-3 w-14' />
              <Skeleton className='h-7 w-10' />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  const RecentFilesSkeleton = () => (
    <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <Card key={i} className='border-border/40 p-3.5'>
          <div className='flex items-start gap-2.5'>
            <Skeleton className='h-11 w-11 rounded-lg' />
            <div className='flex-1'>
              <Skeleton className='mb-1.5 h-3.5 w-28' />
              <Skeleton className='h-3 w-20' />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  return (
    <div className='flex-1 p-4 pt-5 pb-10 md:p-6'>
      <div className='mx-auto max-w-[1300px]'>
        {/* Header */}
        <header className='mb-7'>
          <div className='flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
            <div className='space-y-1.5'>
              <h1 className='bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-3xl font-bold text-transparent lg:text-4xl'>
                {getTimeState()}，{user?.nickname || user?.username || '管理员'}
              </h1>
              <p className='text-sm text-muted-foreground'>
                欢迎回来，今天也要高效管理您的云端文件
              </p>
            </div>
            <div className='flex flex-wrap items-center gap-2.5'>
              <form
                onSubmit={handleSearch}
                className='relative flex-1 lg:flex-initial'
              >
                <Search className='pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  name='search'
                  placeholder='搜索文件...'
                  className='h-10 w-full rounded-xl border-border/50 bg-background pl-10 text-sm shadow-sm transition-colors focus:border-primary/50 lg:w-[260px]'
                />
              </form>
              <Button
                onClick={handleUpload}
                size='default'
                className='h-10 rounded-xl px-4 text-sm shadow-sm transition-shadow hover:shadow-md'
              >
                <Plus className='mr-1.5 h-4 w-4' />
                上传文件
              </Button>
              <Button
                variant='outline'
                size='icon'
                onClick={() => refetch()}
                disabled={loading}
                className='h-10 w-10 rounded-xl shadow-sm transition-shadow hover:shadow-md'
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
          </div>
        </header>

        <div className='grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]'>
          {/* Main Column */}
          <div className='space-y-6'>
            {/* Quick Tiles */}
            <section>
              <div className='mb-4 flex items-center gap-2.5'>
                <div className='h-5 w-1 rounded-full bg-gradient-to-b from-primary to-primary/50'></div>
                <h2 className='text-lg font-bold'>快捷入口</h2>
              </div>
              {loading ? (
                <QuickTilesSkeleton />
              ) : (
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                  {quickTiles.map((tile, index) => (
                    <Card
                      key={tile.label}
                      className='group relative cursor-pointer overflow-hidden border-border/40 bg-gradient-to-br from-card to-card/50 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'
                      onClick={tile.action}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
                      <div className='absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-gradient-to-br from-primary/10 to-transparent opacity-0 blur-2xl transition-opacity group-hover:opacity-100'></div>
                      <div className='relative flex items-center gap-4'>
                        <div
                          className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl shadow-sm transition-all duration-300 group-hover:scale-110'
                          style={{ background: tile.bg }}
                        >
                          <tile.icon className={`h-6 w-6 ${tile.color}`} />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <div className='mb-0.5 text-xs text-muted-foreground'>
                            {tile.label}
                          </div>
                          <div className='text-2xl font-bold tracking-tight'>
                            {tile.count}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Files */}
            <section>
              <div className='mb-4 flex items-center justify-between'>
                <div className='flex items-center gap-2.5'>
                  <div className='h-5 w-1 rounded-full bg-gradient-to-b from-primary to-primary/50'></div>
                  <h2 className='text-lg font-bold'>最近使用</h2>
                </div>
                <Button
                  variant='ghost'
                  onClick={() => navigate('/files')}
                  className='h-auto rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground'
                >
                  查看全部 →
                </Button>
              </div>

              {loading ? (
                <RecentFilesSkeleton />
              ) : isError ? (
                <Card className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center'>
                  <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-destructive/10'>
                    <AlertCircle className='h-8 w-8 text-destructive' />
                  </div>
                  <p className='mb-1.5 text-base font-semibold'>加载失败</p>
                  <p className='mb-5 text-xs text-muted-foreground'>
                    请检查网络连接后重试
                  </p>
                  <Button
                    variant='outline'
                    onClick={() => refetch()}
                    className='h-9 rounded-lg text-sm shadow-sm'
                  >
                    <RefreshCw className='mr-1.5 h-3.5 w-3.5' />
                    重新加载
                  </Button>
                </Card>
              ) : homeInfo?.recentFiles && homeInfo.recentFiles.length > 0 ? (
                <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'>
                  {homeInfo.recentFiles.map((file: any, index: number) => (
                    <Card
                      key={file.id}
                      className='group cursor-pointer rounded-xl border-border/40 bg-gradient-to-br from-card to-card/50 p-3.5 backdrop-blur-sm transition-all duration-200 hover:border-primary/30 hover:shadow-lg'
                      onDoubleClick={() => handleFileClick(file)}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className='flex items-start gap-2.5'>
                        <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-muted/50 shadow-sm transition-all group-hover:scale-105 group-hover:bg-muted/80'>
                          <FileIcon
                            type={
                              file.isDir ? 'folder' : file.suffix || 'default'
                            }
                            size={24}
                          />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <div
                            className='mb-1 truncate text-sm font-medium transition-colors group-hover:text-primary'
                            title={file.displayName}
                          >
                            {file.displayName}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {!file.isDir && `${formatFileSize(file.size)} · `}
                            {formatTime(file.lastAccessTime || file.updateTime)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-gradient-to-br from-muted/30 to-muted/10 p-16 text-center'>
                  <div className='mb-5 flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 shadow-sm'>
                    <Clock className='h-10 w-10 text-muted-foreground' />
                  </div>
                  <p className='mb-1.5 text-base font-semibold'>
                    暂无最近使用文件
                  </p>
                  <p className='mb-6 max-w-sm text-xs leading-relaxed text-muted-foreground'>
                    开始上传或访问文件后，这里会显示您的最近记录
                  </p>
                  <Button
                    onClick={() => navigate('/files')}
                    className='h-9 rounded-lg text-sm shadow-sm'
                  >
                    <Plus className='mr-1.5 h-3.5 w-3.5' />
                    前往文件管理
                  </Button>
                </Card>
              )}
            </section>
          </div>

          {/* Side Column */}
          <div className='space-y-4'>
            {/* Storage Widget */}
            <Card className='relative overflow-hidden rounded-xl border-border/40 bg-gradient-to-br from-card via-card to-card/50 p-5 shadow-sm backdrop-blur-sm'>
              <div className='absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl'></div>
              <div className='absolute bottom-0 left-0 h-24 w-24 rounded-full bg-gradient-to-tr from-purple-500/10 to-transparent blur-3xl'></div>

              <h3 className='relative mb-5 flex items-center gap-2 text-base font-bold'>
                <div className='h-4 w-0.5 rounded-full bg-gradient-to-b from-primary to-primary/50'></div>
                存储概览
              </h3>

              {loading ? (
                <div className='space-y-4'>
                  <div className='flex justify-center py-4'>
                    <Skeleton className='h-28 w-28 rounded-full' />
                  </div>
                  <div className='space-y-2.5'>
                    <Skeleton className='h-10 w-full rounded-lg' />
                    <Skeleton className='h-10 w-full rounded-lg' />
                  </div>
                  <Skeleton className='h-9 w-full rounded-lg' />
                </div>
              ) : (
                <>
                  <div className='relative flex justify-center py-4'>
                    <div className='relative'>
                      <AnimatedCircularProgressBar
                        value={storagePercent}
                        gaugePrimaryColor='rgb(99 102 241)'
                        gaugeSecondaryColor='rgba(0, 0, 0, 0.1)'
                        className='size-32'
                        showValue={false}
                      />
                      <div className='absolute inset-0 flex flex-col items-center justify-center'>
                        <span className='mb-0.5 bg-gradient-to-br from-purple-500 via-blue-500 to-blue-600 bg-clip-text text-3xl font-bold text-transparent'>
                          {storagePercent}%
                        </span>
                        <span className='text-[10px] font-medium text-muted-foreground'>
                          已使用
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='relative mb-5 space-y-2'>
                    <div className='flex items-center gap-2.5 rounded-lg border border-border/30 bg-gradient-to-r from-purple-50/50 to-blue-50/50 p-3 text-xs shadow-sm dark:from-purple-950/20 dark:to-blue-950/20'>
                      <div className='h-2.5 w-2.5 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 shadow-sm'></div>
                      <span className='flex-1 font-medium text-muted-foreground'>
                        已使用
                      </span>
                      <span className='font-bold'>
                        {formatFileSize(usedStorage)}
                      </span>
                    </div>
                    <div className='flex items-center gap-2.5 rounded-lg border border-border/30 bg-muted/30 p-3 text-xs shadow-sm'>
                      <div className='h-2.5 w-2.5 rounded-full border-2 border-border bg-muted'></div>
                      <span className='flex-1 font-medium text-muted-foreground'>
                        总容量
                      </span>
                      <span className='font-bold'>
                        {formatFileSize(MAX_STORAGE)}
                      </span>
                    </div>
                  </div>

                  <Button
                    className='h-9 w-full rounded-lg text-sm font-semibold shadow-sm transition-all hover:shadow-md'
                    onClick={() => navigate('/storage')}
                  >
                    管理存储空间
                  </Button>
                </>
              )}
            </Card>

            {/* Feature Widget */}
            <Card className='rounded-xl border-border/40 bg-gradient-to-br from-card to-card/50 p-5 shadow-sm backdrop-blur-sm'>
              <h3 className='mb-4 flex items-center gap-2 text-base font-bold'>
                <div className='h-4 w-0.5 rounded-full bg-gradient-to-b from-primary to-primary/50'></div>
                功能特性
              </h3>
              <div className='space-y-2.5'>
                <div className='group flex cursor-pointer items-center gap-3 rounded-lg border border-blue-100/50 bg-gradient-to-r from-blue-50/80 to-blue-50/40 p-3 transition-all hover:shadow-md dark:border-blue-900/30 dark:from-blue-950/30 dark:to-blue-950/10'>
                  <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md transition-transform group-hover:scale-110'>
                    <Shield className='h-5 w-5 text-white' />
                  </div>
                  <div className='min-w-0'>
                    <div className='mb-0.5 text-sm font-bold'>数据加密</div>
                    <div className='text-sm text-muted-foreground'>
                      多重备份，金融级安全
                    </div>
                  </div>
                </div>
                <div className='group flex cursor-pointer items-center gap-3 rounded-lg border border-green-100/50 bg-gradient-to-r from-green-50/80 to-green-50/40 p-3 transition-all hover:shadow-md dark:border-green-900/30 dark:from-green-950/30 dark:to-green-950/10'>
                  <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-md transition-transform group-hover:scale-110'>
                    <Zap className='h-5 w-5 text-white' />
                  </div>
                  <div className='min-w-0'>
                    <div className='mb-0.5 text-sm font-bold'>极速传输</div>
                    <div className='text-sm text-muted-foreground'>
                      上传下载不限速
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* OSS Widget */}
            <Card className='rounded-xl border-border/40 bg-gradient-to-br from-card to-card/50 p-5 shadow-sm backdrop-blur-sm'>
              <h3 className='mb-3 flex items-center gap-2 text-base font-bold'>
                <div className='h-4 w-0.5 rounded-full bg-gradient-to-b from-primary to-primary/50'></div>
                开源项目
              </h3>
              <p className='mb-4 text-sm leading-relaxed text-muted-foreground'>
                Free Fs 是一款基于 SpringBoot 和 React
                构建的开源文件管理系统，欢迎大家交流学习。
              </p>
              <div className='space-y-2'>
                <a
                  href='https://gitee.com/dromara/free-fs'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='group flex items-center gap-2.5 rounded-lg border border-red-100/50 bg-gradient-to-r from-red-50 to-red-50/50 px-3.5 py-2.5 text-sm font-semibold text-red-600 transition-all hover:shadow-md dark:border-red-900/30 dark:from-red-950/40 dark:to-red-950/20 dark:text-red-400'
                >
                  <LinkIcon className='h-3.5 w-3.5 flex-shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-12' />
                  <span>Gitee 仓库</span>
                </a>
                <a
                  href='https://github.com/dromara/free-fs'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='group flex items-center gap-2.5 rounded-lg border border-border/30 bg-muted/50 px-3.5 py-2.5 text-sm font-semibold transition-all hover:bg-muted hover:shadow-md'
                >
                  <Code className='h-3.5 w-3.5 flex-shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-12' />
                  <span>GitHub 仓库</span>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
