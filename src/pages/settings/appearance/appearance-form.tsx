import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import React from 'react'
import { useTheme } from '@/components/theme-provider'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useSidebar } from '@/components/ui/sidebar'
import { LAYOUT_STORAGE_KEY } from '@/components/layout/app-layout'

const appearanceFormSchema = z.object({
  theme: z.enum(['light', 'dark'], {
    message: 'Please select a theme.',
  }),
  layout: z.enum(['default', 'compact'], {
    message: '请选择布局',
  }),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

function getInitialLayout(): 'default' | 'compact' {
  if (typeof window === 'undefined') return 'default'
  return (localStorage.getItem(LAYOUT_STORAGE_KEY) === 'compact' ? 'compact' : 'default') as 'default' | 'compact'
}

export function AppearanceForm() {
  const { theme, setTheme } = useTheme()
  const { setOpen, open } = useSidebar()

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: (theme as 'light' | 'dark') || 'light',
      layout: getInitialLayout(),
    },
  })

  // 监听主题变化，同步更新表单
  React.useEffect(() => {
    if (theme === 'light' || theme === 'dark') {
      form.setValue('theme', theme)
    }
  }, [theme, form])

  // 监听侧边栏状态变化，同步更新表单
  React.useEffect(() => {
    const currentLayout = open ? 'default' : 'compact'
    form.setValue('layout', currentLayout)
  }, [open, form])

  // 监听 localStorage 变化（跨标签页同步）
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LAYOUT_STORAGE_KEY && e.newValue) {
        const newLayout = e.newValue === 'compact' ? 'compact' : 'default'
        form.setValue('layout', newLayout)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [form])

  function onSubmit(data: AppearanceFormValues) {
    setTheme(data.theme, false)
    localStorage.setItem(LAYOUT_STORAGE_KEY, data.layout)
    setOpen(data.layout === 'default')
    toast.success('外观设置已保存')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='theme'
          render={({ field }) => (
            <FormItem className='space-y-3'>
              <FormLabel>主题</FormLabel>
              <FormDescription>
                选择应用的显示主题
              </FormDescription>
              <FormMessage />
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className='grid max-w-2xl grid-cols-2 gap-8 pt-2'
              >
                <FormItem>
                  <FormLabel className='[&:has([data-state=checked])_.theme-card]:border-primary cursor-pointer'>
                    <FormControl>
                      <RadioGroupItem value='light' className='sr-only' />
                    </FormControl>
                    <div className='space-y-2'>
                      <div className='theme-card items-center rounded-lg border-2 border-muted p-3 hover:border-accent transition-colors h-32'>
                        <div className='space-y-2 rounded-sm bg-[#ecedef] p-3 h-full flex flex-col justify-center'>
                          <div className='space-y-2 rounded-md bg-white p-3 shadow-sm'>
                            <div className='h-2.5 w-[120px] rounded-lg bg-[#ecedef]' />
                            <div className='h-2.5 w-[150px] rounded-lg bg-[#ecedef]' />
                          </div>
                        </div>
                      </div>
                      <span className='block w-full text-center font-normal'>
                        明亮
                      </span>
                    </div>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className='[&:has([data-state=checked])_.theme-card]:border-primary cursor-pointer'>
                    <FormControl>
                      <RadioGroupItem value='dark' className='sr-only' />
                    </FormControl>
                    <div className='space-y-2'>
                      <div className='theme-card items-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground transition-colors h-32'>
                        <div className='space-y-2 rounded-sm bg-slate-950 p-3 h-full flex flex-col justify-center'>
                          <div className='space-y-2 rounded-md bg-slate-800 p-3 shadow-sm'>
                            <div className='h-2.5 w-[120px] rounded-lg bg-slate-400' />
                            <div className='h-2.5 w-[150px] rounded-lg bg-slate-400' />
                          </div>
                        </div>
                      </div>
                      <span className='block w-full text-center font-normal'>
                        暗黑
                      </span>
                    </div>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='layout'
          render={({ field }) => (
            <FormItem className='space-y-3'>
              <FormLabel>布局</FormLabel>
              <FormDescription>
                选择应用的侧边栏布局方式
              </FormDescription>
              <FormMessage />
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className='grid max-w-2xl grid-cols-2 gap-8 pt-2'
              >
                <FormItem>
                  <FormLabel className='[&:has([data-state=checked])_.layout-card]:border-primary cursor-pointer'>
                    <FormControl>
                      <RadioGroupItem value='default' className='sr-only' />
                    </FormControl>
                    <div className='space-y-2'>
                      <div className='layout-card items-center rounded-lg border-2 border-muted hover:border-accent transition-colors overflow-hidden'>
                        <div className='bg-muted/30 p-4 h-32 flex gap-3'>
                          {/* 侧边栏 - 深色 */}
                          <div className='w-16 bg-foreground/80 rounded-md p-2.5 flex flex-col gap-2'>
                            <div className='flex items-center gap-1'>
                              <div className='h-3 w-3 rounded-full bg-background' />
                              <div className='h-1 flex-1 rounded bg-background/80' />
                            </div>
                            <div className='h-1.5 w-full rounded bg-background/60' />
                            <div className='h-1.5 w-full rounded bg-background/60' />
                            <div className='h-1.5 w-full rounded bg-background/60' />
                          </div>
                          {/* 主内容区 */}
                          <div className='flex-1 flex gap-3'>
                            {/* 左侧内容 */}
                            <div className='flex-1 space-y-2'>
                              <div className='h-2 w-full rounded bg-foreground/70' />
                              <div className='h-1.5 w-2/3 rounded bg-foreground/40' />
                              <div className='h-1.5 w-1/2 rounded bg-foreground/40' />
                              <div className='mt-3 h-10 w-full rounded bg-foreground/30' />
                              {/* 柱状图 */}
                              <div className='flex items-end gap-1 h-6'>
                                <div className='w-2.5 h-3 rounded-sm bg-foreground/40' />
                                <div className='w-2.5 h-4 rounded-sm bg-foreground/40' />
                                <div className='w-2.5 h-5 rounded-sm bg-foreground/40' />
                                <div className='w-2.5 h-6 rounded-sm bg-foreground/40' />
                              </div>
                            </div>
                            {/* 右侧圆形图表 */}
                            <div className='w-16 flex items-center justify-center'>
                              <div className='relative h-14 w-14'>
                                <div className='absolute inset-0 rounded-full bg-foreground/50' />
                                <div className='absolute inset-0 rounded-full bg-foreground/70' style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)' }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className='block w-full text-center font-normal'>
                        默认
                      </span>
                    </div>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className='[&:has([data-state=checked])_.layout-card]:border-primary cursor-pointer'>
                    <FormControl>
                      <RadioGroupItem value='compact' className='sr-only' />
                    </FormControl>
                    <div className='space-y-2'>
                      <div className='layout-card items-center rounded-lg border-2 border-muted hover:border-accent transition-colors overflow-hidden'>
                        <div className='bg-muted/30 p-4 h-32 flex gap-3'>
                          {/* 紧凑侧边栏 - 浅色 */}
                          <div className='w-8 bg-foreground/20 rounded-md p-1.5 flex flex-col gap-2 items-center'>
                            <div className='h-3 w-3 rounded-full bg-foreground/50' />
                            <div className='h-2 w-2 rounded-full bg-foreground/30' />
                            <div className='h-2 w-2 rounded-full bg-foreground/30' />
                            <div className='h-2 w-2 rounded-full bg-foreground/30' />
                            <div className='h-2 w-2 rounded-full bg-foreground/30' />
                          </div>
                          {/* 主内容区 */}
                          <div className='flex-1 flex gap-3'>
                            {/* 左侧内容 */}
                            <div className='flex-1 space-y-2'>
                              <div className='h-2 w-full rounded bg-foreground/40' />
                              <div className='h-1.5 w-2/3 rounded bg-foreground/25' />
                              <div className='h-1.5 w-1/2 rounded bg-foreground/25' />
                              <div className='mt-3 h-10 w-full rounded bg-foreground/20' />
                              {/* 柱状图 */}
                              <div className='flex items-end gap-1 h-6'>
                                <div className='w-2.5 h-3 rounded-sm bg-foreground/30' />
                                <div className='w-2.5 h-4 rounded-sm bg-foreground/30' />
                                <div className='w-2.5 h-5 rounded-sm bg-foreground/30' />
                                <div className='w-2.5 h-6 rounded-sm bg-foreground/30' />
                              </div>
                            </div>
                            {/* 右侧圆形图表 */}
                            <div className='w-16 flex items-center justify-center'>
                              <div className='relative h-14 w-14'>
                                <div className='absolute inset-0 rounded-full bg-foreground/30' />
                                <div className='absolute inset-0 rounded-full bg-foreground/50' style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)' }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className='block w-full text-center font-normal'>
                        紧凑
                      </span>
                    </div>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>
          )}
        />

        <div className='pt-4'>
          <Button type='submit'>保存设置</Button>
        </div>
      </form>
    </Form>
  )
}
