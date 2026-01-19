/**
 * Layout Constants
 * 
 * This file contains constant data for navigation items, file type categories,
 * and other layout-related configuration.
 */

import {
  Home,
  FolderOpen,
  ArrowDownUp,
  Cloud,
  Star,
  Clock,
  Share2,
  Trash2,
  FileText,
  Image,
  Video,
  Music,
  MoreHorizontal,
} from 'lucide-react';
import { NavigationSection, FileTypeCategory, PrimaryNavigationItem } from '@/types/layout';

/**
 * Main Navigation Items
 * Core functionality navigation (Home, All Files, Transfer, Storage)
 */
export const MAIN_NAVIGATION: NavigationSection = {
  id: 'main-navigation',
  items: [
    {
      id: 'home',
      label: '首页',
      icon: Home,
      href: '/',
    },
    {
      id: 'all-files',
      label: '全部文件',
      icon: FolderOpen,
      href: '/files',
    },
    {
      id: 'transfer',
      label: '传输',
      icon: ArrowDownUp,
      href: '/transfer',
    },
    {
      id: 'storage',
      label: '云存储配置',
      icon: Cloud,
      href: '/storage',
    },
  ],
};

/**
 * Common Tools Navigation Items
 * Frequently used tools (Collection, Recent, Share, Recycle Bin)
 */
export const COMMON_TOOLS_NAVIGATION: NavigationSection = {
  id: 'common-tools',
  title: '常用',
  items: [
    {
      id: 'collection',
      label: '我的收藏',
      icon: Star,
      href: '/collection',
    },
    {
      id: 'recent',
      label: '最近使用',
      icon: Clock,
      href: '/recent',
    },
    {
      id: 'share',
      label: '我的分享',
      icon: Share2,
      href: '/share',
    },
    {
      id: 'recycle',
      label: '回收站',
      icon: Trash2,
      href: '/recycle',
    },
  ],
};

/**
 * File Type Categories
 * Quick access by file type with color-coded icons
 */
export const FILE_TYPE_CATEGORIES: FileTypeCategory[] = [
  {
    id: 'documents',
    label: '文档',
    icon: FileText,
    color: 'text-blue-500',
    href: '/files?type=documents',
  },
  {
    id: 'images',
    label: '图片',
    icon: Image,
    color: 'text-green-500',
    href: '/files?type=images',
  },
  {
    id: 'videos',
    label: '视频',
    icon: Video,
    color: 'text-purple-500',
    href: '/files?type=videos',
  },
  {
    id: 'music',
    label: '音频',
    icon: Music,
    color: 'text-orange-500',
    href: '/files?type=music',
  },
  {
    id: 'others',
    label: '其它',
    icon: MoreHorizontal,
    color: 'text-gray-500',
    href: '/files?type=others',
  },
];

/**
 * File Type Categories Navigation Section
 * Wraps file type categories as a navigation section
 */
export const FILE_TYPE_NAVIGATION: NavigationSection = {
  id: 'file-types',
  title: '快捷方式',
  items: FILE_TYPE_CATEGORIES.map(category => ({
    id: category.id,
    label: category.label,
    icon: category.icon,
    href: category.href,
  })),
};

/**
 * Layout Configuration Constants
 */
export const LAYOUT_CONFIG = {
  SIDEBAR_WIDTH_EXPANDED: 240,
  SIDEBAR_WIDTH_COLLAPSED: 64,
  COLLAPSE_THRESHOLD: 768, // Window width in pixels
  STORAGE_KEY_SIDEBAR: 'sidebar-collapsed',
  STORAGE_KEY_THEME: 'theme',
  STORAGE_KEY_LAYOUT_STYLE: 'layout-style',
  STORAGE_KEY_ACTIVE_PRIMARY_NAV: 'active-primary-nav',
} as const;

/**
 * Storage Status Thresholds
 * Used for color coding storage usage
 */
export const STORAGE_THRESHOLDS = {
  WARNING: 80,  // Yellow/Orange warning at 80%
  CRITICAL: 95, // Red critical at 95%
} as const;

/**
 * Primary Navigation Items for Narrow Layout
 * Groups navigation items into main categories
 */
export const PRIMARY_NAVIGATION_ITEMS: PrimaryNavigationItem[] = [
  {
    id: 'home',
    label: '首页',
    icon: Home,
    secondaryItems: [
      {
        id: 'home',
        label: '首页',
        icon: Home,
        href: '/',
      },
    ],
  },
  {
    id: 'files',
    label: '文件',
    icon: FolderOpen,
    secondaryItems: [
      {
        id: 'all-files',
        label: '全部文件',
        icon: FolderOpen,
        href: '/files',
      },
      ...FILE_TYPE_CATEGORIES.map(category => ({
        id: category.id,
        label: category.label,
        icon: category.icon,
        href: category.href,
      })),
    ],
  },
  {
    id: 'transfer',
    label: '传输',
    icon: ArrowDownUp,
    secondaryItems: [
      {
        id: 'transfer',
        label: '传输列表',
        icon: ArrowDownUp,
        href: '/transfer',
      },
    ],
  },
  {
    id: 'storage',
    label: '存储平台',
    icon: Cloud,
    secondaryItems: [
      {
        id: 'storage',
        label: '云存储配置',
        icon: Cloud,
        href: '/storage',
      },
      ...COMMON_TOOLS_NAVIGATION.items,
    ],
  },
];

/**
 * Helper function to get primary navigation items
 */
export function getPrimaryNavigationItems(): PrimaryNavigationItem[] {
  return PRIMARY_NAVIGATION_ITEMS;
}

/**
 * Helper function to get primary navigation title by ID
 */
export function getPrimaryNavTitle(navId: string): string {
  const item = PRIMARY_NAVIGATION_ITEMS.find(item => item.id === navId);
  return item?.label || '';
}
