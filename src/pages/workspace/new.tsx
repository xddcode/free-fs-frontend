import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Building2 } from 'lucide-react'
import { workspaceApi } from '@/api/workspace'
import { useWorkspaceStore } from '@/store/workspace'
import { useAuth } from '@/contexts/auth-context'
import type { Workspace } from '@/types/workspace'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Logo } from '@/components/logo'

function slugFromUsername(username?: string) {
  const base = username || ''
  return base
    ? `${base
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '')}-ws`
    : ''
}

export default function NewWorkspacePage() {
  const { t } = useTranslation('workspace')
  const navigate = useNavigate()
  const { loadWorkspaces, activateWorkspace, user } = useAuth()
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const uname = user?.nickname || user?.username
  const { defaultName, defaultSlug } = useMemo(() => {
    const slug = slugFromUsername(uname)
    const name = uname ? t('new.defaultName', { name: uname }) : ''
    return { defaultName: name, defaultSlug: slug }
  }, [uname, t])

  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)

  useEffect(() => {
    setName(defaultName)
    setSlug(defaultSlug)
    setSlugTouched(false)
  }, [defaultName, defaultSlug])

  const handleNameChange = (value: string) => {
    setName(value)
    if (!slugTouched) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) {
      toast.error(t('new.toastFill'))
      return
    }

    setLoading(true)
    try {
      const created: Workspace = await workspaceApi.create({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
      })
      toast.success(t('new.toastSuccess'))
      await loadWorkspaces()
      await activateWorkspace(created.id)
      navigate(`/w/${created.slug}/`)
    } catch (err: any) {
      if (!err?.handled) toast.error(t('new.toastFail'))
    } finally {
      setLoading(false)
    }
  }

  const canGoBack = workspaces.length > 0

  return (
    <div className='flex min-h-screen items-center justify-center bg-muted/30 p-4'>
      <div className='w-full max-w-md space-y-6'>
        <div className='flex flex-col items-center gap-3'>
          <Logo className='h-12 w-12 text-primary' />
          <h1 className='text-2xl font-bold'>{t('new.title')}</h1>
          <p className='text-center text-sm text-muted-foreground'>
            {t('new.subtitle')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Building2 className='h-5 w-5' />
              {t('new.cardTitle')}
            </CardTitle>
            <CardDescription>{t('new.cardDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='ws-name'>{t('new.nameLabel')}</Label>
                <Input
                  id='ws-name'
                  placeholder={t('new.namePlaceholder')}
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  disabled={loading}
                  required
                  autoFocus
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='ws-slug'>{t('new.slugLabel')}</Label>
                <Input
                  id='ws-slug'
                  placeholder={t('new.slugPlaceholder')}
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    setSlug(e.target.value)
                  }}
                  disabled={loading}
                  required
                />
                <p className='text-xs text-muted-foreground'>
                  {t('new.slugHint')}
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='ws-desc'>{t('new.descLabel')}</Label>
                <Textarea
                  id='ws-desc'
                  placeholder={t('new.descPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  rows={3}
                />
              </div>

              <div className='flex gap-2 pt-2'>
                {canGoBack && (
                  <Button
                    type='button'
                    variant='outline'
                    className='flex-1'
                    onClick={() => navigate('/')}
                    disabled={loading}
                  >
                    {t('new.back')}
                  </Button>
                )}
                <Button
                  type='submit'
                  className={canGoBack ? 'flex-1' : 'w-full'}
                  disabled={loading}
                >
                  {loading ? t('new.submitting') : t('new.submit')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
