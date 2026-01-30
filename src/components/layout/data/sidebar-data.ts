import {
  Home,
  FolderOpen,
  ArrowDownUp,
  Cloud,
  Settings,
  User,
  Palette,
  Star,
  Clock,
  Share2,
  Trash2,
  FileText,
  Image,
  Video,
  Music,
  MoreHorizontal,
  Folder,
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
          icon: ArrowDownUp,
        },
        {
          title: '云存储配置',
          url: '/storage',
          icon: Cloud,
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
    {
      title: '快捷方式',
      items: [
        {
          title: '文件夹',
          url: '/files?isDir=true',
          icon: Folder,
        },
        {
          title: '文档',
          url: '/files?type=document',
          icon: FileText,
        },
        {
          title: '图片',
          url: '/files?type=image',
          icon: Image,
        },
        {
          title: '视频',
          url: '/files?type=video',
          icon: Video,
        },
        {
          title: '音频',
          url: '/files?type=audio',
          icon: Music,
        },
        {
          title: '其它',
          url: '/files?type=other',
          icon: MoreHorizontal,
        },
      ],
    },
    {
      title: '设置',
      items: [
        {
          title: '设置',
          icon: Settings,
          items: [
            {
              title: '个人资料',
              url: '/settings',
              icon: User,
            },
            {
              title: '外观',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: '传输设置',
              url: '/settings/transfer',
              icon: ArrowDownUp,
            },
          ],
        },
      ],
    },
  ],
}
