import { useState } from 'react'
import { userApi } from '@/api'
import { useAuth } from '@/contexts/auth-context'
import { LoginParams } from '@/types/user'
import { User, Lock, Github } from 'lucide-react'
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

      <div className='grid grid-cols-2 gap-3'>
        <Button
          variant='outline'
          type='button'
          className='h-10 gap-2'
          onClick={() => handleSocialLogin('微信')}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            aria-label='WeChat'
            role='img'
            viewBox='0 0 512 512'
            className='size-4'
          >
            <rect width='512' height='512' rx='15%' fill='#00c70a' />
            <path
              d='M402 369c23-17 38-42 38-70 0-51-50-92-111-92s-110 41-110 92 49 92 110 92c13 0 25-2 36-5 4-1 8 0 9 1l25 14c3 2 6 0 5-4l-6-22c0-3 2-5 4-6m-110-85a15 15 0 1 1 0-29 15 15 0 0 1 0 29m74 0a15 15 0 1 1 0-29 15 15 0 0 1 0 29'
              fill='#fff'
            />
            <path
              d='m205 105c-73 0-132 50-132 111 0 33 17 63 45 83 3 2 5 5 4 10l-7 24c-1 5 3 7 6 6l30-17c3-2 7-3 11-2 26 8 48 6 51 6-24-84 59-132 123-128-10-52-65-93-131-93m-44 93a18 18 0 1 1 0-35 18 18 0 0 1 0 35m89 0a18 18 0 1 1 0-35 18 18 0 0 1 0 35'
              fill='#fff'
            />
          </svg>
          <span className='text-sm'>微信</span>
          <span className='sr-only'>使用微信登录</span>
        </Button>
        <Button
          variant='outline'
          type='button'
          className='h-10 gap-2'
          onClick={() => handleSocialLogin('GitHub')}
        >
          <Github className='size-4' />
          <span className='text-sm'>GitHub</span>
          <span className='sr-only'>使用 GitHub 登录</span>
        </Button>
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
