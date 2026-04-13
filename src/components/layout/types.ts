import type { PermissionCodeType } from '@/types/permission'

/** 侧边栏导航：默认 Line，选中时 Fill（@remixicon/react） */
type SidebarNavIconPair = {
  line: React.ElementType<{ className?: string }>
  fill: React.ElementType<{ className?: string }>
}

type User = {
  name: string
  email: string
  avatar: string
}

type Team = {
  name: string
  logo: React.ElementType
  plan: string
}

type BaseNavItem = {
  /** i18n key under `layout` namespace, e.g. sidebar.nav.home */
  titleKey: string
  badge?: string
  icon?: SidebarNavIconPair
  permission?: PermissionCodeType
}

type NavLink = BaseNavItem & {
  url: string
  items?: never
}

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: string })[]
  url?: never
}

type NavItem = NavCollapsible | NavLink

type NavGroup = {
  titleKey: string
  items: NavItem[]
}

type SidebarData = {
  user: User
  teams: Team[]
  navGroups: NavGroup[]
}

export type {
  SidebarData,
  NavGroup,
  NavItem,
  NavCollapsible,
  NavLink,
  SidebarNavIconPair,
}
