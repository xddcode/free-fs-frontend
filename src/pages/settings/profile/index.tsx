import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/auth-context'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  SettingsPageDescription,
  SettingsPageTitle,
} from '../components/settings-page-header'
import { ProfileForm } from './profile-form'
import { AccountSecuritySection } from './account-security-section'

export function SettingsProfile() {
  const { t } = useTranslation('settings')
  const { user } = useAuth()
  const [copiedUserId, setCopiedUserId] = useState(false)

  const handleCopyUserId = async () => {
    if (!user?.id) return
    try {
      await navigator.clipboard.writeText(user.id.toString())
      setCopiedUserId(true)
      setTimeout(() => setCopiedUserId(false), 2000)
      toast.success(t('profile.copied'))
    } catch (error) {
      toast.error(t('profile.copyFailed'))
    }
  }

  return (
    <div className='flex flex-1 flex-col'>
      <header className='flex-none'>
        <SettingsPageTitle>{t('profile.pageTitle')}</SettingsPageTitle>
        <SettingsPageDescription>
          {t('profile.pageDescription')}
        </SettingsPageDescription>
      </header>

      <div className='mt-8 flex flex-col gap-10'>
        <section className='min-w-0'>
          <div className='border-b border-border pb-2'>
            <h3 className='text-xl font-semibold tracking-tight'>
              {t('profile.sectionAccount')}
            </h3>
          </div>
          <div className='pt-5'>
            <ProfileForm />
          </div>
        </section>

        <section className='min-w-0'>
          <div className='border-b border-border pb-2'>
            <h3 className='text-xl font-semibold tracking-tight'>
              {t('profile.sectionSecurity')}
            </h3>
          </div>
          <div className='pt-5'>
            <AccountSecuritySection />
          </div>
        </section>

        <section className='min-w-0'>
          <div className='border-b border-border pb-2'>
            <h3 className='text-xl font-semibold tracking-tight'>
              {t('profile.sectionUserId')}
            </h3>
          </div>
          <div className='pt-5'>
            <div className='flex items-center justify-between'>
              <div className='text-sm text-muted-foreground'>
                {t('profile.userIdLabel')}
              </div>
              <div className='flex items-center gap-2'>
                <div className='text-sm text-foreground'>
                  {user?.id || '-'}
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 shrink-0'
                  onClick={handleCopyUserId}
                >
                  {copiedUserId ? (
                    <Check className='h-4 w-4 text-green-600' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
