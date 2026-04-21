import { ShieldX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NoPermission() {
  const { t } = useTranslation('settings')
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()

  return (
    <div className='flex h-[60vh] flex-col items-center justify-center gap-4'>
      <ShieldX className='h-16 w-16 text-muted-foreground/50' />
      <h2 className='text-xl font-semibold'>{t('noAccess.title')}</h2>
      <p className='text-sm text-muted-foreground'>
        {t('noAccess.description')}
      </p>
      <Button
        variant='outline'
        onClick={() => navigate(slug ? `/w/${slug}/` : '/')}
      >
        {t('noAccess.backHome')}
      </Button>
    </div>
  )
}
