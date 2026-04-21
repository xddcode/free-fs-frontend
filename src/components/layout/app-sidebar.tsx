import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/auth-context'
import { usePermission } from '@/hooks/use-permission'
import { RiSettings3Line } from '@remixicon/react'
import { useSettingsModal } from '@/contexts/settings-modal-context'
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
import { WorkspaceSwitcher } from './workspace-switcher'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'

function SettingsButton() {
  const { t } = useTranslation('layout')
  const { state } = useSidebar()
  const { openSettings } = useSettingsModal()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          type='button'
          tooltip={state === 'collapsed' ? t('sidebar.settings') : undefined}
          className='group-data-[collapsible=icon]:h-16! group-data-[collapsible=icon]:w-16! group-data-[collapsible=icon]:flex-col! group-data-[collapsible=icon]:justify-center! group-data-[collapsible=icon]:gap-1! group-data-[collapsible=icon]:p-2!'
          onClick={() => openSettings('profile')}
        >
          <RiSettings3Line className='size-4 group-data-[collapsible=icon]:size-6' />
          <span className='sidebar-nav-label group-data-[collapsible=icon]:text-[11px]'>
            {t('sidebar.settings')}
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AppSidebar() {
  const { t } = useTranslation('layout')
  const { user: authUser } = useAuth()
  const { hasPermission } = usePermission()

  // 使用真实用户信息，如果未登录则使用占位符
  const user = authUser
    ? {
        name: authUser.nickname || authUser.username,
        email: authUser.email,
        avatar: authUser.avatar,
      }
    : { ...sidebarData.user, name: t('sidebar.userPlaceholder') }

  const navGroups = sidebarData.navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.permission || hasPermission(item.permission)
      ),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <Sidebar variant='sidebar' collapsible='icon'>
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group, index) => (
          <Fragment key={group.titleKey}>
            {index > 0 && (
              <SidebarSeparator className='mx-4 hidden group-data-[collapsible=icon]:block' />
            )}
            <NavGroup titleKey={group.titleKey} items={group.items} />
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
