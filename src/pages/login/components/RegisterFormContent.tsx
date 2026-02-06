import { useState } from 'react'
import { userApi } from '@/api'
import { UserRegisterParams } from '@/types/user'
import { User, Lock, Mail, Pen } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  onSwitchForm: (form: 'login' | 'register' | 'forgotPassword') => void
}

export default function RegisterFormContent({ onSwitchForm }: Props) {
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
      toast.error('两次密码输入不一致')
      return
    }

    setLoading(true)
    try {
      await userApi.register(formData)
      toast.success('操作成功')
      setTimeout(() => {
        onSwitchForm('login')
      }, 1500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='mt-8 space-y-4'>
      {/* 账号 */}
      <div className='relative'>
        <User className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          type='text'
          placeholder='用户名'
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          className='pl-10'
          disabled={loading}
          required
        />
      </div>

      {/* 密码 */}
      <div className='relative'>
        <Lock className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          type='password'
          placeholder='密码'
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className='pl-10'
          disabled={loading}
          required
          minLength={6}
        />
      </div>

      {/* 确认密码 */}
      <div className='relative'>
        <Lock className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          type='password'
          placeholder='确认密码'
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          className='pl-10'
          disabled={loading}
          required
          minLength={6}
        />
      </div>

      {/* 邮箱 */}
      <div className='relative'>
        <Mail className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          type='email'
          placeholder='邮箱'
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className='pl-10'
          disabled={loading}
          required
        />
      </div>

      {/* 昵称 */}
      <div className='relative'>
        <Pen className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          type='text'
          placeholder='昵称'
          value={formData.nickname}
          onChange={(e) =>
            setFormData({ ...formData, nickname: e.target.value })
          }
          className='pl-10'
          disabled={loading}
        />
      </div>

      {/* 注册按钮 */}
      <Button type='submit' className='w-full' disabled={loading}>
        {loading ? '注册...' : '注册'}
      </Button>

      {/* 返回登录 */}
      <Button
        type='button'
        variant='ghost'
        className='w-full text-muted-foreground'
        onClick={() => onSwitchForm('login')}
        disabled={loading}
      >
        返回登录
      </Button>
    </form>
  )
}
