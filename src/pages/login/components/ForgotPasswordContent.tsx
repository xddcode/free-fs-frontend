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
    <form onSubmit={handleSubmit} className='mt-8 space-y-4'>
      {/* 邮箱 */}
      <div className='relative'>
        <Mail className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          type='email'
          placeholder='邮箱'
          value={formData.mail}
          onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
          className='pl-10'
          required
        />
      </div>

      {/* 验证码 */}
      <div className='relative'>
        <Shield className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          type='text'
          placeholder='请输入验证码'
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          maxLength={6}
          className='pr-28 pl-10'
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

      {/* 新密码 */}
      <div className='relative'>
        <Lock className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          type='password'
          placeholder='新密码'
          value={formData.newPassword}
          onChange={(e) =>
            setFormData({ ...formData, newPassword: e.target.value })
          }
          className='pl-10'
          required
          minLength={6}
        />
      </div>

      {/* 确认密码 */}
      <div className='relative'>
        <Lock className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          type='password'
          placeholder='确认新密码'
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          className='pl-10'
          required
          minLength={6}
        />
      </div>

      {/* 重置密码按钮 */}
      <Button type='submit' className='w-full' disabled={loading}>
        {loading ? '重置...' : '重置'}
      </Button>

      {/* 返回登录 */}
      <Button
        type='button'
        variant='ghost'
        className='w-full text-muted-foreground'
        onClick={() => onSwitchForm('login')}
      >
        返回登录
      </Button>
    </form>
  )
}
