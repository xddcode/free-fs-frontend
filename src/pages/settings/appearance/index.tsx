import { useTranslation } from 'react-i18next'
import {
  SettingsPageDescription,
  SettingsPageTitle,
} from '../components/settings-page-header'
import { AppearanceForm } from './appearance-form'

export function SettingsAppearance() {
  const { t } = useTranslation('settings')
  return (
    <div className='flex flex-1 flex-col'>
      <header className='flex-none'>
        <SettingsPageTitle>{t('appearance.pageTitle')}</SettingsPageTitle>
        <SettingsPageDescription>
          {t('appearance.pageDescription')}
        </SettingsPageDescription>
      </header>
      <div className='mt-8 flex-1'>
        <AppearanceForm />
      </div>
    </div>
  )
}
