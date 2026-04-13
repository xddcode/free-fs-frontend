import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getAppLang, type AppLang } from '@/i18n'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSidebar } from '@/components/ui/sidebar'
import { LAYOUT_STORAGE_KEY } from '@/components/layout/app-layout'
import { useTheme } from '@/components/theme-provider'
import { SettingsBlock, SettingsRow } from '../components/settings-row'

type AppearanceFormValues = {
  theme: 'light' | 'dark'
  language: AppLang
  layout: 'default' | 'compact'
}

function getInitialLayout(): 'default' | 'compact' {
  if (typeof window === 'undefined') return 'default'
  return (
    localStorage.getItem(LAYOUT_STORAGE_KEY) === 'compact'
      ? 'compact'
      : 'default'
  ) as 'default' | 'compact'
}

export function AppearanceForm() {
  const { t } = useTranslation('settings')
  const { i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { setOpen, open } = useSidebar()

  const appearanceFormSchema = React.useMemo(
    () =>
      z.object({
        theme: z.enum(['light', 'dark'], {
          message: t('appearance.validation.theme'),
        }),
        language: z.enum(['zh', 'en'], {
          message: t('appearance.validation.language'),
        }),
        layout: z.enum(['default', 'compact'], {
          message: t('appearance.validation.layout'),
        }),
      }),
    [t]
  )

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: (theme as 'light' | 'dark') || 'light',
      language: getAppLang(),
      layout: getInitialLayout(),
    },
  })

  // 语言从别处切换（如登录页）后同步到表单
  React.useEffect(() => {
    form.setValue('language', getAppLang())
  }, [i18n.language, form])

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

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setTheme(theme, false)
    toast.success(t('appearance.themeUpdated'))
  }

  const handleLayoutChange = (layout: 'default' | 'compact') => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, layout)
    setOpen(layout === 'default')
    toast.success(t('appearance.layoutUpdated'))
  }

  const handleLanguageChange = async (lang: AppLang) => {
    await i18n.changeLanguage(lang)
    // changeLanguage 完成后再用 i18n.t，否则 toast 仍是切换前的语言
    toast.success(
      i18n.t('appearance.languageUpdated', { ns: 'settings' })
    )
  }

  return (
    <Form {...form}>
      <div>
        <div className='divide-y divide-border'>
          <FormField
            control={form.control}
            name='language'
            render={({ field }) => (
              <FormItem className='space-y-0'>
                <SettingsRow
                  label={t('appearance.languageLabel')}
                  description={t('appearance.languageDescription')}
                >
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value)
                      void handleLanguageChange(value as AppLang)
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className='h-11 w-fit max-w-full self-end bg-background'>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='zh'>
                        {t('appearance.langZh')}
                      </SelectItem>
                      <SelectItem value='en'>
                        {t('appearance.langEn')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsRow>
                <FormMessage className='pt-1' />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='theme'
            render={({ field }) => (
              <FormItem className='space-y-0'>
                <SettingsBlock
                  label={t('appearance.themeLabel')}
                  description={t('appearance.themeDescription')}
                >
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value)
                      handleThemeChange(value as 'light' | 'dark')
                    }}
                    value={field.value}
                    className='grid w-full max-w-2xl grid-cols-2 gap-4 sm:gap-6'
                  >
                    <FormItem>
                      <FormLabel className='cursor-pointer [&:has([data-state=checked])_.theme-card]:border-primary'>
                        <FormControl>
                          <RadioGroupItem value='light' className='sr-only' />
                        </FormControl>
                        <div className='space-y-2'>
                          <div className='theme-card h-32 items-center rounded-lg border-2 border-muted p-3 transition-colors hover:border-accent'>
                            <div className='flex h-full flex-col justify-center space-y-2 rounded-sm bg-[#ecedef] p-3'>
                              <div className='space-y-2 rounded-md bg-white p-3 shadow-sm'>
                                <div className='h-2.5 w-[120px] rounded-lg bg-[#ecedef]' />
                                <div className='h-2.5 w-[150px] rounded-lg bg-[#ecedef]' />
                              </div>
                            </div>
                          </div>
                          <span className='block w-full text-center font-normal'>
                            {t('appearance.light')}
                          </span>
                        </div>
                      </FormLabel>
                    </FormItem>
                    <FormItem>
                      <FormLabel className='cursor-pointer [&:has([data-state=checked])_.theme-card]:border-primary'>
                        <FormControl>
                          <RadioGroupItem value='dark' className='sr-only' />
                        </FormControl>
                        <div className='space-y-2'>
                          <div className='theme-card h-32 items-center rounded-lg border-2 border-muted bg-popover p-3 transition-colors hover:bg-accent hover:text-accent-foreground'>
                            <div className='flex h-full flex-col justify-center space-y-2 rounded-sm bg-slate-950 p-3'>
                              <div className='space-y-2 rounded-md bg-slate-800 p-3 shadow-sm'>
                                <div className='h-2.5 w-[120px] rounded-lg bg-slate-400' />
                                <div className='h-2.5 w-[150px] rounded-lg bg-slate-400' />
                              </div>
                            </div>
                          </div>
                          <span className='block w-full text-center font-normal'>
                            {t('appearance.dark')}
                          </span>
                        </div>
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </SettingsBlock>
                <FormMessage className='pt-2 pb-1' />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='layout'
            render={({ field }) => (
              <FormItem className='space-y-0'>
                <SettingsBlock
                  label={t('appearance.layoutLabel')}
                  description={t('appearance.layoutDescription')}
                >
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value)
                      handleLayoutChange(value as 'default' | 'compact')
                    }}
                    value={field.value}
                    className='grid w-full max-w-2xl grid-cols-2 gap-4 sm:gap-6'
                  >
                    <FormItem>
                      <FormLabel className='cursor-pointer [&:has([data-state=checked])_.layout-card]:border-primary'>
                        <FormControl>
                          <RadioGroupItem value='default' className='sr-only' />
                        </FormControl>
                        <div className='space-y-2'>
                          <div className='layout-card items-center overflow-hidden rounded-lg border-2 border-muted transition-colors hover:border-accent'>
                            <div className='flex h-32 gap-3 bg-muted/30 p-4'>
                              {/* 侧边栏 - 深色 */}
                              <div className='flex w-16 flex-col gap-2 rounded-md bg-foreground/80 p-2.5'>
                                <div className='flex items-center gap-1'>
                                  <div className='h-3 w-3 rounded-full bg-background' />
                                  <div className='h-1 flex-1 rounded bg-background/80' />
                                </div>
                                <div className='h-1.5 w-full rounded bg-background/60' />
                                <div className='h-1.5 w-full rounded bg-background/60' />
                                <div className='h-1.5 w-full rounded bg-background/60' />
                              </div>
                              {/* 主内容区 */}
                              <div className='flex flex-1 gap-3'>
                                {/* 左侧内容 */}
                                <div className='flex-1 space-y-2'>
                                  <div className='h-2 w-full rounded bg-foreground/70' />
                                  <div className='h-1.5 w-2/3 rounded bg-foreground/40' />
                                  <div className='h-1.5 w-1/2 rounded bg-foreground/40' />
                                  <div className='mt-3 h-10 w-full rounded bg-foreground/30' />
                                  {/* 柱状图 */}
                                  <div className='flex h-6 items-end gap-1'>
                                    <div className='h-3 w-2.5 rounded-sm bg-foreground/40' />
                                    <div className='h-4 w-2.5 rounded-sm bg-foreground/40' />
                                    <div className='h-5 w-2.5 rounded-sm bg-foreground/40' />
                                    <div className='h-6 w-2.5 rounded-sm bg-foreground/40' />
                                  </div>
                                </div>
                                {/* 右侧圆形图表 */}
                                <div className='flex w-16 items-center justify-center'>
                                  <div className='relative h-14 w-14'>
                                    <div className='absolute inset-0 rounded-full bg-foreground/50' />
                                    <div
                                      className='absolute inset-0 rounded-full bg-foreground/70'
                                      style={{
                                        clipPath:
                                          'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)',
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className='block w-full text-center font-normal'>
                            {t('appearance.layoutDefault')}
                          </span>
                        </div>
                      </FormLabel>
                    </FormItem>
                    <FormItem>
                      <FormLabel className='cursor-pointer [&:has([data-state=checked])_.layout-card]:border-primary'>
                        <FormControl>
                          <RadioGroupItem value='compact' className='sr-only' />
                        </FormControl>
                        <div className='space-y-2'>
                          <div className='layout-card items-center overflow-hidden rounded-lg border-2 border-muted transition-colors hover:border-accent'>
                            <div className='flex h-32 gap-3 bg-muted/30 p-4'>
                              {/* 紧凑侧边栏 - 浅色 */}
                              <div className='flex w-8 flex-col items-center gap-2 rounded-md bg-foreground/20 p-1.5'>
                                <div className='h-3 w-3 rounded-full bg-foreground/50' />
                                <div className='h-2 w-2 rounded-full bg-foreground/30' />
                                <div className='h-2 w-2 rounded-full bg-foreground/30' />
                                <div className='h-2 w-2 rounded-full bg-foreground/30' />
                                <div className='h-2 w-2 rounded-full bg-foreground/30' />
                              </div>
                              {/* 主内容区 */}
                              <div className='flex flex-1 gap-3'>
                                {/* 左侧内容 */}
                                <div className='flex-1 space-y-2'>
                                  <div className='h-2 w-full rounded bg-foreground/40' />
                                  <div className='h-1.5 w-2/3 rounded bg-foreground/25' />
                                  <div className='h-1.5 w-1/2 rounded bg-foreground/25' />
                                  <div className='mt-3 h-10 w-full rounded bg-foreground/20' />
                                  {/* 柱状图 */}
                                  <div className='flex h-6 items-end gap-1'>
                                    <div className='h-3 w-2.5 rounded-sm bg-foreground/30' />
                                    <div className='h-4 w-2.5 rounded-sm bg-foreground/30' />
                                    <div className='h-5 w-2.5 rounded-sm bg-foreground/30' />
                                    <div className='h-6 w-2.5 rounded-sm bg-foreground/30' />
                                  </div>
                                </div>
                                {/* 右侧圆形图表 */}
                                <div className='flex w-16 items-center justify-center'>
                                  <div className='relative h-14 w-14'>
                                    <div className='absolute inset-0 rounded-full bg-foreground/30' />
                                    <div
                                      className='absolute inset-0 rounded-full bg-foreground/50'
                                      style={{
                                        clipPath:
                                          'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)',
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className='block w-full text-center font-normal'>
                            {t('appearance.layoutCompact')}
                          </span>
                        </div>
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </SettingsBlock>
                <FormMessage className='pt-2 pb-1' />
              </FormItem>
            )}
          />
        </div>
      </div>
    </Form>
  )
}
