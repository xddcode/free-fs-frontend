import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()

  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <h1 className='mb-4 text-6xl font-bold'>404</h1>
      <p className='mb-8 text-xl text-[var(--color-text-2)]'>
        {t('notFound.title')}
      </p>
      <Button onClick={() => navigate('/')}>{t('notFound.back')}</Button>
    </div>
  )
}
