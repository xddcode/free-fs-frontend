import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  RiAddLine,
  RiBuildingLine,
  RiExpandUpDownLine,
  RiSettings3Line,
  RiUserAddLine,
} from '@remixicon/react'
import { toast } from 'sonner'
import { useWorkspaceStore } from '@/store/workspace'
import { useAuth } from '@/contexts/auth-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar'

export function WorkspaceSwitcher() {
  const { t } = useTranslation('layout')
  const navigate = useNavigate()
  const { isMobile, state } = useSidebar()
  const { activateWorkspace } = useAuth()
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)
  const [switching, setSwitching] = useState(false)

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId)

  const handleSwitch = useCallback(
    async (workspaceId: string) => {
      if (workspaceId === currentWorkspaceId || switching) return
      const target = workspaces.find((w) => w.id === workspaceId)
      if (!target) return

      setSwitching(true)
      try {
        await activateWorkspace(workspaceId)
        navigate(`/w/${target.slug}/`)
        toast.success(t('workspaceSwitcher.switchToast', { name: target.name }))
      } catch (err: any) {
        if (!err?.handled) toast.error(t('workspaceSwitcher.switchFailed'))
      } finally {
        setSwitching(false)
      }
    },
    [currentWorkspaceId, switching, workspaces, navigate, activateWorkspace, t]
  )

  const displayName =
    currentWorkspace?.name ?? t('workspaceSwitcher.selectWorkspace')

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='group-data-[collapsible=icon]:h-auto! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:p-2!'
            >
              <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                <RiBuildingLine className='h-4 w-4' />
              </div>
              {state === 'expanded' && (
                <>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>
                      {displayName}
                    </span>
                  </div>
                  <RiExpandUpDownLine className='ml-auto h-4 w-4 shrink-0 opacity-50' />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-80 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='start'
            sideOffset={4}
          >
            {currentWorkspace && (
              <>
                <div className='p-4 pb-3'>
                  <div className='flex items-start gap-3'>
                    <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                      <RiBuildingLine className='h-6 w-6' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-semibold text-base leading-tight truncate'>
                        {currentWorkspace.name}
                      </h3>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {t('workspaceSwitcher.memberCount', {
                          count: currentWorkspace.memberCount,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-2 mt-3'>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/w/${currentWorkspace.slug}/settings`)
                      }}
                      className='flex-1 flex items-center justify-center gap-2 h-8 px-3 text-xs rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors'
                    >
                      <RiSettings3Line className='h-4 w-4' />
                      <span>{t('workspaceSwitcher.settings')}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/w/${currentWorkspace.slug}/settings/members`)
                      }}
                      className='flex-1 flex items-center justify-center gap-2 h-8 px-3 text-xs rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors'
                    >
                      <RiUserAddLine className='h-4 w-4' />
                      <span>{t('workspaceSwitcher.inviteMembers')}</span>
                    </button>
                  </div>
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              {t('workspaceSwitcher.sectionTitle')}
            </DropdownMenuLabel>
            {workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => handleSwitch(ws.id)}
                className='cursor-pointer gap-2'
                disabled={switching}
              >
                <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary'>
                  <RiBuildingLine className='h-4 w-4' />
                </div>
                <div className='flex flex-1 flex-col gap-0.5 overflow-hidden'>
                  <span className='truncate'>{ws.name}</span>
                  <span className='truncate text-xs text-muted-foreground'>
                    {t('workspaceSwitcher.memberCount', { count: ws.memberCount })}
                  </span>
                </div>
                {ws.id === currentWorkspaceId && (
                  <span className='ml-auto text-xs text-muted-foreground'>
                    {t('workspaceSwitcher.current')}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='cursor-pointer gap-2'
              onClick={() => navigate('/workspace/new')}
            >
              <div className='flex h-6 w-6 items-center justify-center rounded border border-dashed'>
                <RiAddLine className='h-3.5 w-3.5' />
              </div>
              <span>{t('workspaceSwitcher.createWorkspace')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
