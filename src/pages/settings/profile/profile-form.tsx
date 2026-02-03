import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
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
import { useAuth } from '@/contexts/auth-context'
import { userApi } from '@/api/user'

const profileFormSchema = z.object({
  nickname: z
    .string()
    .min(2, '昵称长度至少为 2 个字符')
    .max(20, '昵称长度不能超过 20 个字符'),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nickname: '',
    },
  })

  useEffect(() => {
    if (user?.nickname) {
      form.reset({
        nickname: user.nickname,
      })
    }
  }, [user, form])

  async function onSubmit(data: ProfileFormValues) {
    if (!user) return
    
    setLoading(true)
    try {
      await userApi.updateUserInfo({
        nickname: data.nickname,
      })
      
      updateUser({
        ...user,
        nickname: data.nickname,
      })
      
      toast.success('昵称修改成功')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='nickname'
          render={({ field }) => (
            <FormItem>
              <FormLabel>昵称</FormLabel>
              <FormControl>
                <Input placeholder='请输入昵称' {...field} />
              </FormControl>
              <FormDescription>
                这是您的公开显示名称，长度为 2-20 个字符
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className='pt-4'>
          <Button type='submit' disabled={loading}>
            {loading ? '保存中...' : '保存设置'}
          </Button>
        </div>
      </form>
    </Form>
  )
}