import { useState, useEffect, useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/auth-context'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { userApi } from '@/api/user'
import { Button } from '@/components/ui/button'
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
import { DialogFooter } from '@/components/ui/dialog'

type ChangePasswordValues = {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

type SetPasswordValues = {
  newPassword: string
  confirmPassword: string
}

type ChangeEmailValues = {
  email: string
  password: string
}

const PASSWORD_FORM_ID = 'settings-password-form'
const EMAIL_FORM_ID = 'settings-email-form'

export function PasswordChangeForm({
  onSuccess,
  onCancel,
  mode = 'change',
}: {
  onSuccess?: () => void
  onCancel?: () => void
  mode?: 'change' | 'set'
}) {
  const { t } = useTranslation('settings')
  const { updateUser } = useAuth()
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const isSetMode = mode === 'set'

  const changePasswordSchema = useMemo(
    () =>
      z
        .object({
          oldPassword: z.string().min(1, t('account.validation.currentPwd')),
          newPassword: z
            .string()
            .min(6, t('account.validation.newPwdMin'))
            .max(32, t('account.validation.newPwdMax')),
          confirmPassword: z.string().min(1, t('account.validation.confirmPwd')),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          message: t('account.validation.pwdMismatch'),
          path: ['confirmPassword'],
        }),
    [t]
  )

  const setPasswordSchema = useMemo(
    () =>
      z
        .object({
          newPassword: z
            .string()
            .min(6, t('account.validation.newPwdMin'))
            .max(32, t('account.validation.newPwdMax')),
          confirmPassword: z.string().min(1, t('account.validation.confirmPwd')),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          message: t('account.validation.pwdMismatch'),
          path: ['confirmPassword'],
        }),
    [t]
  )

  const activePwdSchema = isSetMode ? setPasswordSchema : changePasswordSchema

  const passwordForm = useForm<ChangePasswordValues | SetPasswordValues>({
    resolver: zodResolver(activePwdSchema),
    defaultValues: isSetMode
      ? { newPassword: '', confirmPassword: '' }
      : { oldPassword: '', newPassword: '', confirmPassword: '' },
    mode: 'onChange',
  })

  const pwdValues = passwordForm.watch()
  const passwordCanSubmit = activePwdSchema.safeParse(pwdValues).success

  async function onPasswordSubmit(
    data: ChangePasswordValues | SetPasswordValues
  ) {
    setIsChangingPassword(true)
    try {
      if (isSetMode) {
        const d = data as SetPasswordValues
        await userApi.setPassword({
          newPassword: d.newPassword,
          confirmPassword: d.confirmPassword,
        })
        const fresh = await userApi.getUserInfo()
        updateUser(fresh)
        toast.success(t('account.pwdSetOk'))
      } else {
        await userApi.changePassword(data as ChangePasswordValues)
        toast.success(t('account.pwdChangeOk'))
      }
      passwordForm.reset()
      onSuccess?.()
    } catch {
      // 拦截器已提示
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <Form {...passwordForm}>
      <form
        id={PASSWORD_FORM_ID}
        onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
        className='space-y-4 pt-2'
      >
        {!isSetMode && (
          <FormField
            control={passwordForm.control}
            name='oldPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span className='relative top-0.5 text-red-500'>* </span>
                  {t('account.currentPassword')}
                </FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input
                      type={showOldPassword ? 'text' : 'password'}
                      placeholder={t('account.currentPasswordPh')}
                      {...field}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent'
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                      {showOldPassword ? (
                        <EyeOff className='h-4 w-4' />
                      ) : (
                        <Eye className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={passwordForm.control}
          name='newPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span className='relative top-0.5 text-red-500'>* </span>
                {t('account.newPassword')}
              </FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder={t('account.newPasswordPh')}
                    {...field}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent'
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormDescription>{t('account.passwordLengthHint')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={passwordForm.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span className='relative top-0.5 text-red-500'>* </span>
                {t('account.confirmPassword')}
              </FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('account.confirmPasswordPh')}
                    {...field}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent'
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
      <DialogFooter>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={isChangingPassword}
        >
          {t('account.cancel')}
        </Button>
        <Button
          type='submit'
          form={PASSWORD_FORM_ID}
          disabled={isChangingPassword || !passwordCanSubmit}
        >
          {isChangingPassword && (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          )}
          {isChangingPassword
            ? t('account.savingPwd')
            : isSetMode
              ? t('account.submitSetPwd')
              : t('account.submitSavePwd')}
        </Button>
      </DialogFooter>
    </Form>
  )
}

export function EmailChangeForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void
  onCancel?: () => void
}) {
  const { t } = useTranslation('settings')
  const { user, updateUser } = useAuth()
  const [showEmailPassword, setShowEmailPassword] = useState(false)
  const [isChangingEmail, setIsChangingEmail] = useState(false)

  const changeEmailSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t('account.validation.emailInvalid')),
        password: z.string().min(1, t('account.validation.verifyPwd')),
      }),
    [t]
  )

  const emailForm = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      email: user?.email || '',
      password: '',
    },
    mode: 'onChange',
  })

  const emailValues = emailForm.watch()
  const emailCanSave = changeEmailSchema.safeParse(emailValues).success

  useEffect(() => {
    if (user?.email) {
      emailForm.setValue('email', user.email)
    }
  }, [user?.email, emailForm])

  async function onEmailSubmit(data: ChangeEmailValues) {
    if (!user) return

    setIsChangingEmail(true)
    try {
      await userApi.updateUserInfo({ email: data.email })
      const fresh = await userApi.getUserInfo()
      updateUser(fresh)

      toast.success(t('account.emailOk'))
      emailForm.setValue('password', '')
      onSuccess?.()
    } finally {
      setIsChangingEmail(false)
    }
  }

  return (
    <Form {...emailForm}>
      <form
        id={EMAIL_FORM_ID}
        onSubmit={emailForm.handleSubmit(onEmailSubmit)}
        className='space-y-4 pt-2'
      >
        <FormField
          control={emailForm.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span className='relative top-0.5 text-red-500'>* </span>
                {t('account.newEmail')}
              </FormLabel>
              <FormControl>
                <Input
                  type='email'
                  placeholder={t('account.newEmailPh')}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t('account.currentEmail', {
                  email: user?.email || t('account.notSet'),
                })}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={emailForm.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span className='relative top-0.5 text-red-500'>* </span>
                {t('account.currentPassword')}
              </FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    type={showEmailPassword ? 'text' : 'password'}
                    placeholder={t('account.verifyPasswordPh')}
                    {...field}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent'
                    onClick={() => setShowEmailPassword(!showEmailPassword)}
                  >
                    {showEmailPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
      <DialogFooter>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={isChangingEmail}
        >
          {t('account.cancel')}
        </Button>
        <Button
          type='submit'
          form={EMAIL_FORM_ID}
          disabled={isChangingEmail || !emailCanSave}
        >
          {isChangingEmail && (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          )}
          {isChangingEmail ? t('account.savingEmail') : t('account.saveEmail')}
        </Button>
      </DialogFooter>
    </Form>
  )
}
