import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { userApi } from '@/api'
import { useAuth } from '@/contexts/auth-context'
import type { LoginParams, LoginType } from '@/types/user'
import { User, Mail, Lock, KeyRound } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { setToken } from '@/utils/auth'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface Props {
  onSwitchForm: (form: 'login' | 'register' | 'forgotPassword') => void
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getSafeRedirectPath(searchParams: URLSearchParams): string | null {
  const raw = searchParams.get('redirect')
  if (!raw) return null
  try {
    const decoded = decodeURIComponent(raw)
    if (!decoded.startsWith('/') || decoded.startsWith('//')) return null
    return decoded
  } catch {
    return null
  }
}

export default function LoginFormContent({ onSwitchForm }: Props) {
  const { t } = useTranslation('login')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [loginType, setLoginType] = useState<LoginType>('password')
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [isRemember, setIsRemember] = useState(true)
  const [codeSending, setCodeSending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // 获取URL中的邮箱参数（来自邀请流程）
  const suggestedEmail = searchParams.get('email')

  useEffect(() => {
    if (countdown <= 0) return
    const t = window.setInterval(() => {
      setCountdown((c) => (c <= 1 ? 0 : c - 1))
    }, 1000)
    return () => window.clearInterval(t)
  }, [countdown])

  const handleSendCode = async () => {
    const mail = account.trim()
    if (!emailRegex.test(mail)) {
      toast.error(t('toast.enterValidEmail'))
      return
    }
    setCodeSending(true)
    try {
      await userApi.sendLoginEmailCode(mail)
      toast.success(t('toast.codeSent'))
      setCountdown(60)
    } catch {
      // 由拦截器提示
    } finally {
      setCodeSending(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const acc = account.trim()
    if (!acc) {
      toast.error(
        loginType === 'email_code'
          ? t('toast.enterEmail')
          : t('toast.enterUsernameOrEmail')
      )
      return
    }

    if (loginType === 'password') {
      if (!password) {
        toast.error(t('toast.enterPassword'))
        return
      }
    } else {
      if (!emailRegex.test(acc)) {
        toast.error(t('toast.useEmailLogin'))
        return
      }
      if (!emailCode.trim()) {
        toast.error(t('toast.enterVerificationCode'))
        return
      }
    }

    const payload: LoginParams = {
      loginType,
      account: acc,
      password: loginType === 'password' ? password : emailCode.trim(),
      isRemember,
    }

    setLoading(true)
    try {
      const res = await userApi.login(payload)
      const { accessToken } = res

      setToken(accessToken, isRemember)

      const userInfo = await userApi.getUserInfo()

      await login(accessToken, userInfo, isRemember)

      toast.success(t('toast.loginSuccess'))
      const next = getSafeRedirectPath(searchParams) ?? '/'
      navigate(next, { replace: true })
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = (platform: string) => {
    toast.info(t('toast.socialLoginPending', { platform }))
  }

  const toggleLoginType = () => {
    setLoginType((t) => (t === 'password' ? 'email_code' : 'password'))
    setPassword('')
    setEmailCode('')
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='space-y-2 text-center'>
        <h3 className='text-2xl font-bold tracking-tight'>{t('welcomeBack')}</h3>
        <p className='text-sm text-muted-foreground'>{t('loginAccount')}</p>
      </div>

      {/* 邀请邮箱提示 */}
      {suggestedEmail && (
        <div className='rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800'>
          <p className='font-medium'>{t('inviteEmailNotice')}</p>
          <p className='mt-1 text-xs text-blue-600'>
            {t('useEmail')}: <strong>{suggestedEmail}</strong>
          </p>
        </div>
      )}

      <div className='space-y-3'>
        <div className='relative'>
          {loginType === 'password' ? (
            <User className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          ) : (
            <Mail className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          )}
          <Input
            id='account'
            type={loginType === 'email_code' ? 'email' : 'text'}
            inputMode={loginType === 'email_code' ? 'email' : undefined}
            placeholder={
              loginType === 'password'
                ? t('placeholderUsernameOrEmail')
                : t('placeholderEmail')
            }
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className='h-11 pl-10'
            autoComplete={
              loginType === 'password' ? 'username' : 'email'
            }
            required
          />
        </div>
      </div>

      {loginType === 'password' ? (
        <div className='space-y-3'>
          <div className='relative'>
            <Lock className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              id='password'
              type='password'
              placeholder={t('placeholderPassword')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='h-11 pl-10'
              autoComplete='current-password'
              required
            />
          </div>
        </div>
      ) : (
        <div className='space-y-3'>
          <div className='flex gap-2'>
            <div className='relative min-w-0 flex-1'>
              <KeyRound className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                id='email-code'
                type='text'
                inputMode='numeric'
                autoComplete='one-time-code'
                placeholder={t('placeholderEmailCode')}
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
                className='h-11 pl-10'
                required
              />
            </div>
            <Button
              type='button'
              variant='outline'
              className='h-11 shrink-0 px-3'
              disabled={
                codeSending || countdown > 0 || !account.trim()
              }
              onClick={handleSendCode}
            >
              {countdown > 0
                ? t('codeCountdown', { countdown })
                : t('getVerificationCode')}
            </Button>
          </div>
        </div>
      )}

      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center space-x-2'>
          <Checkbox
            id='remember'
            checked={isRemember}
            onCheckedChange={(checked) =>
              setIsRemember(checked as boolean)
            }
          />
          <label
            htmlFor='remember'
            className='cursor-pointer text-sm text-muted-foreground select-none'
          >
            {t('rememberMe')}
          </label>
        </div>
        <button
          type='button'
          onClick={toggleLoginType}
          className={cn(
            'shrink-0 text-sm text-primary underline-offset-4 hover:underline'
          )}
        >
          {loginType === 'password' ? t('emailCodeLogin') : t('passwordLogin')}
        </button>
      </div>

      <Button type='submit' className='h-11 w-full' disabled={loading}>
        {loading ? t('loggingIn') : t('login')}
      </Button>

      <div className='-mt-2 flex items-center justify-start'>
        <button
          type='button'
          onClick={() => onSwitchForm('forgotPassword')}
          className='text-sm text-muted-foreground underline-offset-2 hover:underline'
        >
          {t('forgotPassword')}
        </button>
      </div>

      <div className='relative'>
        <Separator />
        <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground'>
          {t('orContinueWith')}
        </span>
      </div>

      <div className='flex flex-wrap items-center justify-center gap-7'>
        <button
          type='button'
          onClick={() => handleSocialLogin(t('socialWechat'))}
          className='inline-flex shrink-0 border-0 bg-transparent p-0 shadow-none transition hover:opacity-85 focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none'
        >
          <img
            src='/svg/wechat.svg'
            alt=''
            className='size-[32px] object-contain'
            aria-hidden
          />
          <span className='sr-only'>{t('loginWithWechat')}</span>
        </button>
        <button
          type='button'
          onClick={() => handleSocialLogin(t('socialGitee'))}
          className='inline-flex shrink-0 border-0 bg-transparent p-0 shadow-none transition hover:opacity-85 focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none'
        >
          <img
            src='/svg/gitee.svg'
            alt=''
            className='size-[32px] object-contain'
            aria-hidden
          />
          <span className='sr-only'>{t('loginWithGitee')}</span>
        </button>
        <button
          type='button'
          onClick={() => handleSocialLogin(t('socialGithub'))}
          className='inline-flex shrink-0 border-0 bg-transparent p-0 shadow-none transition hover:opacity-85 focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none'
        >
          <img
            src='/svg/github.svg'
            alt=''
            className='size-[32px] object-contain'
            aria-hidden
          />
          <span className='sr-only'>{t('loginWithGithub')}</span>
        </button>
      </div>

      <p className='text-center text-sm text-muted-foreground'>
        {t('noAccount')}{' '}
        <button
          type='button'
          className='underline underline-offset-2 hover:text-foreground'
          onClick={() => onSwitchForm('register')}
        >
          {t('registerNow')}
        </button>
      </p>
    </form>
  )
}
