import {
  RiArrowLeftRightFill,
  RiArrowLeftRightLine,
  RiDeleteBinFill,
  RiDeleteBinLine,
  RiFolderOpenFill,
  RiFolderOpenLine,
  RiHistoryFill,
  RiHistoryLine,
  RiHome9Fill,
  RiHome9Line,
  RiServerFill,
  RiServerLine,
  RiShareFill,
  RiShareLine,
  RiStarFill,
  RiStarLine,
} from '@remixicon/react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: '',
    email: 'user@example.com',
    avatar: '/avatars/default.jpg',
  },
  teams: [],
  navGroups: [
    {
      titleKey: 'sidebar.groups.main',
      items: [
        {
          titleKey: 'sidebar.nav.home',
          url: '/',
          icon: { line: RiHome9Line, fill: RiHome9Fill },
        },
        {
          titleKey: 'sidebar.nav.allFiles',
          url: '/files',
          icon: { line: RiFolderOpenLine, fill: RiFolderOpenFill },
          permission: 'file:read',
        },
        {
          titleKey: 'sidebar.nav.transfer',
          url: '/transfer',
          icon: { line: RiArrowLeftRightLine, fill: RiArrowLeftRightFill },
        },
        {
          titleKey: 'sidebar.nav.storage',
          url: '/storage',
          icon: { line: RiServerLine, fill: RiServerFill },
          permission: 'storage:manage',
        },
      ],
    },
    {
      titleKey: 'sidebar.groups.common',
      items: [
        {
          titleKey: 'sidebar.nav.favorites',
          url: '/files?view=favorites',
          icon: { line: RiStarLine, fill: RiStarFill },
        },
        {
          titleKey: 'sidebar.nav.recents',
          url: '/files?view=recents',
          icon: { line: RiHistoryLine, fill: RiHistoryFill },
        },
        {
          titleKey: 'sidebar.nav.shares',
          url: '/files?view=shares',
          icon: { line: RiShareLine, fill: RiShareFill },
          permission: 'file:share',
        },
        {
          titleKey: 'sidebar.nav.recycle',
          url: '/files?view=recycle',
          icon: { line: RiDeleteBinLine, fill: RiDeleteBinFill },
          permission: 'file:write',
        },
      ],
    },
  ],
}
