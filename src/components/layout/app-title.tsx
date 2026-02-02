import { Link } from 'react-router-dom'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { Logo } from '@/components/logo'
import { APP_VERSION } from '@/config/version'

export function AppTitle() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex aspect-square size-10 items-center justify-center rounded-lg">
              <Logo className="size-10 text-sidebar-primary" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate text-base font-bold">Free Fs</span>
              <span className="truncate text-xs text-muted-foreground font-mono">
                v{APP_VERSION}
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
