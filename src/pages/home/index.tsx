import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';
import { getHomeInfo } from '@/api/home';
import { useAuth } from '@/contexts/auth-context';
import { formatFileSize, formatTime } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileIcon } from '@/components/file-icon';
import { AnimatedCircularProgressBar } from '@/components/ui/animated-circular-progress-bar';
import { toast } from 'sonner';

const MAX_STORAGE = 107374182400; // 100GB

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 使用 React Query 来管理数据获取
  const { data: homeInfo, isLoading: loading, refetch, isError } = useQuery({
    queryKey: ['homeInfo'],
    queryFn: getHomeInfo,
    staleTime: 30000,
    retry: 2,
  });

  const getTimeState = () => {
    const hours = new Date().getHours();
    if (hours < 6) return '凌晨好';
    if (hours < 9) return '早上好';
    if (hours < 12) return '上午好';
    if (hours < 14) return '中午好';
    if (hours < 18) return '下午好';
    if (hours < 22) return '晚上好';
    return '夜深了';
  };

  const usedStorage = homeInfo?.usedStorage || 0;
  const storagePercent = Math.min(100, Math.round((usedStorage / MAX_STORAGE) * 100));

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
  ];

  const handleUpload = () => {
    navigate('/files');
    toast.info('请在文件页面上传文件');
  };

  const handleFileClick = (file: any) => {
    if (file.isDir) {
      navigate(`/files?parentId=${file.id}`);
    } else {
      // 预览文件
      const previewUrl = `${import.meta.env.VITE_API_VIEW_URL}/preview/${file.id}`;
      window.open(previewUrl, '_blank');
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const keyword = formData.get('search') as string;
    if (keyword?.trim()) {
      // 跳转到文件页面，并传递搜索关键词
      navigate(`/files?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      // 如果搜索框为空，直接跳转到文件页面
      navigate('/files');
    }
  };

  // 骨架屏组件
  const QuickTilesSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-5 border-border/40">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="flex-1">
              <Skeleton className="h-3 w-14 mb-1.5" />
              <Skeleton className="h-7 w-10" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const RecentFilesSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2.5">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <Card key={i} className="p-3.5 border-border/40">
          <div className="flex items-start gap-2.5">
            <Skeleton className="w-11 h-11 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-3.5 w-28 mb-1.5" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="flex-1 p-4 pt-5 md:p-6 pb-10">
      <div className="max-w-[1300px] mx-auto">
        {/* Header */}
        <header className="mb-7">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-5">
            <div className="space-y-1.5">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                {getTimeState()}，{user?.nickname || user?.username || '管理员'}
              </h1>
              <p className="text-sm text-muted-foreground">欢迎回来，今天也要高效管理您的云端文件</p>
            </div>
            <div className="flex gap-2.5 items-center flex-wrap">
              <form onSubmit={handleSearch} className="relative flex-1 lg:flex-initial">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  name="search"
                  placeholder="搜索文件..."
                  className="w-full lg:w-[260px] pl-10 h-10 text-sm rounded-xl bg-background border-border/50 focus:border-primary/50 transition-colors shadow-sm"
                />
              </form>
              <Button onClick={handleUpload} size="default" className="rounded-xl h-10 px-4 text-sm shadow-sm hover:shadow-md transition-shadow">
                <Plus className="h-4 w-4 mr-1.5" />
                上传文件
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => refetch()}
                disabled={loading}
                className="rounded-xl h-10 w-10 shadow-sm hover:shadow-md transition-shadow"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
          {/* Main Column */}
          <div className="space-y-6">
            {/* Quick Tiles */}
            <section>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-1 h-5 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
                <h2 className="text-lg font-bold">快捷入口</h2>
              </div>
              {loading ? (
                <QuickTilesSkeleton />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {quickTiles.map((tile, index) => (
                    <Card
                      key={tile.label}
                      className="group relative overflow-hidden p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/40 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm"
                      onClick={tile.action}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 shadow-sm"
                          style={{ background: tile.bg }}
                        >
                          <tile.icon className={`h-6 w-6 ${tile.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-muted-foreground mb-0.5">{tile.label}</div>
                          <div className="text-2xl font-bold tracking-tight">{tile.count}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Files */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-1 h-5 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
                  <h2 className="text-lg font-bold">最近使用</h2>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/files')} 
                  className="h-auto px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-lg"
                >
                  查看全部 →
                </Button>
              </div>
              
              {loading ? (
                <RecentFilesSkeleton />
              ) : isError ? (
                <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-2 rounded-xl">
                  <div className="w-16 h-16 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <p className="text-base font-semibold mb-1.5">加载失败</p>
                  <p className="text-xs text-muted-foreground mb-5">请检查网络连接后重试</p>
                  <Button variant="outline" onClick={() => refetch()} className="rounded-lg text-sm h-9 shadow-sm">
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    重新加载
                  </Button>
                </Card>
              ) : homeInfo?.recentFiles && homeInfo.recentFiles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2.5">
                  {homeInfo.recentFiles.map((file: any, index: number) => (
                    <Card
                      key={file.id}
                      className="group p-3.5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30 border-border/40 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm rounded-xl"
                      onDoubleClick={() => handleFileClick(file)}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-11 h-11 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 group-hover:bg-muted/80 transition-all group-hover:scale-105 shadow-sm">
                          <FileIcon 
                            type={file.isDir ? 'folder' : file.suffix || 'default'} 
                            size={24}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate mb-1 group-hover:text-primary transition-colors" title={file.displayName}>
                            {file.displayName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {!file.isDir && `${formatFileSize(file.size)} · `}
                            {formatTime(file.lastAccessTime || file.updateTime)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-16 flex flex-col items-center justify-center text-center border-dashed border-2 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-5 shadow-sm">
                    <Clock className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-base font-semibold mb-1.5">暂无最近使用文件</p>
                  <p className="text-xs text-muted-foreground mb-6 max-w-sm leading-relaxed">
                    开始上传或访问文件后，这里会显示您的最近记录
                  </p>
                  <Button onClick={() => navigate('/files')} className="rounded-lg text-sm h-9 shadow-sm">
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    前往文件管理
                  </Button>
                </Card>
              )}
            </section>
          </div>

          {/* Side Column */}
          <div className="space-y-4">
            {/* Storage Widget */}
            <Card className="p-5 border-border/40 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm overflow-hidden relative rounded-xl shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
              
              <h3 className="text-base font-bold mb-5 relative flex items-center gap-2">
                <div className="w-0.5 h-4 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
                存储概览
              </h3>
              
              {loading ? (
                <div className="space-y-4">
                  <div className="flex justify-center py-4">
                    <Skeleton className="w-28 h-28 rounded-full" />
                  </div>
                  <div className="space-y-2.5">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              ) : (
                <>
                  <div className="flex justify-center py-4 relative">
                    <div className="relative">
                      <AnimatedCircularProgressBar
                        value={storagePercent}
                        gaugePrimaryColor="rgb(99 102 241)"
                        gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
                        className="size-32"
                        showValue={false}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold bg-gradient-to-br from-purple-500 via-blue-500 to-blue-600 bg-clip-text text-transparent mb-0.5">
                          {storagePercent}%
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">已使用</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-5 relative">
                    <div className="flex items-center gap-2.5 text-xs p-3 rounded-lg bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 border border-border/30 shadow-sm">
                      <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 shadow-sm"></div>
                      <span className="flex-1 font-medium text-muted-foreground">已使用</span>
                      <span className="font-bold">{formatFileSize(usedStorage)}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs p-3 rounded-lg bg-muted/30 border border-border/30 shadow-sm">
                      <div className="w-2.5 h-2.5 rounded-full bg-muted border-2 border-border"></div>
                      <span className="flex-1 font-medium text-muted-foreground">总容量</span>
                      <span className="font-bold">{formatFileSize(MAX_STORAGE)}</span>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full rounded-lg h-9 text-sm font-semibold shadow-sm hover:shadow-md transition-all"
                    onClick={() => navigate('/storage')}
                  >
                    管理存储空间
                  </Button>
                </>
              )}
            </Card>

            {/* Feature Widget */}
            <Card className="p-5 border-border/40 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm rounded-xl shadow-sm">
              <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                <div className="w-0.5 h-4 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
                功能特性
              </h3>
              <div className="space-y-2.5">
                <div className="group flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50/80 to-blue-50/40 dark:from-blue-950/30 dark:to-blue-950/10 transition-all hover:shadow-md cursor-pointer border border-blue-100/50 dark:border-blue-900/30">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold mb-0.5">数据加密</div>
                    <div className="text-sm text-muted-foreground">多重备份，金融级安全</div>
                  </div>
                </div>
                <div className="group flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50/80 to-green-50/40 dark:from-green-950/30 dark:to-green-950/10 transition-all hover:shadow-md cursor-pointer border border-green-100/50 dark:border-green-900/30">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold mb-0.5">极速传输</div>
                    <div className="text-sm text-muted-foreground">上传下载不限速</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* OSS Widget */}
            <Card className="p-5 border-border/40 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm rounded-xl shadow-sm">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                <div className="w-0.5 h-4 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
                开源项目
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Free Fs 是一款基于 SpringBoot 和 React 构建的开源文件管理系统，欢迎大家交流学习。
              </p>
              <div className="space-y-2">
                <a
                  href="https://gitee.com/dromara/free-fs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-950/40 dark:to-red-950/20 text-red-600 dark:text-red-400 hover:shadow-md transition-all text-sm font-semibold group border border-red-100/50 dark:border-red-900/30"
                >
                  <LinkIcon className="h-3.5 w-3.5 flex-shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                  <span>Gitee 仓库</span>
                </a>
                <a
                  href="https://github.com/dromara/free-fs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-muted/50 hover:bg-muted hover:shadow-md transition-all text-sm font-semibold group border border-border/30"
                >
                  <Code className="h-3.5 w-3.5 flex-shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                  <span>GitHub 仓库</span>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
