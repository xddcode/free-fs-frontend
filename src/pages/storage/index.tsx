import { type ChangeEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Plus, SlidersHorizontal, ArrowUpAZ, ArrowDownAZ } from 'lucide-react';
import { getUserStorageSettings } from '@/api/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AddStorageModal } from './components/AddStorageModal';
import { StorageSettingCard } from './components/StorageSettingCard';

export default function StoragePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [addModalVisible, setAddModalVisible] = useState(false);

  // 获取用户配置列表
  const { data: userSettings = [], isLoading, refetch } = useQuery({
    queryKey: ['userStorageSettings'],
    queryFn: getUserStorageSettings,
  });

  // 过滤和排序配置
  const filteredSettings = userSettings
    .sort((a, b) =>
      sort === 'asc'
        ? a.storagePlatform.name.localeCompare(b.storagePlatform.name)
        : b.storagePlatform.name.localeCompare(a.storagePlatform.name)
    )
    .filter((s) => {
      if (!searchTerm) return true;
      const keyword = searchTerm.toLowerCase();
      return (
        s.storagePlatform.name.toLowerCase().includes(keyword) ||
        s.storagePlatform.identifier.toLowerCase().includes(keyword) ||
        (s.remark || '').toLowerCase().includes(keyword)
      );
    });

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (value: 'asc' | 'desc') => {
    setSort(value);
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Filters and Actions */}
      <div className="flex items-end justify-between sm:items-center">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Input
            placeholder="搜索存储配置..."
            className="h-9 w-40 lg:w-[250px]"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="flex gap-2">
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-16">
              <SelectValue>
                <SlidersHorizontal size={18} />
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="asc">
                <div className="flex items-center gap-4">
                  <ArrowUpAZ size={16} />
                  <span>Ascending</span>
                </div>
              </SelectItem>
              <SelectItem value="desc">
                <div className="flex items-center gap-4">
                  <ArrowDownAZ size={16} />
                  <span>Descending</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setAddModalVisible(true)}>
            <Plus className="h-4 w-4 mr-2" />
            添加存储
          </Button>
        </div>
      </div>

      <Separator className="shadow-sm" />

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      ) : userSettings.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">暂无存储配置</p>
          <Button onClick={() => setAddModalVisible(true)}>
            <Plus className="h-4 w-4 mr-2" />
            添加您的第一个存储配置
          </Button>
        </div>
      ) : filteredSettings.length === 0 ? (
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">暂无文件</p>
        </div>
      ) : (
        <ul className="faded-bottom no-scrollbar grid gap-4 overflow-auto pb-16 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredSettings.map((setting) => (
            <StorageSettingCard key={setting.id} setting={setting} onRefresh={refetch} />
          ))}
        </ul>
      )}

      {/* Add Storage Config Modal */}
      <AddStorageModal
        open={addModalVisible}
        onOpenChange={setAddModalVisible}
        onSuccess={refetch}
      />
    </div>
  );
}
