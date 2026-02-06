import { Fragment } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'

function SettingsButton() {
  const { state } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          tooltip={state === 'collapsed' ? '设置' : undefined}
          className='group-data-[collapsible=icon]:h-16! group-data-[collapsible=icon]:w-16! group-data-[collapsible=icon]:flex-col! group-data-[collapsible=icon]:justify-center! group-data-[collapsible=icon]:gap-1! group-data-[collapsible=icon]:p-2!'
        >
          <Link
            to='/settings'
            className='group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1'
          >
            <Settings className='size-4 group-data-[collapsible=icon]:size-6' />
            <span className='group-data-[collapsible=icon]:text-[11px]'>
              设置
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AppSidebar() {
  const { user: authUser } = useAuth()

  // 使用真实用户信息，如果未登录则使用占位符
  const user = authUser
    ? {
        name: authUser.nickname || authUser.username,
        email: authUser.email,
        avatar: authUser.avatar,
      }
    : sidebarData.user

  return (
    <Sidebar variant='sidebar' collapsible='icon'>
      <SidebarHeader>
        <AppTitle />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((group, index) => (
          <Fragment key={group.title}>
            {index > 0 && (
              <SidebarSeparator className='mx-4 hidden group-data-[collapsible=icon]:block' />
            )}
            <NavGroup title={group.title} items={group.items} />
          </Fragment>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SettingsButton />
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
