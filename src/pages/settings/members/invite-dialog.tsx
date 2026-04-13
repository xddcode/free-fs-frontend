import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Mail } from 'lucide-react'
import { workspaceApi } from '@/api/workspace'
import type { RoleListItem } from '@/types/role'
import { RoleOptionLabel } from './role-option-label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface InviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roles: RoleListItem[]
  onSuccess: () => void
}

export function InviteDialog({
  open,
  onOpenChange,
  roles,
  onSuccess,
}: InviteDialogProps) {
  const { t } = useTranslation('settings')
  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState('')
  const [loading, setLoading] = useState(false)

  // 弹窗打开时，自动选中第一个角色
  useEffect(() => {
    if (open && roles.length > 0 && !roleId) {
      setRoleId(String(roles[0].id))
    }
  }, [open, roles, roleId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !roleId) {
      toast.error(t('members.inviteDialog.fillAll'))
      return
    }

    setLoading(true)
    try {
      await workspaceApi.createInvitation({
        email: email.trim(),
        roleId: Number(roleId),
      })
      toast.success(t('members.inviteDialog.sent'))
      setEmail('')
      setRoleId('')
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      if (!err?.handled) toast.error(t('members.inviteDialog.sendFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('members.inviteDialog.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='contents'>
          <div className='space-y-6'>
            <div className='space-y-3'>
              <Label htmlFor='invite-email'>
                <span className='relative top-0.5 text-red-500'>* </span>
                {t('members.inviteDialog.email')}
              </Label>
              <div className='relative'>
                <Mail className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  id='invite-email'
                  type='email'
                  placeholder='user@example.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='pl-10'
                  disabled={loading}
                  required
                />
              </div>
            </div>
            <div className='space-y-3'>
              <Label htmlFor='role-select'>
                <span className='relative top-0.5 text-red-500'>* </span>
                {t('members.inviteDialog.selectRole')}
              </Label>
              <Select value={roleId} onValueChange={setRoleId} disabled={loading}>
                <SelectTrigger
                  className='h-auto min-h-[3.75rem] w-full items-start justify-between gap-2 py-2.5 whitespace-normal text-left [&_[data-slot=select-value]]:line-clamp-none [&_[data-slot=select-value]]:w-full [&_[data-slot=select-value]]:items-start'
                >
                  <SelectValue
                    placeholder={t('members.inviteDialog.selectRolePlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent className='max-w-[min(100vw-2rem,22rem)]'>
                  {roles.map((role) => (
                    <SelectItem
                      key={role.id}
                      value={String(role.id)}
                      className='items-start py-2 [&>span]:items-start'
                    >
                      <RoleOptionLabel role={role} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t('members.inviteDialog.cancel')}
            </Button>
            <Button
              type='submit'
              disabled={loading || !email.trim() || !roleId}
            >
              {loading
                ? t('members.inviteDialog.sending')
                : t('members.inviteDialog.send')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
