import { type ChangeEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  RefreshCw,
  Plus,
  ArrowUpAZ,
  ArrowDownAZ,
  Search,
} from 'lucide-react'
import { getUserStorageSettings } from '@/api/storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RequirePermission } from '@/components/require-permission'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { AddStorageModal } from './components/AddStorageModal'
import { StorageSettingCard } from './components/StorageSettingCard'

export default function StoragePage() {
  const { t } = useTranslation('storage')
  const { t: tc } = useTranslation('common')
  const { slug } = useParams<{ slug: string }>()
  const [searchTerm, setSearchTerm] = useState('')
  const [sort, setSort] = useState<'asc' | 'desc'>('asc')
  const [addModalVisible, setAddModalVisible] = useState(false)

  const {
    data: userSettings = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['userStorageSettings', slug],
    queryFn: getUserStorageSettings,
    staleTime: 30_000,
  })

  // 过滤和排序配置
  const filteredSettings = userSettings
    .sort((a, b) =>
      sort === 'asc'
        ? a.storagePlatform.name.localeCompare(b.storagePlatform.name)
        : b.storagePlatform.name.localeCompare(a.storagePlatform.name)
    )
    .filter((s) => {
      if (!searchTerm) return true
      const keyword = searchTerm.toLowerCase()
      return (
        s.storagePlatform.name.toLowerCase().includes(keyword) ||
        s.storagePlatform.identifier.toLowerCase().includes(keyword) ||
        (s.remark || '').toLowerCase().includes(keyword)
      )
    })

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleSortChange = (value: 'asc' | 'desc') => {
    setSort(value)
  }

  return (
    <div className='flex h-full flex-col'>
      {/* 顶部工具栏 */}
      <div className='flex items-center gap-4 border-b px-6 py-4'>
        <SidebarTrigger className='md:hidden' />

        {/* 标题 */}
        <div className='min-w-0 flex-1'>
          <h2 className='text-xl font-semibold tracking-tight'>
            {t('page.title')}
          </h2>
        </div>

        {/* 右侧工具栏 */}
        <div className='flex items-center gap-2'>
          <div className='relative'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder={t('page.searchPlaceholder')}
              className='h-9 w-[250px] pl-10'
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <Button variant='outline' size='sm' onClick={() => refetch()}>
            <RefreshCw className='h-4 w-4' />
          </Button>
          <RequirePermission code='storage:manage'>
            <Button size='sm' onClick={() => setAddModalVisible(true)}>
              <Plus className='mr-1.5 h-4 w-4' />
              {t('page.add')}
            </Button>
          </RequirePermission>
        </div>
      </div>

      {/* 次级工具栏：统计信息 */}
      <div className='flex items-center justify-between border-b px-6 py-3'>
        <span className='text-sm text-muted-foreground'>
          {tc('listTotalItems', { count: filteredSettings.length })}
        </span>
      </div>

      {/* 主内容区域 */}
      <div className='flex-1 overflow-auto p-6'>
        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <p className='text-muted-foreground'>{tc('loading')}</p>
          </div>
        ) : userSettings.length === 0 ? (
          <div className='flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed'>
            <p className='mb-4 text-muted-foreground'>{t('page.empty')}</p>
            <RequirePermission code='storage:manage'>
              <Button onClick={() => setAddModalVisible(true)}>
                <Plus className='mr-2 h-4 w-4' />
                {t('page.addFirst')}
              </Button>
            </RequirePermission>
          </div>
        ) : filteredSettings.length === 0 ? (
          <div className='flex h-64 items-center justify-center rounded-lg border-2 border-dashed'>
            <p className='text-muted-foreground'>{t('page.noMatch')}</p>
          </div>
        ) : (
          <ul className='faded-bottom no-scrollbar grid grid-cols-2 gap-4 overflow-auto pb-16 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
            {filteredSettings.map((setting) => (
              <StorageSettingCard
                key={setting.id}
                setting={setting}
                onRefresh={refetch}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Add Storage Config Modal */}
      <AddStorageModal
        open={addModalVisible}
        onOpenChange={setAddModalVisible}
        onSuccess={refetch}
      />
    </div>
  )
}
