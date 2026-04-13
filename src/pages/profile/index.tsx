import { useTranslation } from 'react-i18next'

export default function ProfilePage() {
  const { t } = useTranslation('common')
  return (
    <div className='p-6'>
      <h1 className='mb-4 text-2xl font-bold'>{t('profile.title')}</h1>
      <p className='text-muted-foreground'>{t('profile.description')}</p>
    </div>
  )
}
