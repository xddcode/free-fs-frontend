import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { getUserStorageSettings, getStoragePlatforms } from '@/api/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AddConfigCard } from './components/AddConfigCard';
import { AddStorageModal } from './components/AddStorageModal';
import { StorageSettingCard } from './components/StorageSettingCard';

export default function StoragePage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);

  // 获取用户配置列表
  const { data: userSettings = [], isLoading, refetch } = useQuery({
    queryKey: ['userStorageSettings'],
    queryFn: getUserStorageSettings,
  });

  // 获取平台数量
  const { data: platforms = [] } = useQuery({
    queryKey: ['storagePlatforms'],
    queryFn: getStoragePlatforms,
  });

  // 过滤配置
  const filteredSettings = userSettings.filter((s) => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return (
      s.storagePlatform.name.toLowerCase().includes(keyword) ||
      s.storagePlatform.identifier.toLowerCase().includes(keyword) ||
      (s.remark || '').toLowerCase().includes(keyword)
    );
  });

  const enabledCount = userSettings.filter((s) => s.enabled === 1).length;

  return (
    <div className="p-5 bg-background min-h-screen">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-5 pb-4">
        <div className="flex items-center gap-4">
          <Database className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">存储平台管理</h2>
            <p className="text-sm text-muted-foreground">配置和管理您的对象存储平台</p>
          </div>
          <Input
            placeholder="搜索配置..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-60 ml-6"
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <Card className="p-6 border rounded-2xl">
          <div className="text-sm text-muted-foreground mb-2">已配置平台</div>
          <div className="text-3xl font-semibold">{userSettings.length} <span className="text-sm text-muted-foreground ml-1">个</span></div>
        </Card>
        <Card className="p-6 border rounded-2xl">
          <div className="text-sm text-muted-foreground mb-2">启用中</div>
          <div className="text-3xl font-semibold">{enabledCount} <span className="text-sm text-muted-foreground ml-1">个</span></div>
        </Card>
        <Card className="p-6 border rounded-2xl">
          <div className="text-sm text-muted-foreground mb-2">支持的平台</div>
          <div className="text-3xl font-semibold">{platforms.length} <span className="text-sm text-muted-foreground ml-1">种</span></div>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="p-6 border rounded-2xl mb-5">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-base font-semibold">我的存储配置</span>
          {userSettings.length === 0 && (
            <span className="px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              未配置
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : (
          <>
            {userSettings.length === 0 && (
              <Alert className="mb-5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  您还没有配置任何存储平台，点击下方卡片开始添加您的第一个存储配置
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-6 gap-4">
              {/* Add Config Card */}
              <div className="h-[280px]">
                <AddConfigCard onClick={() => setAddModalVisible(true)} />
              </div>

              {/* Storage Setting Cards */}
              {filteredSettings.map((setting) => (
                <div key={setting.id} className="h-[280px]">
                  <StorageSettingCard setting={setting} onRefresh={refetch} />
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Help Card */}
      <Card className="p-6 border rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5" />
          <span className="text-base font-semibold">使用指南</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>支持配置多个存储平台，如 MinIO、阿里云 OSS、腾讯云 COS 等</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>在此页面启用某个配置即可切换到该存储平台（同时只能有一个配置启用）</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>右上角显示当前启用的存储平台，点击切换按钮可快速返回本页面</span>
          </div>
        </div>
      </Card>

      {/* Add Storage Config Modal */}
      <AddStorageModal
        open={addModalVisible}
        onOpenChange={setAddModalVisible}
        onSuccess={refetch}
      />
    </div>
  );
}
