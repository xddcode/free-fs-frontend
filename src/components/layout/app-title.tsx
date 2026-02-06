import { APP_VERSION } from '@/config/version'
import { Link } from 'react-router-dom'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar'
import { Logo } from '@/components/logo'

export function AppTitle() {
  const { state } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          asChild
          className='group-data-[collapsible=icon]:h-auto! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent group-data-[collapsible=icon]:hover:bg-transparent'
        >
          <Link to='/' className='flex items-center gap-3'>
            <div className='flex aspect-square size-10 items-center justify-center rounded-lg'>
              <Logo className='size-10 text-sidebar-primary' />
            </div>
            {state === 'expanded' && (
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate text-base font-bold'>Free Fs</span>
                <span className='truncate font-mono text-xs text-muted-foreground'>
                  v{APP_VERSION}
                </span>
              </div>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
