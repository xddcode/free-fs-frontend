import {
  Home,
  FolderOpen,
  ArrowLeftRight,
  Server,
  Star,
  Clock,
  Share2,
  Trash2,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: '用户',
    email: 'user@example.com',
    avatar: '/avatars/default.jpg',
  },
  teams: [],
  navGroups: [
    {
      title: '主导航',
      items: [
        {
          title: '首页',
          url: '/',
          icon: Home,
        },
        {
          title: '全部文件',
          url: '/files',
          icon: FolderOpen,
        },
        {
          title: '传输',
          url: '/transfer',
          icon: ArrowLeftRight,
        },
        {
          title: '云存储配置',
          url: '/storage',
          icon: Server,
        },
      ],
    },
    {
      title: '常用',
      items: [
        {
          title: '我的收藏',
          url: '/files?view=favorites',
          icon: Star,
        },
        {
          title: '最近使用',
          url: '/files?view=recents',
          icon: Clock,
        },
        {
          title: '我的分享',
          url: '/files?view=shares',
          icon: Share2,
        },
        {
          title: '回收站',
          url: '/files?view=recycle',
          icon: Trash2,
        },
      ],
    },
  ],
}
