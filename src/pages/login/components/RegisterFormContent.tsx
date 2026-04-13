import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { userApi } from '@/api'
import { useAuth } from '@/contexts/auth-context'
import { UserRegisterParams } from '@/types/user'
import { User, Lock, Mail, Pen } from 'lucide-react'
import { toast } from 'sonner'
import { setToken } from '@/utils/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  onSwitchForm: (form: 'login' | 'register' | 'forgotPassword') => void
  inviteToken?: string
}

export default function RegisterFormContent({ onSwitchForm, inviteToken }: Props) {
  const { t } = useTranslation('login')
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UserRegisterParams>({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    nickname: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('toast.passwordMismatch'))
      return
    }

    const submitData = inviteToken
      ? { ...formData, inviteToken }
      : formData

    setLoading(true)
    try {
      await userApi.register(submitData)
      toast.success(t('toast.registerSuccess'))

      if (inviteToken) {
        // 有邀请 token：自动登录并进入邀请的工作空间
        try {
          const res = await userApi.login({
            loginType: 'password',
            account: formData.username,
            password: formData.password,
            isRemember: true,
          })
          setToken(res.accessToken, true)
          const userInfo = await userApi.getUserInfo()
          await login(res.accessToken, userInfo, true)
          navigate('/')
        } catch {
          onSwitchForm('login')
        }
      } else {
        // 无邀请：跳转登录页，登录后 needsWorkspaceSetup 会引导创建工作空间
        setTimeout(() => {
          onSwitchForm('login')
        }, 1500)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='space-y-2 text-center'>
        <h3 className='text-2xl font-bold tracking-tight'>{t('createAccount')}</h3>
        <p className='text-sm text-muted-foreground'>
          {inviteToken ? t('registerSubtitleInvite') : t('registerSubtitle')}
        </p>
      </div>

      <div className='space-y-3'>
        <div className='relative'>
          <User className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            id='register-username'
            type='text'
            placeholder={t('placeholderUsername')}
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className='h-11 pl-10'
            disabled={loading}
            required
          />
        </div>
      </div>

      <div className='space-y-3'>
        <div className='relative'>
          <Lock className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            id='register-password'
            type='password'
            placeholder={t('placeholderPassword')}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className='h-11 pl-10'
            disabled={loading}
            required
            minLength={6}
          />
        </div>
      </div>

      <div className='space-y-3'>
        <div className='relative'>
          <Lock className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            id='register-confirm-password'
            type='password'
            placeholder={t('placeholderConfirmPassword')}
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            className='h-11 pl-10'
            disabled={loading}
            required
            minLength={6}
          />
        </div>
      </div>

      <div className='space-y-3'>
        <div className='relative'>
          <Mail className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            id='register-email'
            type='email'
            placeholder={t('placeholderEmail')}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className='h-11 pl-10'
            disabled={loading}
            required
          />
        </div>
      </div>

      <div className='space-y-3'>
        <div className='relative'>
          <Pen className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            id='register-nickname'
            type='text'
            placeholder={t('placeholderNicknameOptional')}
            value={formData.nickname}
            onChange={(e) =>
              setFormData({ ...formData, nickname: e.target.value })
            }
            className='h-11 pl-10'
            disabled={loading}
          />
        </div>
      </div>

      <Button type='submit' className='h-11 w-full' disabled={loading}>
        {loading ? t('registering') : t('register')}
      </Button>

      <p className='text-center text-sm text-muted-foreground'>
        {t('hasAccount')}{' '}
        <button
          type='button'
          className='underline underline-offset-2 hover:text-foreground'
          onClick={() => onSwitchForm('login')}
          disabled={loading}
        >
          {t('backToLogin')}
        </button>
      </p>
    </form>
  )
}
