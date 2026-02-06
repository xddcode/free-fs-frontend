import { useMemo } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
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
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <Header fixed />
        <Main fixed>{children}</Main>
      </SidebarInset>
    </SidebarProvider>
  )
}
