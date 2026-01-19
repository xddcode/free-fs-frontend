/**
 * Layout Type Definitions
 * 
 * This file contains all TypeScript interfaces and types for the layout system.
 */

import { LucideIcon } from 'lucide-react';

/**
 * Navigation Item Model
 * Represents a single navigation item in the sidebar
 */
export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
}

/**
 * Navigation Section Model
 * Represents a group of navigation items with an optional title
 */
export interface NavigationSection {
  id: string;
  title?: string;
  items: NavigationItem[];
}

/**
 * File Type Category Model
 * Represents a file type category for quick access
 */
export interface FileTypeCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string; // Tailwind color class
  href: string;
}

/**
 * Storage Info Model
 * Represents storage space information
 */
export interface StorageInfo {
  used: number;      // Used space in GB
  total: number;     // Total space in GB
  percentage: number; // Usage percentage (0-100)
}

/**
 * User Profile Model
 * Represents user profile information
 */
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

/**
 * Layout Style Type
 * Defines the two available layout styles
 */
export type LayoutStyle = 'wide' | 'narrow';

/**
 * Primary Navigation Item
 * Represents a main navigation category in narrow layout
 */
export interface PrimaryNavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  secondaryItems: NavigationItem[];
}

/**
 * Layout State Model
 * Represents the global layout state
 */
export interface LayoutState {
  sidebarCollapsed: boolean;
  layoutStyle: LayoutStyle;
  activePrimaryNav: string | null;
  theme: 'light' | 'dark';
}

/**
 * Layout Context Value
 * Represents the context value for layout management
 */
export interface LayoutContextValue {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  layoutStyle: LayoutStyle;
  setLayoutStyle: (style: LayoutStyle) => void;
  toggleLayoutStyle: () => void;
  activePrimaryNav: string | null;
  setActivePrimaryNav: (navId: string | null) => void;
}

/**
 * Component Props Interfaces
 */

export interface AppLayoutProps {
  children: React.ReactNode;
}

export interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export interface NavSectionProps {
  title?: string;
  children: React.ReactNode;
  collapsed?: boolean;
}

export interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  active?: boolean;
  collapsed?: boolean;
  badge?: number;
  onClick?: () => void;
}

export interface StorageInfoProps {
  used: number;      // Used space in GB
  total: number;     // Total space in GB
  collapsed?: boolean;
}

export interface UserProfileProps {
  avatar?: string;
  username: string;
  email: string;
  collapsed?: boolean;
  onProfileClick?: () => void;
}

/**
 * Primary Navigation Bar Props
 */
export interface PrimaryNavBarProps {
  items: PrimaryNavigationItem[];
  activeNavId: string | null;
  onNavClick: (navId: string) => void;
}

/**
 * Secondary Sidebar Props
 */
export interface SecondarySidebarProps {
  items: NavigationItem[];
  title: string;
  storageInfo: StorageInfo;
  userProfile: UserProfile;
}

/**
 * Layout Style Toggle Props
 */
export interface LayoutStyleToggleProps {
  currentStyle?: LayoutStyle;
  onToggle?: () => void;
  className?: string;
}
