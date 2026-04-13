import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { TransferSettingForm } from '@/types/transfer-setting'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormFieldStack, FormInlineOption } from '@/components/field-layout'

interface TransferSettingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function TransferSettingModal({
  open,
  onOpenChange,
}: TransferSettingModalProps) {
  const { t } = useTranslation('transfer')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<TransferSettingForm>({
    downloadLocation: '',
    isDefaultDownloadLocation: false,
    downloadSpeedLimit: 5,
    enableDownloadSpeedLimit: false,
    concurrentUploadQuantity: 3,
    concurrentDownloadQuantity: 3,
    chunkSize: 5 * 1024 * 1024,
  })

  useEffect(() => {
    if (open) {
      loadSettings()
    }
  }, [open])

  const loadSettings = async () => {
    setLoading(true)
    try {
      // TODO: 调用 API 加载设置
      // const response = await getTransferSetting();
      // setFormData(response.data);
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.downloadLocation) {
      toast.error(t('settings.toastPath'))
      return
    }

    setLoading(true)
    try {
      // TODO: 调用 API 保存设置
      // await updateTransferSetting(formData);
      toast.success(t('settings.toastSaveOk'))
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{t('settings.title')}</DialogTitle>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* 文件下载位置 */}
          <FormFieldStack>
            <Label htmlFor='downloadLocation'>{t('settings.downloadPath')}</Label>
            <Input
              id='downloadLocation'
              value={formData.downloadLocation}
              onChange={(e) =>
                setFormData({ ...formData, downloadLocation: e.target.value })
              }
              placeholder={t('settings.downloadPathPh')}
            />
          </FormFieldStack>

          {/* 默认下载路径 */}
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='isDefaultDownloadLocation'
              checked={formData.isDefaultDownloadLocation}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  isDefaultDownloadLocation: checked as boolean,
                })
              }
            />
            <Label
              htmlFor='isDefaultDownloadLocation'
              className='text-sm font-normal'
            >
              {t('settings.defaultPath')}
              <span className='ml-2 text-muted-foreground'>
                {t('settings.defaultPathHint')}
              </span>
            </Label>
          </div>

          {/* 下载速率限制 */}
          <FormFieldStack>
            <Label>{t('settings.speedLimit')}</Label>
            <div className='flex flex-wrap items-center gap-x-6 gap-y-2'>
              <RadioGroup
                value={
                  formData.enableDownloadSpeedLimit ? 'limited' : 'unlimited'
                }
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    enableDownloadSpeedLimit: value === 'limited',
                  })
                }
                className='flex flex-wrap gap-x-6 gap-y-2'
              >
                <FormInlineOption>
                  <RadioGroupItem value='unlimited' id='unlimited' />
                  <Label htmlFor='unlimited' className='font-normal'>
                    {t('settings.unlimited')}
                  </Label>
                </FormInlineOption>
                <FormInlineOption>
                  <RadioGroupItem value='limited' id='limited' />
                  <Label htmlFor='limited' className='font-normal'>
                    {t('settings.limited')}
                  </Label>
                </FormInlineOption>
              </RadioGroup>

              {formData.enableDownloadSpeedLimit && (
                <div className='flex items-center gap-2'>
                  <Input
                    type='number'
                    min={1}
                    max={200}
                    value={formData.downloadSpeedLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        downloadSpeedLimit: parseInt(e.target.value) || 5,
                      })
                    }
                    className='w-24'
                  />
                  <span className='text-sm text-muted-foreground'>MB/s</span>
                  <span className='text-sm text-muted-foreground'>
                    {t('settings.speedHint')}
                  </span>
                </div>
              )}
            </div>
          </FormFieldStack>

          {/* 并发限制 */}
          <FormFieldStack>
            <Label>{t('settings.concurrent')}</Label>
            <div className='flex items-center gap-4'>
              <span className='text-sm text-muted-foreground'>
                {t('settings.uploadConcurrency')}
              </span>
              <Select
                value={formData.concurrentUploadQuantity.toString()}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    concurrentUploadQuantity: parseInt(value),
                  })
                }
              >
                <SelectTrigger className='w-24'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {t('settings.countUnit', { n: num })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className='text-sm text-muted-foreground'>
                {t('settings.downloadConcurrency')}
              </span>
              <Select
                value={formData.concurrentDownloadQuantity.toString()}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    concurrentDownloadQuantity: parseInt(value),
                  })
                }
              >
                <SelectTrigger className='w-24'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {t('settings.countUnit', { n: num })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FormFieldStack>

          {/* 分片大小 */}
          <FormFieldStack>
            <Label>{t('settings.chunkSize')}</Label>
            <div className='flex items-center gap-4'>
              <Select
                value={formData.chunkSize.toString()}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    chunkSize: parseInt(value),
                  })
                }
              >
                <SelectTrigger className='w-32'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={(2 * 1024 * 1024).toString()}>
                    2 MB
                  </SelectItem>
                  <SelectItem value={(5 * 1024 * 1024).toString()}>
                    5 MB
                  </SelectItem>
                  <SelectItem value={(10 * 1024 * 1024).toString()}>
                    10 MB
                  </SelectItem>
                </SelectContent>
              </Select>
              <span className='text-sm text-muted-foreground'>
                {t('settings.chunkHint')}
              </span>
            </div>
          </FormFieldStack>
        </div>

        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('settings.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !formData.downloadLocation.trim()}
          >
            {loading ? t('settings.saving') : t('settings.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
