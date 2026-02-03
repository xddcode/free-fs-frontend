import { Outlet } from 'react-router-dom'
import { Palette, UserCog, Upload, Settings as SettingsIcon, Shield } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { SidebarNav } from './components/sidebar-nav'

const sidebarNavItems = [
  {
    title: '个人资料',
    href: '/settings',
    icon: <UserCog size={18} />,
  },
  {
    title: '账户设置',
    href: '/settings/account',
    icon: <Shield size={18} />,
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
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">设置</h2>
            <p className="text-sm text-muted-foreground">管理您的账户设置和偏好</p>
          </div>
        </div>
      </div>

      <Separator />
      
      <div className='flex flex-1 flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <aside className='lg:w-1/5'>
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className='flex-1 lg:max-w-2xl'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}