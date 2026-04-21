import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import type { SettingsTab } from '@/contexts/settings-modal-context'
import type { SidebarNavIconPair } from '@/components/layout/types'

export type SettingsNavItem = {
  title: string
  tab: SettingsTab
  icon: SidebarNavIconPair
}

export type SettingsNavGroup = {
  label: string
  items: SettingsNavItem[]
}

type SidebarNavProps = React.HTMLAttributes<HTMLElement> & {
  groups: SettingsNavGroup[]
  activeTab: SettingsTab
  onSelectTab: (tab: SettingsTab) => void
}

export function SidebarNav({
  className,
  groups,
  activeTab,
  onSelectTab,
  ...props
}: SidebarNavProps) {
  const { t } = useTranslation('settings')
  const [val, setVal] = useState(activeTab)

  useEffect(() => {
    setVal(activeTab)
  }, [activeTab])

  const handleSelect = (t: SettingsTab) => {
    setVal(t)
    onSelectTab(t)
  }

  return (
    <div
      className={cn(
        'flex min-h-0 flex-col border-sidebar-border bg-sidebar md:h-full md:min-w-54 md:max-w-[16rem] md:shrink-0 md:border-e',
        className
      )}
      {...props}
    >
      <div className='shrink-0 border-b border-sidebar-border p-2 md:hidden'>
        <Select
          value={val}
          onValueChange={(t) => handleSelect(t as SettingsTab)}
        >
          <SelectTrigger className='h-11 w-full bg-background'>
            <SelectValue placeholder={t('sidebar.selectPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectGroup key={group.label}>
                <SelectLabel className='text-muted-foreground'>
                  {group.label}
                </SelectLabel>
                {group.items.map((item) => {
                  const isActive = val === item.tab
                  const Cmp = isActive ? item.icon.fill : item.icon.line
                  return (
                    <SelectItem key={item.tab} value={item.tab}>
                      <div className='flex gap-x-3 px-1 py-0.5'>
                        <span className='flex shrink-0 items-center'>
                          <Cmp className='size-4' />
                        </span>
                        <span>{item.title}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SidebarProvider className='hidden h-full min-h-0 w-full flex-1 flex-col md:flex'>
        <Sidebar
          collapsible='none'
          className='flex h-full min-h-0 w-full border-0 bg-transparent'
        >
          <SidebarContent className='gap-0 overflow-y-auto px-2 py-4'>
            {groups.map((group) => (
              <SidebarGroup key={group.label} className='p-0'>
                <SidebarGroupLabel className='px-2 text-[11px] uppercase tracking-wider'>
                  {group.label}
                </SidebarGroupLabel>
                <SidebarMenu className='gap-0.5'>
                  {group.items.map((item) => {
                    const isActive = activeTab === item.tab
                    const Cmp = isActive ? item.icon.fill : item.icon.line
                    return (
                      <SidebarMenuItem key={item.tab}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => onSelectTab(item.tab)}
                        >
                          <span className='flex size-4 shrink-0 items-center justify-center [&>svg]:size-4'>
                            <Cmp className='size-4' />
                          </span>
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </div>
  )
}
