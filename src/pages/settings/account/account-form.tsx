import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
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
import { Separator } from '@/components/ui/separator'

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, '请输入当前密码'),
  newPassword: z
    .string()
    .min(6, '新密码至少需要6个字符')
    .max(32, '新密码不能超过32个字符'),
  confirmPassword: z.string().min(1, '请确认新密码'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
})

const changeEmailSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码以验证身份'),
})

type ChangePasswordValues = z.infer<typeof changePasswordSchema>
type ChangeEmailValues = z.infer<typeof changeEmailSchema>

export function AccountForm() {
  const { user, updateUser } = useAuth()
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showEmailPassword, setShowEmailPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isChangingEmail, setIsChangingEmail] = useState(false)

  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const emailForm = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      email: user?.email || '',
      password: '',
    },
  })

  async function onPasswordSubmit(data: ChangePasswordValues) {
    setIsChangingPassword(true)
    try {
      await userApi.changePassword(data)
      toast.success('密码修改成功')
      passwordForm.reset()
    } finally {
      setIsChangingPassword(false)
    }
  }

  async function onEmailSubmit(data: ChangeEmailValues) {
    if (!user) return
    
    setIsChangingEmail(true)
    try {
      await userApi.updateUserInfo({ email: data.email })
      
      updateUser({
        ...user,
        email: data.email,
      })
      
      toast.success('邮箱修改成功')
      emailForm.setValue('password', '')
    } finally {
      setIsChangingEmail(false)
    }
  }

  return (
    <div className='space-y-8'>
      {/* 修改密码 */}
      <div className='space-y-4'>
        <div>
          <h4 className='text-base font-medium'>修改密码</h4>
          <p className='text-sm text-muted-foreground'>
            定期更新您的密码以保护账户安全
          </p>
        </div>
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className='space-y-4'>
            <FormField
              control={passwordForm.control}
              name='oldPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>当前密码</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showOldPassword ? 'text' : 'password'}
                        placeholder='请输入当前密码'
                        {...field}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
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
            <FormField
              control={passwordForm.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>新密码</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder='请输入新密码'
                        {...field}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
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
                  <FormDescription>
                    密码长度为6-32个字符
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>确认新密码</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder='请再次输入新密码'
                        {...field}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
            <Button type='submit' disabled={isChangingPassword}>
              {isChangingPassword && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              修改密码
            </Button>
          </form>
        </Form>
      </div>

      <Separator />

      {/* 修改邮箱 */}
      <div className='space-y-4'>
        <div>
          <h4 className='text-base font-medium'>修改邮箱</h4>
          <p className='text-sm text-muted-foreground'>
            更新您的邮箱地址，用于接收通知和找回密码
          </p>
        </div>
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className='space-y-4'>
            <FormField
              control={emailForm.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱地址</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='请输入新的邮箱地址'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    当前邮箱：{user?.email || '未设置'}
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
                  <FormLabel>确认密码</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showEmailPassword ? 'text' : 'password'}
                        placeholder='请输入密码以验证身份'
                        {...field}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
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
            <Button type='submit' disabled={isChangingEmail}>
              {isChangingEmail && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              修改邮箱
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
