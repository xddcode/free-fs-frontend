/**
 * Home Page Component
 * 
 * Main dashboard page showing quick access, recent files, and storage overview
 */

import { useUserStore } from '@/stores';
import { 
  FolderOpen, 
  Clock, 
  Star, 
  Upload,
  FileText,
  Image,
  Video,
  Music,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const userState = useUserStore();

  // Mock data - in real app, this would come from API
  const quickStats = [
    { label: '全部文件', value: '1,234', icon: FolderOpen, color: 'text-blue-500' },
    { label: '最近使用', value: '56', icon: Clock, color: 'text-green-500' },
    { label: '星标文件', value: '23', icon: Star, color: 'text-yellow-500' },
    { label: '已上传', value: '45.8 GB', icon: Upload, color: 'text-purple-500' },
  ];

  const fileTypeStats = [
    { label: '文档', count: 456, icon: FileText, color: 'bg-blue-100 text-blue-600' },
    { label: '图片', count: 234, icon: Image, color: 'bg-green-100 text-green-600' },
    { label: '视频', count: 89, icon: Video, color: 'bg-purple-100 text-purple-600' },
    { label: '音频', count: 123, icon: Music, color: 'bg-orange-100 text-orange-600' },
  ];

  const recentFiles = [
    { id: 1, name: '项目文档.docx', size: '2.3 MB', modified: '2 小时前', type: 'document' },
    { id: 2, name: '设计稿.png', size: '5.1 MB', modified: '5 小时前', type: 'image' },
    { id: 3, name: '演示视频.mp4', size: '45.2 MB', modified: '1 天前', type: 'video' },
    { id: 4, name: '会议记录.pdf', size: '1.8 MB', modified: '2 天前', type: 'document' },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            欢迎回来，{userState.nickname || userState.username}
          </h1>
          <p className="text-muted-foreground mt-1">
            这是您的文件管理中心
          </p>
        </div>
        <Button size="lg" className="gap-2">
          <Upload className="h-5 w-5" />
          上传文件
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-10 w-10 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* File Type Distribution */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">文件类型分布</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {fileTypeStats.map((type) => (
            <div
              key={type.label}
              className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className={`p-2 rounded-lg ${type.color}`}>
                <type.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{type.label}</p>
                <p className="text-lg font-semibold">{type.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Files */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">最近使用</h2>
          </div>
          <Button variant="ghost" size="sm">
            查看全部
          </Button>
        </div>
        <div className="space-y-3">
          {recentFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {file.size} · {file.modified}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                打开
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
