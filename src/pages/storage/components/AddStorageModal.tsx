import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import type { ConfigScheme } from '@/types/storage'
import { Info, AlertCircle, Tag } from 'lucide-react'
import { toast } from 'sonner'
import {
  getStoragePlatforms,
  addStorageSetting,
  getUserStorageSettings,
} from '@/api/storage'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AddStorageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddStorageModal({
  open,
  onOpenChange,
  onSuccess,
}: AddStorageModalProps) {
  const { t } = useTranslation('storage')
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [remark, setRemark] = useState('')
  const [schemes, setSchemes] = useState<ConfigScheme[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: platforms = [], isLoading: platformsLoading } = useQuery({
    queryKey: ['storagePlatforms'],
    queryFn: getStoragePlatforms,
    staleTime: 60_000,
    enabled: open,
  })

  const { data: userSettings = [] } = useQuery({
    queryKey: ['userStorageSettings'],
    queryFn: getUserStorageSettings,
    staleTime: 30_000,
    enabled: open,
  })

  const selectedPlatform = platforms.find(
    (p) => p.id.toString() === selectedPlatformId
  )
  const userPlatformIdentifiers = userSettings.map(
    (s) => s.storagePlatform.identifier
  )
  const hasSamePlatform =
    selectedPlatform &&
    userPlatformIdentifiers.includes(selectedPlatform.identifier)

  // 当选择平台时，解析配置方案
  useEffect(() => {
    if (selectedPlatform) {
      try {
        const parsedSchemes: ConfigScheme[] = JSON.parse(
          selectedPlatform.configScheme
        )
        setSchemes(parsedSchemes)
        // 初始化表单数据
        const initialData: Record<string, string> = {}
        parsedSchemes.forEach((field) => {
          initialData[field.identifier] = ''
        })
        setFormData(initialData)
        setErrors({})
      } catch (error) {
        toast.error(t('addModal.toastSchemeError'))
        setSchemes([])
      }
    } else {
      setSchemes([])
      setFormData({})
      setErrors({})
    }
  }, [selectedPlatform])

  // 重置表单
  const resetForm = () => {
    setSelectedPlatformId('')
    setFormData({})
    setRemark('')
    setSchemes([])
    setErrors({})
  }

  // 关闭时重置
  useEffect(() => {
    if (!open) {
      setTimeout(resetForm, 300)
    }
  }, [open])

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!selectedPlatformId) {
      newErrors.platform = t('addModal.toastSelectPlatform')
    }

    schemes.forEach((field) => {
      if (field.validation.required && !formData[field.identifier]?.trim()) {
        newErrors[field.identifier] = t('addModal.toastEnterField', {
          label: field.label,
        })
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 清除单个字段错误
  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await addStorageSetting({
        platformIdentifier: selectedPlatform!.identifier,
        configData: JSON.stringify(formData),
        remark: remark.trim(),
      })
      toast.success(t('addModal.toastSuccess'))
      onSuccess()
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[85vh] sm:max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{t('addModal.title')}</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* 选择平台 */}
          <div className='space-y-3'>
            <Label htmlFor='platform'>
              <span className='relative top-0.5 text-red-500'>* </span>
              {t('addModal.selectPlatform')}
            </Label>
            <Select
              value={selectedPlatformId}
              onValueChange={(value) => {
                setSelectedPlatformId(value)
                clearFieldError('platform')
              }}
            >
              <SelectTrigger
                className={`w-full ${errors.platform ? 'border-red-500' : ''}`}
              >
                <SelectValue placeholder={t('addModal.selectPlatformPh')} />
              </SelectTrigger>
              <SelectContent>
                {platformsLoading ? (
                  <div className='p-2 text-sm text-muted-foreground'>
                    {t('addModal.loading')}
                  </div>
                ) : (
                  platforms.map((platform) => (
                    <SelectItem
                      key={platform.id}
                      value={platform.id.toString()}
                    >
                      {platform.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.platform && (
              <div className='flex items-center gap-1 text-sm text-red-500'>
                <AlertCircle className='h-3 w-3' />
                <span>{errors.platform}</span>
              </div>
            )}
          </div>

          {/* 配置字段 */}
          {schemes.length > 0 && (
            <>
              {schemes.map((field) => (
                <div key={field.identifier} className='space-y-3'>
                  <Label htmlFor={field.identifier}>
                    {field.validation.required && (
                      <span className='relative top-0.5 text-red-500'>* </span>
                    )}
                    {field.label}
                  </Label>
                  <Input
                    id={field.identifier}
                    value={formData[field.identifier] || ''}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        [field.identifier]: e.target.value,
                      })
                      clearFieldError(field.identifier)
                    }}
                    placeholder={t('addModal.fieldPh', { label: field.label })}
                    className={errors[field.identifier] ? 'border-red-500' : ''}
                  />
                  {errors[field.identifier] && (
                    <div className='flex items-center gap-1 text-sm text-red-500'>
                      <AlertCircle className='h-3 w-3' />
                      <span>{errors[field.identifier]}</span>
                    </div>
                  )}
                </div>
              ))}

              {/* 备注 */}
              <div className='space-y-3'>
                <Label htmlFor='remark'>{t('addModal.remarkLabel')}</Label>
                <div className='relative'>
                  <Tag className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    id='remark'
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder={t('addModal.remarkPh')}
                    className='pl-10'
                  />
                </div>
                <div className='flex items-start gap-2 text-xs text-primary'>
                  <Info className='mt-0.5 h-3 w-3 flex-shrink-0' />
                  <span>{t('addModal.remarkHint')}</span>
                </div>
              </div>

              {/* 警告提示 */}
              {hasSamePlatform && (
                <Alert>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>
                    {t('addModal.duplicateWarn', {
                      name: selectedPlatform?.name ?? '',
                    })}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* 空状态 */}
          {!selectedPlatformId && (
            <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
              <AlertCircle className='mb-4 h-12 w-12' />
              <p className='text-sm'>{t('addModal.emptyHint')}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline' disabled={isSubmitting}>
              {t('addModal.cancel')}
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedPlatformId ||
              isSubmitting ||
              !schemes.every((field) =>
                field.validation.required
                  ? formData[field.identifier]?.trim()
                  : true
              )
            }
          >
            {isSubmitting ? t('addModal.saving') : t('addModal.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
