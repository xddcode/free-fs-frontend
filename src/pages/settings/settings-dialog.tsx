import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import {
  RiArrowLeftRightFill,
  RiArrowLeftRightLine,
  RiBuildingFill,
  RiBuildingLine,
  RiGroupFill,
  RiGroupLine,
  RiShieldUserFill,
  RiShieldUserLine,
  RiTShirtFill,
  RiTShirtLine,
  RiUserSettingsFill,
  RiUserSettingsLine,
} from '@remixicon/react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { NoPermission } from '@/components/no-permission'
import {
  useSettingsModal,
  type SettingsTab,
} from '@/contexts/settings-modal-context'
import { usePermission } from '@/hooks/use-permission'
import type { SidebarNavIconPair } from '@/components/layout/types'
import type { PermissionCodeType } from '@/types/permission'
import { SettingsProfile } from './profile'
import { SettingsAppearance } from './appearance'
import { SettingsTransfer } from './transfer'
import { SettingsWorkspace } from './workspace'
import { SettingsMembers } from './members'
import { SettingsRoles } from './roles'
import { SidebarNav, type SettingsNavGroup } from './components/sidebar-nav'

interface NavItemConfig {
  title: string
  tab: SettingsTab
  icon: SidebarNavIconPair
  permission?: PermissionCodeType
}

function buildNavConfig(
  t: TFunction<'settings'>
): { label: string; items: NavItemConfig[] }[] {
  return [
    {
      label: t('nav.groupAccount'),
      items: [
        {
          title: t('nav.profile'),
          tab: 'profile',
          icon: { line: RiUserSettingsLine, fill: RiUserSettingsFill },
        },
        {
          title: t('nav.preference'),
          tab: 'appearance',
          icon: { line: RiTShirtLine, fill: RiTShirtFill },
        },
        {
          title: t('nav.transfer'),
          tab: 'transfer',
          icon: {
            line: RiArrowLeftRightLine,
            fill: RiArrowLeftRightFill,
          },
        },
      ],
    },
    {
      label: t('nav.groupWorkspace'),
      items: [
        {
          title: t('nav.workspace'),
          tab: 'workspace',
          icon: { line: RiBuildingLine, fill: RiBuildingFill },
        },
        {
          title: t('nav.members'),
          tab: 'members',
          icon: { line: RiGroupLine, fill: RiGroupFill },
          permission: 'member:manage',
        },
        {
          title: t('nav.roles'),
          tab: 'roles',
          icon: { line: RiShieldUserLine, fill: RiShieldUserFill },
          permission: 'member:manage',
        },
      ],
    },
  ]
}

function toNavGroups(
  config: ReturnType<typeof buildNavConfig>,
  hasPermission: (p: PermissionCodeType) => boolean
): SettingsNavGroup[] {
  return config
    .map((group) => ({
      label: group.label,
      items: group.items
        .filter((item) => !item.permission || hasPermission(item.permission))
        .map(({ title, tab, icon }) => ({
          title,
          tab,
          icon,
        })),
    }))
    .filter((g) => g.items.length > 0)
}

function SettingsPanel({ tab }: { tab: SettingsTab }) {
  const { hasPermission } = usePermission()

  switch (tab) {
    case 'profile':
      return <SettingsProfile />
    case 'appearance':
      return <SettingsAppearance />
    case 'transfer':
      return <SettingsTransfer />
    case 'workspace':
      return <SettingsWorkspace />
    case 'members':
      return hasPermission('member:manage') ? (
        <SettingsMembers />
      ) : (
        <NoPermission />
      )
    case 'roles':
      return hasPermission('member:manage') ? (
        <SettingsRoles />
      ) : (
        <NoPermission />
      )
    default:
      return <SettingsProfile />
  }
}

export function SettingsDialog() {
  const { t } = useTranslation('settings')
  const { open, setOpen, tab, setTab } = useSettingsModal()
  const { hasPermission } = usePermission()

  const navGroups = useMemo(
    () => toNavGroups(buildNavConfig(t), hasPermission),
    [hasPermission, t]
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className='flex h-[min(92vh,960px)] max-h-[92vh] w-[min(1240px,calc(100%-32px))] max-w-none translate-x-[-50%] translate-y-[-50%] flex-col gap-0 overflow-hidden border bg-background p-0 shadow-xl sm:max-w-none sm:rounded-xl'
      >
        <div className='flex h-12 shrink-0 items-center justify-between border-b px-6 md:px-8'>
          <DialogTitle className='text-base font-semibold tracking-tight'>
            {t('dialog.title')}
          </DialogTitle>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-8 shrink-0'
            onClick={() => setOpen(false)}
            aria-label={t('dialog.closeAria')}
          >
            <X className='size-4' />
          </Button>
        </div>

        <div className='flex min-h-0 min-w-0 flex-1 flex-col md:flex-row'>
          <SidebarNav
            groups={navGroups}
            activeTab={tab}
            onSelectTab={setTab}
          />
          <div className='min-h-0 min-w-0 flex-1 overflow-y-auto bg-background px-6 py-6 sm:px-8 md:px-12 md:py-8 lg:px-16'>
            <SettingsPanel tab={tab} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
