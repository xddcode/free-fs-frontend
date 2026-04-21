import { useMemo } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SettingsModalProvider } from '@/contexts/settings-modal-context'
import { SettingsDialog } from '@/pages/settings'
import { AppSidebar } from './app-sidebar'
import { Header } from './header'
import { Main } from './main'

export const LAYOUT_STORAGE_KEY = 'app-layout'

export function getDefaultSidebarOpen(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(LAYOUT_STORAGE_KEY) !== 'compact'
}

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const defaultOpen = useMemo(getDefaultSidebarOpen, [])
  return (
    <SettingsModalProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <Header fixed />
          <Main fixed>{children}</Main>
        </SidebarInset>
        {/* 与主侧栏同处 SidebarProvider，设置内外观表单的 useSidebar 才能取到主布局侧边栏 */}
        <SettingsDialog />
      </SidebarProvider>
    </SettingsModalProvider>
  )
}
