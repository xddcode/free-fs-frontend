import { useState } from 'react'
import { userApi } from '@/api'
import { useAuth } from '@/contexts/auth-context'
import { LoginParams } from '@/types/user'
import { User, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { setToken } from '@/utils/auth'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

interface Props {
  onSwitchForm: (form: 'login' | 'register' | 'forgotPassword') => void
}

export default function LoginFormContent({ onSwitchForm }: Props) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<LoginParams>({
    username: '',
    password: '',
    isRemember: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    try {
      // 1. 登录获取 token
      const res = await userApi.login(formData)
      const { accessToken } = res

      // 2. 先临时保存 token 到 auth utils（这样后续请求才能带上 Authorization header）
      setToken(accessToken, formData.isRemember)

      // 3. 获取完整的用户信息
      const userInfo = await userApi.getUserInfo()

      // 4. 一次性保存 token 和用户信息到 context
      await login(accessToken, userInfo, formData.isRemember)

      toast.success('操作成功')
      navigate('/')
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = (platform: string) => {
    toast.info(`${platform} 登录...`)
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='space-y-2 text-center'>
        <h3 className='text-2xl font-bold tracking-tight'>欢迎回来</h3>
        <p className='text-sm text-muted-foreground'>登录你的 Free Fs 账号</p>
      </div>

      <div className='space-y-3'>
        <div className='relative'>
          <User className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            id='username'
            type='text'
            placeholder='请输入用户名'
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className='h-11 pl-10'
            required
          />
        </div>
      </div>

      <div className='space-y-3'>
        <div className='relative'>
          <Lock className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            id='password'
            type='password'
            placeholder='请输入密码'
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className='h-11 pl-10'
            required
          />
        </div>
      </div>

      <div className='flex items-center space-x-2'>
        <Checkbox
          id='remember'
          checked={formData.isRemember}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isRemember: checked as boolean })
          }
        />
        <label
          htmlFor='remember'
          className='cursor-pointer text-sm text-muted-foreground select-none'
        >
          记住我
        </label>
      </div>

      <Button type='submit' className='h-11 w-full' disabled={loading}>
        {loading ? '登录中...' : '登录'}
      </Button>

      <div className='-mt-2 flex items-center justify-start'>
        <button
          type='button'
          onClick={() => onSwitchForm('forgotPassword')}
          className='text-sm text-muted-foreground underline-offset-2 hover:underline'
        >
          忘记密码
        </button>
      </div>

      <div className='relative'>
        <Separator />
        <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground'>
          或使用以下方式继续
        </span>
      </div>

      <div className='flex flex-wrap items-center justify-center gap-7'>
        <button
          type='button'
          onClick={() => handleSocialLogin('微信')}
          className='inline-flex shrink-0 border-0 bg-transparent p-0 shadow-none transition hover:opacity-85 focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none'
        >
          <img
            src='/svg/wechat.svg'
            alt=''
            className='size-[32px] object-contain'
            aria-hidden
          />
          <span className='sr-only'>使用微信登录</span>
        </button>
        <button
          type='button'
          onClick={() => handleSocialLogin('Gitee')}
          className='inline-flex shrink-0 border-0 bg-transparent p-0 shadow-none transition hover:opacity-85 focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none'
        >
          <img
            src='/svg/gitee.svg'
            alt=''
            className='size-[32px] object-contain'
            aria-hidden
          />
          <span className='sr-only'>使用 Gitee 登录</span>
        </button>
        <button
          type='button'
          onClick={() => handleSocialLogin('GitHub')}
          className='inline-flex shrink-0 border-0 bg-transparent p-0 shadow-none transition hover:opacity-85 focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none'
        >
          <img
            src='/svg/github.svg'
            alt=''
            className='size-[32px] object-contain'
            aria-hidden
          />
          <span className='sr-only'>使用 GitHub 登录</span>
        </button>
      </div>

      <p className='text-center text-sm text-muted-foreground'>
        还没有账号？{' '}
        <button
          type='button'
          className='underline underline-offset-2 hover:text-foreground'
          onClick={() => onSwitchForm('register')}
        >
          立即注册
        </button>
      </p>
    </form>
  )
}
