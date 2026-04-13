import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmailChangeForm, PasswordChangeForm } from './account-forms'

export function AccountSecuritySection() {
  const { t } = useTranslation('settings')
  const { user } = useAuth()
  const [emailOpen, setEmailOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)

  return (
    <>
      <div className='space-y-6'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-8'>
          <div className='min-w-0 space-y-1'>
            <p className='text-base'>{t('account.email')}</p>
            <p className='truncate text-sm text-muted-foreground'>
              {user?.email || t('account.notSet')}
            </p>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='h-auto shrink-0 self-start px-0 text-sm font-medium text-primary hover:bg-transparent hover:underline sm:self-center'
            onClick={() => setEmailOpen(true)}
          >
            {t('account.manageEmail')}
          </Button>
        </div>

        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-8'>
          <div className='min-w-0 space-y-1'>
            <p className='text-base'>{t('account.password')}</p>
            <p className='text-sm text-muted-foreground'>
              {t('account.passwordHint')}
            </p>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='h-auto shrink-0 self-start px-0 text-sm font-medium text-primary hover:bg-transparent hover:underline sm:self-center'
            onClick={() => setPasswordOpen(true)}
          >
            {user?.isSetPassword === false
              ? t('account.setPassword')
              : t('account.changePassword')}
          </Button>
        </div>
      </div>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>{t('account.dialogEmailTitle')}</DialogTitle>
            <DialogDescription>
              {t('account.dialogEmailDesc')}
            </DialogDescription>
          </DialogHeader>
          <EmailChangeForm
            onSuccess={() => setEmailOpen(false)}
            onCancel={() => setEmailOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {user?.isSetPassword === false
                ? t('account.dialogSetPwdTitle')
                : t('account.dialogChangePwdTitle')}
            </DialogTitle>
            <DialogDescription>
              {user?.isSetPassword === false
                ? t('account.dialogSetPwdDesc')
                : t('account.dialogChangePwdDesc')}
            </DialogDescription>
          </DialogHeader>
          <PasswordChangeForm
            key={user?.isSetPassword === false ? 'set' : 'change'}
            mode={user?.isSetPassword === false ? 'set' : 'change'}
            onSuccess={() => setPasswordOpen(false)}
            onCancel={() => setPasswordOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
