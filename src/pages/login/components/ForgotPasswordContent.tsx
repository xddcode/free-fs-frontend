import { useState, useEffect } from 'react'
import { userApi } from '@/api'
import { ForgotPasswordParams } from '@/types/user'
import { Mail, Lock, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  onSwitchForm: (form: 'login' | 'register' | 'forgotPassword') => void
}

export default function ForgotPasswordContent({ onSwitchForm }: Props) {
  const [loading, setLoading] = useState(false)
  const [codeLoading, setCodeLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [formData, setFormData] = useState<ForgotPasswordParams>({
    mail: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendCode = async () => {
    if (!formData.mail) {
      toast.warning('请输入邮箱')
      return
    }

    setCodeLoading(true)
    try {
      await userApi.sendForgetPasswordCode(formData.mail)
      toast.success('验证码已发送到您的邮箱')
      setCountdown(60)
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setCodeLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 只验证密码一致性
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('两次密码输入不一致')
      return
    }

    setLoading(true)
    try {
      await userApi.updateForgetPassword(formData)
      toast.success('操作成功')
      setFormData({
        mail: '',
        code: '',
        newPassword: '',
        confirmPassword: '',
      })
      onSwitchForm('login')
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='space-y-2 text-center'>
        <h3 className='text-2xl font-bold tracking-tight'>找回密码</h3>
        <p className='text-sm text-muted-foreground'>通过邮箱验证码重置密码</p>
      </div>

      <div className='space-y-3'>
        <div className='relative'>
          <Mail className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            id='forgot-mail'
            type='email'
            placeholder='请输入邮箱'
            value={formData.mail}
            onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
            className='h-11 pl-10'
            required
          />
        </div>
      </div>

      <div className='space-y-3'>
        <div className='relative'>
          <Shield className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            id='forgot-code'
            type='text'
            placeholder='请输入验证码'
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            maxLength={6}
            className='h-11 pr-28 pl-10'
            required
          />
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='absolute top-1/2 right-1 h-8 -translate-y-1/2 text-xs'
            onClick={handleSendCode}
            disabled={countdown > 0 || codeLoading}
          >
            {countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
          </Button>
        </div>
      </div>

      <div className='space-y-3'>
        <div className='relative'>
          <Lock className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            id='forgot-new-password'
            type='password'
            placeholder='请输入新密码'
            value={formData.newPassword}
            onChange={(e) =>
              setFormData({ ...formData, newPassword: e.target.value })
            }
            className='h-11 pl-10'
            required
            minLength={6}
          />
        </div>
      </div>

      <div className='space-y-3'>
        <div className='relative'>
          <Lock className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            id='forgot-confirm-password'
            type='password'
            placeholder='请再次输入新密码'
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            className='h-11 pl-10'
            required
            minLength={6}
          />
        </div>
      </div>

      <Button type='submit' className='h-11 w-full' disabled={loading}>
        {loading ? '重置中...' : '重置密码'}
      </Button>

      <p className='text-center text-sm text-muted-foreground'>
        想起密码了？{' '}
        <button
          type='button'
          className='underline underline-offset-2 hover:text-foreground'
          onClick={() => onSwitchForm('login')}
        >
          返回登录
        </button>
      </p>
    </form>
  )
}
