import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { InfoCircledIcon } from '@radix-ui/react-icons'
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
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { userApi } from '@/api/user'
import { useUserStore } from '@/store/user'

// 路径格式校验
const validatePath = (value: string) => {
  if (!value || !value.trim()) {
    return false
  }

  const path = value.trim()

  // Windows 路径格式
  const windowsAbsolutePathRegex =
    /^[a-zA-Z]:\\([\w\s\u4e00-\u9fa5\-().]+\\)*[\w\s\u4e00-\u9fa5\-().]*$/
  const windowsNetworkPathRegex =
    /^\\\\[\w\-.]+(\[\w\s\u4e00-\u9fa5\-().]+)+(\[\w\s\u4e00-\u9fa5\-().]+)*$/

  // Linux/Mac 路径格式
  const unixPathRegex = /^\/[\w\s\u4e00-\u9fa5\-./]*$/

  const isWindowsPath =
    windowsAbsolutePathRegex.test(path) || windowsNetworkPathRegex.test(path)
  const isUnixPath = unixPathRegex.test(path)

  if (!isWindowsPath && !isUnixPath) {
    return false
  }

  // Windows 路径检查非法字符
  if (isWindowsPath) {
    const illegalChars = /[<>"|?*]/
    const pathWithoutDrive = path.substring(path.indexOf(':') + 1)
    if (illegalChars.test(pathWithoutDrive)) {
      return false
    }
  }

  return true
}

const transferFormSchema = z.object({
  downloadLocation: z
    .string()
    .min(1, '请输入文件下载位置')
    .refine(validatePath, '路径格式不正确'),
  isDefaultDownloadLocation: z.boolean(),
  enableDownloadSpeedLimit: z.boolean(),
  downloadSpeedLimit: z.number().min(1).max(200).optional(),
  concurrentUploadQuantity: z.number().min(1).max(3),
  concurrentDownloadQuantity: z.number().min(1).max(3),
  chunkSize: z.number(),
})

type TransferFormValues = z.infer<typeof transferFormSchema>

export function TransferForm() {
  const [loading, setLoading] = useState(false)
  const { loadTransferSetting } = useUserStore()

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      downloadLocation: '',
      isDefaultDownloadLocation: false,
      enableDownloadSpeedLimit: false,
      downloadSpeedLimit: 5,
      concurrentUploadQuantity: 3,
      concurrentDownloadQuantity: 3,
      chunkSize: 5 * 1024 * 1024,
    },
  })

  const enableSpeedLimit = form.watch('enableDownloadSpeedLimit')

  // 加载设置
  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    setLoading(true)
    try {
      const settings = await userApi.getTransferSetting()

      form.reset({
        downloadLocation: settings.downloadLocation || '',
        isDefaultDownloadLocation: settings.isDefaultDownloadLocation === 1,
        enableDownloadSpeedLimit:
          settings.downloadSpeedLimit > 0,
        downloadSpeedLimit:
          settings.downloadSpeedLimit > 0 ? settings.downloadSpeedLimit : 5,
        concurrentUploadQuantity: settings.concurrentUploadQuantity || 3,
        concurrentDownloadQuantity: settings.concurrentDownloadQuantity || 3,
        chunkSize: settings.chunkSize || 5 * 1024 * 1024,
      })
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(data: TransferFormValues) {
    setLoading(true)
    try {
      await userApi.updateTransferSetting({
        downloadLocation: data.downloadLocation,
        isDefaultDownloadLocation: data.isDefaultDownloadLocation ? 1 : 0,
        downloadSpeedLimit: data.enableDownloadSpeedLimit
          ? data.downloadSpeedLimit || 5
          : -1,
        concurrentUploadQuantity: data.concurrentUploadQuantity,
        concurrentDownloadQuantity: data.concurrentDownloadQuantity,
        chunkSize: data.chunkSize,
      })
      toast.success('保存成功')
      // 重新加载设置到表单
      await loadSettings()
      // 更新用户 store 中的传输设置
      await loadTransferSetting()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* 文件下载位置 */}
        <FormField
          control={form.control}
          name='downloadLocation'
          render={({ field }) => (
            <FormItem>
              <FormLabel>文件下载位置</FormLabel>
              <div className='flex gap-2'>
                <FormControl>
                  <Input
                    placeholder='Windows: C:\Users\用户名\Desktop  |  Linux/Mac: /home/username/Desktop'
                    {...field}
                  />
                </FormControl>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='flex-shrink-0'
                      >
                        <InfoCircledIcon className='h-4 w-4' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side='left' className='max-w-xs'>
                      <p>请输入完整的文件夹路径</p>
                      <p>Windows 示例: C:\Users\用户名\Desktop</p>
                      <p>Linux/Mac 示例: /home/username/Desktop</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 默认下载路径 */}
        <FormField
          control={form.control}
          name='isDefaultDownloadLocation'
          render={({ field }) => (
            <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel>默认此路径为下载路径</FormLabel>
                <FormDescription>
                  如果不勾选，每次下载时会询问保存地址
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* 下载速率限制 */}
        <FormField
          control={form.control}
          name='enableDownloadSpeedLimit'
          render={({ field }) => (
            <FormItem className='space-y-3'>
              <FormLabel>下载速率限制</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value: string) => field.onChange(value === 'true')}
                  value={field.value ? 'true' : 'false'}
                  className='flex gap-4'
                >
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='false' />
                    <span className='text-sm'>不限制</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='true' />
                    <span className='text-sm'>上限</span>
                  </div>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        {enableSpeedLimit && (
          <FormField
            control={form.control}
            name='downloadSpeedLimit'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className='flex items-center gap-2'>
                    <Input
                      type='number'
                      min={1}
                      max={200}
                      className='w-32'
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                    <span className='text-sm text-muted-foreground'>
                      MB/s (可输入 1-200 之间的整数)
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 并发上传数量 */}
        <FormField
          control={form.control}
          name='concurrentUploadQuantity'
          render={({ field }) => (
            <FormItem>
              <FormLabel>同时上传数量</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={String(field.value)}
              >
                <FormControl>
                  <SelectTrigger className='w-[200px]'>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[1, 2, 3].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num}个
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                同时进行上传的文件数量
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 并发下载数量 */}
        <FormField
          control={form.control}
          name='concurrentDownloadQuantity'
          render={({ field }) => (
            <FormItem>
              <FormLabel>同时下载数量</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={String(field.value)}
              >
                <FormControl>
                  <SelectTrigger className='w-[200px]'>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[1, 2, 3].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num}个
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                同时进行下载的文件数量
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 分片大小 */}
        <FormField
          control={form.control}
          name='chunkSize'
          render={({ field }) => (
            <FormItem>
              <FormLabel>分片大小</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={String(field.value)}
              >
                <FormControl>
                  <SelectTrigger className='w-[200px]'>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={String(2 * 1024 * 1024)}>2 MB</SelectItem>
                  <SelectItem value={String(5 * 1024 * 1024)}>5 MB</SelectItem>
                  <SelectItem value={String(10 * 1024 * 1024)}>10 MB</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                上传文件时的分片大小，推荐设置 5 MB
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
