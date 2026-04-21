import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  UserPlus,
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import dayjs from 'dayjs'
import { workspaceApi } from '@/api/workspace'
import { roleApi } from '@/api/role'
import { usePermission } from '@/hooks/use-permission'
import { useAuth } from '@/contexts/auth-context'
import { useWorkspaceStore } from '@/store/workspace'
import type { WorkspaceMember, WorkspaceInvitation } from '@/types/workspace'
import type { PageResult } from '@/types/permission'
import type { RoleListItem } from '@/types/role'
import {
  SettingsPageDescription,
  SettingsPageTitle,
} from '../components/settings-page-header'
import { InviteDialog } from './invite-dialog'
import { RoleOptionLabel } from './role-option-label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const PAGE_SIZE = 10

export function SettingsMembers() {
  const { t } = useTranslation('settings')
  const { hasPermission } = usePermission()
  const { user: currentUser, activateWorkspace } = useAuth()
  const canManageMembers = hasPermission('member:manage')
  const canInvite = canManageMembers
  const canCancelInvitation = canManageMembers
  const canUpdateRole = canManageMembers
  const canDeleteUser = canManageMembers
  const canShowActions = canManageMembers

  const [members, setMembers] = useState<PageResult<WorkspaceMember>>({
    total: 0,
    records: [],
  })
  const [roles, setRoles] = useState<RoleListItem[]>([])
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([])
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)

  const [removeTarget, setRemoveTarget] = useState<WorkspaceMember | null>(null)

  type InviteStatusInfo = {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }

  const invitationStatusMap = useMemo((): Record<number, InviteStatusInfo> => {
    return {
      0: { label: t('members.inviteStatus.pending'), variant: 'outline' },
      1: { label: t('members.inviteStatus.accepted'), variant: 'default' },
      2: { label: t('members.inviteStatus.expired'), variant: 'secondary' },
      3: { label: t('members.inviteStatus.cancelled'), variant: 'destructive' },
    }
  }, [t])

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await workspaceApi.getMembers({
        page,
        size: PAGE_SIZE,
        keyword: keyword || undefined,
      })
      setMembers(data)
    } catch (err: any) {
      if (!err?.handled) toast.error(t('members.listFailed'))
    } finally {
      setLoading(false)
    }
  }, [page, keyword, t])

  const fetchRoles = useCallback(async () => {
    try {
      const data = await roleApi.list()
      setRoles(data)
    } catch {
      // silently fail
    }
  }, [])

  const fetchInvitations = useCallback(async () => {
    try {
      const data = await workspaceApi.getInvitations()
      setInvitations(data)
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  useEffect(() => {
    fetchRoles()
    fetchInvitations()
  }, [fetchRoles, fetchInvitations])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (page === 1) {
      fetchMembers()
    } else {
      setPage(1)
    }
  }

  const handleRoleChange = async (userId: string, roleId: number) => {
    try {
      await workspaceApi.updateMemberRole(userId, roleId)
      toast.success(t('members.roleUpdated'))
      fetchMembers()

      if (userId === currentUser?.id) {
        const wsId = useWorkspaceStore.getState().currentWorkspaceId
        if (wsId) await activateWorkspace(wsId)
      }
    } catch (err: any) {
      if (!err?.handled) toast.error(t('members.roleUpdateFailed'))
    }
  }

  const handleRemoveMember = async () => {
    if (!removeTarget) return
    try {
      await workspaceApi.removeMember(removeTarget.userId)
      toast.success(t('members.removed'))
      setRemoveTarget(null)
      fetchMembers()
    } catch (err: any) {
      if (!err?.handled) toast.error(t('members.removeFailed'))
    }
  }

  const handleCancelInvitation = async (id: string) => {
    try {
      await workspaceApi.deleteInvitation(id)
      toast.success(t('members.inviteCancelled'))
      fetchInvitations()
    } catch (err: any) {
      if (!err?.handled) toast.error(t('members.actionFailed'))
    }
  }

  const totalPages = Math.ceil(members.total / PAGE_SIZE)
  const isSelf = (userId: string) => userId === currentUser?.id

  return (
    <div className='flex flex-1 flex-col'>
      <header className='flex-none'>
        <SettingsPageTitle>{t('members.pageTitle')}</SettingsPageTitle>
        <SettingsPageDescription>
          {t('members.pageDescription')}
        </SettingsPageDescription>
      </header>

      <div className='mt-8 flex-1'>
        <Tabs defaultValue='members' className='w-full'>
        <div className='flex items-center justify-between'>
          <TabsList>
            <TabsTrigger value='members'>
              {t('members.tabMembers')}
            </TabsTrigger>
            <TabsTrigger value='invitations'>
              {t('members.tabInvitations')}
            </TabsTrigger>
          </TabsList>
          {canInvite && (
            <Button size='sm' onClick={() => setInviteOpen(true)}>
              <UserPlus className='mr-1.5 h-4 w-4' />
              {t('members.inviteMember')}
            </Button>
          )}
        </div>

        <TabsContent value='members'>
          <form onSubmit={handleSearch} className='mt-4 mb-4 flex gap-2'>
            <div className='relative flex-1'>
              <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder={t('members.searchPlaceholder')}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className='pl-10'
              />
            </div>
            <Button type='submit' variant='secondary' size='sm'>
              {t('members.search')}
            </Button>
          </form>

          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('members.colUser')}</TableHead>
                  <TableHead>{t('members.colRole')}</TableHead>
                  <TableHead>{t('members.colJoined')}</TableHead>
                  {canShowActions && <TableHead className='w-12' />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && members.records.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canShowActions ? 4 : 3}
                      className='py-8 text-center text-muted-foreground'
                    >
                      {t('members.loading')}
                    </TableCell>
                  </TableRow>
                ) : members.records.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canShowActions ? 4 : 3}
                      className='py-8 text-center text-muted-foreground'
                    >
                      {t('members.empty')}
                    </TableCell>
                  </TableRow>
                ) : (
                  members.records.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <Avatar className='h-8 w-8'>
                            {m.avatar && <AvatarImage src={m.avatar} />}
                            <AvatarFallback className='text-xs'>
                              {(m.nickname || m.username).slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className='min-w-0'>
                            <div className='flex items-center gap-1.5 truncate text-sm font-medium'>
                              {m.nickname || m.username}
                              {isSelf(m.userId) && (
                                <Badge variant='secondary' className='text-[10px] px-1.5 py-0'>
                                  {t('members.you')}
                                </Badge>
                              )}
                            </div>
                            <div className='truncate text-xs text-muted-foreground'>
                              {m.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {canUpdateRole && !isSelf(m.userId) ? (
                          <Select
                            value={String(m.roleId)}
                            onValueChange={(v) =>
                              handleRoleChange(m.userId, Number(v))
                            }
                          >
                            <SelectTrigger
                              className='h-auto min-h-10 w-[min(100%,280px)] max-w-full items-start justify-between gap-2 py-1.5 whitespace-normal text-left [&_[data-slot=select-value]]:line-clamp-none [&_[data-slot=select-value]]:w-full [&_[data-slot=select-value]]:items-start'
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className='max-w-[min(100vw-2rem,22rem)]'>
                              {roles.map((r) => (
                                <SelectItem
                                  key={r.id}
                                  value={String(r.id)}
                                  className='items-start py-1.5 [&>span]:items-start'
                                >
                                  <RoleOptionLabel role={r} compact />
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant='outline'>
                            {m.roleName}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className='text-xs text-muted-foreground'>
                        {m.joinedAt
                          ? dayjs(m.joinedAt).format('YYYY-MM-DD HH:mm')
                          : '—'}
                      </TableCell>
                      {canShowActions && (
                        <TableCell>
                          {!isSelf(m.userId) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='icon' className='h-8 w-8'>
                                  <MoreHorizontal className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                {canDeleteUser && (
                                  <DropdownMenuItem
                                    className='text-destructive focus:text-destructive'
                                    onClick={() => setRemoveTarget(m)}
                                  >
                                    {t('members.removeMember')}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className='mt-4 flex items-center justify-between'>
              <span className='text-xs text-muted-foreground'>
                {t('members.totalMembers', { count: members.total })}
              </span>
              <div className='flex items-center gap-1'>
                <Button
                  variant='outline'
                  size='icon'
                  className='h-8 w-8'
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                <span className='px-2 text-xs'>
                  {page} / {totalPages}
                </span>
                <Button
                  variant='outline'
                  size='icon'
                  className='h-8 w-8'
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value='invitations'>
          <div className='mt-4 rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('members.colEmail')}</TableHead>
                  <TableHead>{t('members.colRole')}</TableHead>
                  <TableHead>{t('members.colStatus')}</TableHead>
                  <TableHead>{t('members.colInvitedAt')}</TableHead>
                  {canCancelInvitation && <TableHead className='w-12' />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canCancelInvitation ? 5 : 4}
                      className='py-8 text-center text-muted-foreground'
                    >
                      {t('members.emptyInvites')}
                    </TableCell>
                  </TableRow>
                ) : (
                  invitations.map((inv) => {
                    const statusInfo = invitationStatusMap[inv.status] ?? {
                      label: t('members.inviteStatus.unknown'),
                      variant: 'outline' as const,
                    }
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className='text-sm'>{inv.email}</TableCell>
                        <TableCell>
                          <Badge variant='outline'>
                            {inv.roleName ||
                              t('members.roleFallback', { id: inv.roleId })}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-xs text-muted-foreground'>
                          {dayjs(inv.createdAt).format('YYYY-MM-DD HH:mm')}
                        </TableCell>
                        {canCancelInvitation && (
                          <TableCell>
                            {inv.status === 0 && (
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-7 text-xs text-destructive hover:text-destructive'
                                onClick={() => handleCancelInvitation(inv.id)}
                              >
                                {t('members.cancelInvite')}
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      </div>

      <InviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        roles={roles}
        onSuccess={() => {
          fetchInvitations()
        }}
      />

      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('members.confirmRemoveTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('members.confirmRemoveDesc', {
                name:
                  removeTarget?.nickname || removeTarget?.username || '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('account.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={handleRemoveMember}
            >
              {t('members.confirmRemove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
