import { Outlet } from 'react-router-dom'
import { Palette, UserCog, Upload, Settings as SettingsIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { SidebarNav } from './components/sidebar-nav'

const sidebarNavItems = [
  {
    title: '个人资料',
    href: '/settings',
    icon: <UserCog size={18} />,
  },
  {
    title: '外观',
    href: '/settings/appearance',
    icon: <Palette size={18} />,
  },
  {
    title: '传输设置',
    href: '/settings/transfer',
    icon: <Upload size={18} />,
  },
]

export function Settings() {
  return (
    <div className="p-5 bg-background min-h-screen">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-5 pb-4">
        <div className="flex items-center gap-4">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">设置</h2>
            <p className="text-sm text-muted-foreground">管理您的账户设置和偏好</p>
          </div>
        </div>
      </div>

      <Separator className="mb-5" />
      
      <div className='flex flex-1 space-y-2 md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
        <aside className='top-0 lg:sticky lg:w-1/5'>
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className='flex-1 w-full pl-4 pr-6'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}