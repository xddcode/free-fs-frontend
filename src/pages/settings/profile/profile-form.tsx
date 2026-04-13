import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, PlusIcon } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { userApi } from '@/api/user'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'

type ProfileFormValues = { nickname: string }

function initialsFromNickname(nickname: string) {
  const t = nickname.trim()
  if (!t) return '?'
  return t.length >= 2 ? t.slice(0, 2).toUpperCase() : t.toUpperCase()
}

const AVATAR_MAX_BYTES = 5 * 1024 * 1024

export function ProfileForm() {
  const { t } = useTranslation('settings')
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const initializedRef = useRef(false)

  const profileFormSchema = useMemo(
    () =>
      z.object({
        nickname: z
          .string()
          .min(2, t('profile.validation.nicknameMin'))
          .max(20, t('profile.validation.nicknameMax')),
      }),
    [t]
  )

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nickname: '',
    },
  })

  useEffect(() => {
    if (user?.nickname && !initializedRef.current) {
      form.reset({
        nickname: user.nickname,
      })
      initializedRef.current = true
    }
  }, [user?.nickname, form])

  async function saveChanges(data: ProfileFormValues) {
    if (!user) return

    setLoading(true)
    try {
      await userApi.updateUserInfo({
        nickname: data.nickname,
      })
      const fresh = await userApi.getUserInfo()
      updateUser(fresh)

      toast.success(t('profile.saved'))
    } catch (error) {
      toast.error(t('profile.saveFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleNicknameBlur = async () => {
    const values = form.getValues()
    const ok = await form.trigger('nickname')
    if (!ok || !user) return
    if (values.nickname === user.nickname) return
    await saveChanges(values)
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !user) return
    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.imageOnly'))
      return
    }
    if (file.size > AVATAR_MAX_BYTES) {
      toast.error(t('profile.imageTooLarge'))
      return
    }
    setAvatarUploading(true)
    try {
      await userApi.uploadAvatar(file)
      const fresh = await userApi.getUserInfo()
      updateUser(fresh)
      toast.success(t('profile.avatarUpdated'))
    } catch {
      toast.error(t('profile.uploadFailed'))
    } finally {
      setAvatarUploading(false)
    }
  }

  return (
    <Form {...form}>
      <div className='flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10'>
        <div className='flex shrink-0 flex-col items-center sm:items-start sm:pt-0.5'>
          <input
            ref={avatarInputRef}
            type='file'
            accept='image/*'
            className='sr-only'
            onChange={handleAvatarChange}
            disabled={avatarUploading || loading}
          />
          <button
            type='button'
            className='group relative shrink-0 rounded-full border-0 bg-transparent p-0 outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
            disabled={avatarUploading || loading}
            onClick={() => avatarInputRef.current?.click()}
            aria-label={t('profile.uploadAvatarAria')}
          >
            <span className='relative inline-flex h-20 w-20 shrink-0'>
              <Avatar className='h-20 w-20 bg-muted'>
                {user?.avatar ? (
                  <AvatarImage src={user.avatar} alt='' />
                ) : null}
                <AvatarFallback className='text-lg font-medium'>
                  {user?.nickname ? initialsFromNickname(user.nickname) : '?'}
                </AvatarFallback>
              </Avatar>
              <span
                className='pointer-events-none absolute inset-0 z-1 rounded-full bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-disabled:opacity-0'
                aria-hidden
              />
              <span
                className='pointer-events-none absolute bottom-0 right-0 z-10 flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm'
                aria-hidden
              >
                <PlusIcon className='size-3.5' />
              </span>
            </span>
            {avatarUploading && (
              <div className='pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-background/70'>
                <Loader2 className='h-7 w-7 animate-spin text-muted-foreground' />
              </div>
            )}
          </button>
        </div>

        <div className='min-w-0 flex-1 space-y-6'>
          <FormField
            control={form.control}
            name='nickname'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('profile.nickname')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('profile.nicknamePlaceholder')}
                    {...field}
                    onBlur={() => {
                      field.onBlur()
                      void handleNicknameBlur()
                    }}
                    disabled={loading}
                  />
                </FormControl>
                <FormDescription>
                  {t('profile.nicknameHint')}
                  {loading && (
                    <span className='ml-2 text-muted-foreground'>
                      {t('profile.saving')}
                    </span>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </Form>
  )
}
