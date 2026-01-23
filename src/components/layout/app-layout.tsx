import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Sidebar } from './sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = React.memo(function AppLayout({ 
  children 
}: AppLayoutProps): React.JSX.Element {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
});
