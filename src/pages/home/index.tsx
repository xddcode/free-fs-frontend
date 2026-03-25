import * as React from 'react'
import type { HomeUsedBytesUnit } from '@/api/home'
import { ChartStorageGrowth } from './components/chart-storage-growth'
import { RecentFilesTable } from './components/recent-files-table'
import {
  CATEGORY_SHORTCUTS,
  CategoryShortcutLink,
} from './components/section-cards'
import { OpenSourceCard } from './components/open-source-card'
import { StorageOverviewCard } from './components/storage-usage-card'

export default function HomePage() {
  const [homeStorageUnit, setHomeStorageUnit] =
    React.useState<HomeUsedBytesUnit>(2)

  return (
    <div className='flex flex-1 flex-col'>
      <div className='@container/main flex flex-1 flex-col gap-2'>
        <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
          <div className='px-4 lg:px-6'>
            <div className='flex flex-col gap-4 md:gap-6'>
              <div className='grid min-h-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-6 lg:items-stretch lg:gap-3'>
                <div className='grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:col-span-5 lg:row-start-1 lg:grid-cols-5 lg:gap-3'>
                  {CATEGORY_SHORTCUTS.map((item) => (
                    <CategoryShortcutLink key={item.href} {...item} />
                  ))}
                </div>
                <ChartStorageGrowth
                  unit={homeStorageUnit}
                  onUnitChange={setHomeStorageUnit}
                  className='min-h-[400px] min-w-0 sm:min-h-[440px] md:min-h-[460px] lg:col-span-5 lg:row-start-2 lg:h-full lg:min-h-0'
                />
                <div className='flex min-h-0 min-w-0 flex-col gap-3 lg:col-span-1 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:h-full'>
                  <StorageOverviewCard
                    storageUnit={homeStorageUnit}
                    className='min-h-0 flex-1 lg:min-h-0'
                  />
                  <OpenSourceCard className='shrink-0' />
                </div>
              </div>
            </div>
          </div>
          <RecentFilesTable unit={homeStorageUnit} />
        </div>
      </div>
    </div>
  )
}
