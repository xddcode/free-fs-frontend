import React, { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { NavSection } from './nav-section';
import { NavItem } from './nav-item';
import { StorageInfo } from './storage-info';
import { UserProfile } from './user-profile';
import { useAuth } from '@/contexts/auth-context';
import {
  MAIN_NAVIGATION,
  COMMON_TOOLS_NAVIGATION,
  FILE_TYPE_NAVIGATION,
  FILE_TYPE_CATEGORIES,
} from '@/lib/constants';
import type { NavigationItem, FileTypeCategory } from '@/types/layout';

export const Sidebar = React.memo(function Sidebar(): React.JSX.Element {
  const location = useLocation();
  const { user } = useAuth();

  // Determine if a navigation item is active based on current pathname
  const isActive = useCallback((href: string): boolean => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  }, [location.pathname]);

  // Mock storage data (in real app, this would come from props or API)
  const storageData = useMemo(() => ({
    used: 45.8,
    total: 100,
  }), []);

  // User data from auth context
  const userData = useMemo(() => ({
    username: user?.nickname || user?.username || 'Guest',
    email: user?.email || 'guest@example.com',
    avatar: user?.avatar,
  }), [user]);

  const handleProfileClick = useCallback(() => {
    console.log('User profile clicked');
    // In real app, this would open account menu
  }, []);

  return (
    <aside
      className="flex flex-col h-screen w-60 bg-sidebar border-r border-sidebar-border flex-shrink-0"
      aria-label="Main navigation sidebar"
      role="complementary"
    >
      {/* Brand Logo and App Name */}
      <div className="flex items-center gap-3 px-4 py-5" role="banner">
        <div className="flex items-center justify-center h-10 w-10" aria-hidden="true">
          <img 
            src="/logo.svg" 
            alt="Free Fs Logo" 
            className="h-10 w-10"
          />
        </div>
        <h1 className="text-lg font-semibold text-sidebar-foreground">
          Free Fs
        </h1>
      </div>

      {/* Navigation Content - Scrollable */}
      <div 
        className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-3"
        role="navigation"
        aria-label="Primary navigation"
      >
        {/* Main Navigation Section */}
        <NavSection collapsed={false}>
          {MAIN_NAVIGATION.items.map((item: NavigationItem) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={isActive(item.href)}
              collapsed={false}
              badge={item.badge}
            />
          ))}
        </NavSection>

        {/* Divider */}
        <div className="my-3 border-t border-sidebar-border/50" role="separator" aria-hidden="true" />

        {/* Common Tools Section */}
        <NavSection
          title={COMMON_TOOLS_NAVIGATION.title}
          collapsed={false}
        >
          {COMMON_TOOLS_NAVIGATION.items.map((item: NavigationItem) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={isActive(item.href)}
              collapsed={false}
              badge={item.badge}
            />
          ))}
        </NavSection>

        {/* Divider */}
        <div className="my-3 border-t border-sidebar-border/50" role="separator" aria-hidden="true" />

        {/* File Type Categories Section */}
        <NavSection
          title={FILE_TYPE_NAVIGATION.title}
          collapsed={false}
        >
          {FILE_TYPE_CATEGORIES.map((category: FileTypeCategory) => (
            <NavItem
              key={category.id}
              icon={category.icon}
              label={category.label}
              href={category.href}
              active={isActive(category.href)}
              collapsed={false}
            />
          ))}
        </NavSection>
      </div>

      {/* Bottom Section - Storage and User */}
      <div className="mt-auto" role="contentinfo" aria-label="Storage and user information">
        {/* Storage Information */}
        <StorageInfo
          used={storageData.used}
          total={storageData.total}
          collapsed={false}
        />

        {/* User Profile */}
        <UserProfile
          username={userData.username}
          email={userData.email}
          avatar={userData.avatar}
          collapsed={false}
          onProfileClick={handleProfileClick}
        />
      </div>
    </aside>
  );
});
