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
  MoreHorizontal,
} from 'lucide-react';
import { getHomeInfo } from '@/api/home';
import { useAuth } from '@/contexts/auth-context';
import { formatFileSize } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const MAX_STORAGE = 107374182400; // 100GB

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 使用 React Query 来管理数据获取
  const { data: homeInfo, isLoading: loading, refetch } = useQuery({
    queryKey: ['homeInfo'],
    queryFn: getHomeInfo,
    staleTime: 30000,
  });

  const getTimeState = () => {
    const hours = new Date().getHours();
    if (hours < 12) return '早上好';
    if (hours < 18) return '下午好';
    return '晚上好';
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    return date.toLocaleDateString('zh-CN');
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
    toast.info('请在文件页面上传文件');
  };

  const handleFileDoubleClick = (file: any) => {
    if (file.isDir) {
      navigate('/files');
    } else {
      window.open(`${import.meta.env.VITE_API_VIEW_URL}/preview/${file.id}`, '_blank');
    }
  };

  const getFileIcon = (file: any) => {
    if (file.isDir) return '📁';
    const ext = file.suffix?.toLowerCase();
    const iconMap: Record<string, string> = {
      pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
      ppt: '📊', pptx: '📊', jpg: '🖼️', jpeg: '🖼️', png: '🖼️',
      gif: '🖼️', mp4: '🎬', mp3: '🎵', zip: '📦', rar: '�',
    };
    return iconMap[ext] || '📄';
  };

  return (
    <div className="max-w-[1400px] mx-auto p-8 bg-background min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            {getTimeState()}，{user?.nickname || user?.username || '管理员'}
          </h1>
          <p className="text-muted-foreground">欢迎回来，今天也要高效管理您的云端文件。</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索您的云端文件..."
              className="w-[300px] pl-10 rounded-full bg-muted border-transparent"
            />
          </div>
          <Button onClick={handleUpload} className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            快速上传
          </Button>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-[1fr_320px] gap-8">
        {/* Main Column */}
        <div>
          {/* Quick Tiles */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-5">快捷入口</h2>
            <div className="grid grid-cols-4 gap-5">
              {quickTiles.map((tile) => (
                <Card
                  key={tile.label}
                  className="p-5 flex items-center gap-4 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg border"
                  onClick={tile.action}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: tile.bg }}
                  >
                    <tile.icon className={`h-6 w-6 ${tile.color}`} />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{tile.label}</div>
                    <div className="text-xl font-semibold">{tile.count}</div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Recent Files */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">最近使用</h2>
              <Button variant="link" onClick={() => navigate('/files')}>
                查看全部
              </Button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : homeInfo?.recentFiles && homeInfo.recentFiles.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                {homeInfo.recentFiles.map((file: any) => (
                  <Card
                    key={file.id}
                    className="p-3 flex items-center gap-3 cursor-pointer transition-all hover:bg-muted border group"
                    onDoubleClick={() => handleFileDoubleClick(file)}
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-2xl">
                      {getFileIcon(file)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{file.displayName}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} · {formatTime(file.lastAccessTime || file.updateTime)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <p>暂无最近使用文件</p>
              </div>
            )}
          </section>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          {/* Storage Widget */}
          <Card className="p-6 border rounded-2xl">
            <h3 className="text-base font-semibold mb-5">存储概览</h3>
            <div className="flex justify-center py-5">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="10"
                    strokeDasharray={`${(storagePercent / 100) * 351.86} 351.86`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a87ffb" />
                      <stop offset="100%" stopColor="#2a6fe8" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-semibold">{storagePercent}%</span>
                  <span className="text-xs text-muted-foreground">已使用</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 my-5">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span className="flex-1 text-muted-foreground">已使用</span>
                <span className="font-medium">{formatFileSize(usedStorage)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-muted"></span>
                <span className="flex-1 text-muted-foreground">总容量</span>
                <span className="font-medium">{formatFileSize(MAX_STORAGE)}</span>
              </div>
            </div>
            <Button
              variant="secondary"
              className="w-full rounded-lg font-medium"
              onClick={() => navigate('/storage')}
            >
              管理存储空间
            </Button>
          </Card>

          {/* Feature Widget */}
          <Card className="p-6 border rounded-2xl">
            <h3 className="text-base font-semibold mb-5">功能特性</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">数据加密</div>
                  <div className="text-xs text-muted-foreground">多重备份，金融级安全</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">极速传输</div>
                  <div className="text-xs text-muted-foreground">上传下载不限速</div>
                </div>
              </div>
            </div>
          </Card>

          {/* OSS Widget */}
          <Card className="p-6 border rounded-2xl">
            <h3 className="text-base font-semibold mb-5">开源项目</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Free Fs 是一款基于 SpringBoot 和 Vue3 构建的开源文件管理系统，欢迎大家交流学习。
            </p>
            <div className="space-y-2">
              <a
                href="https://gitee.com/dromara/free-fs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-colors text-sm font-medium"
              >
                <LinkIcon className="h-4 w-4" />
                <span>Gitee 仓库</span>
              </a>
              <a
                href="https://github.com/dromara/free-fs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                <Code className="h-4 w-4" />
                <span>GitHub 仓库</span>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
