import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { StorageSetting, ConfigScheme } from '@/types/storage'
import {
  Database,
  Eye,
  Settings,
  Trash2,
  Link as LinkIcon,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  deleteStorageSetting,
  toggleStorageSetting,
  updateStorageSetting,
} from '@/api/storage'
import { usePermission } from '@/hooks/use-permission'
import { Badge } from '@/components/ui/badge'
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  DescriptionField,
  DescriptionFieldLabel,
  DescriptionFieldList,
  DescriptionFieldValue,
  DescriptionFieldValueRow,
} from '@/components/field-layout'

interface StorageSettingCardProps {
  setting: StorageSetting
  onRefresh: () => void
}

export function StorageSettingCard({
  setting,
  onRefresh,
}: StorageSettingCardProps) {
  const { t } = useTranslation('storage')
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editFormData, setEditFormData] = useState<Record<string, string>>({})
  const [editRemark, setEditRemark] = useState('')
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [copiedConfig, setCopiedConfig] = useState(false)
  const { hasPermission } = usePermission()
  const canManageStorage = hasPermission('storage:manage')
  const canOperateStorage = canManageStorage
  const canDeleteStorage = canManageStorage

  const schemes: ConfigScheme[] = JSON.parse(
    setting.storagePlatform.configScheme
  )
  const configData = setting.configData ? JSON.parse(setting.configData) : {}

  // 脱敏处理
  const maskValue = (identifier: string, value: string): string => {
    const emptyLabel = t('card.notConfigured')
    const lowerIdentifier = identifier.toLowerCase()
    const isAccessKey =
      lowerIdentifier.includes('access') && lowerIdentifier.includes('key')
    const isSecretKey =
      (lowerIdentifier.includes('secret') && lowerIdentifier.includes('key')) ||
      lowerIdentifier.includes('password') ||
      lowerIdentifier.includes('token')

    if (isSecretKey && !isAccessKey && value) {
      if (value.length > 8) {
        return `${value.substring(0, 4)}${'*'.repeat(Math.min(value.length - 8, 20))}${value.substring(value.length - 4)}`
      }
      return '****'
    }
    return value || emptyLabel
  }

  // 复制配置
  const handleCopyConfig = async () => {
    const configText: string[] = []
    configText.push(
      t('card.configHeader', { name: setting.storagePlatform.name })
    )
    configText.push('='.repeat(30))
    schemes.forEach((field) => {
      const value = configData[field.identifier] || t('card.notConfigured')
      configText.push(`${field.label}: ${value}`)
    })
    configText.push(
      t('card.remarkLine', {
        remark: setting.remark || t('card.noRemark'),
      })
    )

    try {
      await navigator.clipboard.writeText(configText.join('\n'))
      setCopiedConfig(true)
      setTimeout(() => setCopiedConfig(false), 2000)
      toast.success(t('card.copied'))
    } catch (error) {
      toast.error(t('card.copyFailed'))
    }
  }

  // 复制单个字段
  const handleCopyField = async (identifier: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(identifier)
      setTimeout(() => setCopiedField(null), 2000)
      toast.success(t('card.copied'))
    } catch (error) {
      toast.error(t('card.copyFailed'))
    }
  }

  // 打开编辑模态框
  const handleOpenEdit = () => {
    const initialData: Record<string, string> = {}
    schemes.forEach((field) => {
      initialData[field.identifier] = configData[field.identifier] || ''
    })
    setEditFormData(initialData)
    setEditRemark(setting.remark || '')
    setEditErrors({})
    setEditModalOpen(true)
  }

  // 清除单个字段错误
  const clearEditFieldError = (fieldName: string) => {
    if (editErrors[fieldName]) {
      setEditErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  // 验证编辑表单
  const validateEditForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    schemes.forEach((field) => {
      if (
        field.validation.required &&
        !editFormData[field.identifier]?.trim()
      ) {
        newErrors[field.identifier] = t('card.toastEnterField', {
          label: field.label,
        })
      }
    })

    setEditErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!validateEditForm()) {
      return
    }

    setIsLoading(true)
    try {
      await updateStorageSetting({
        settingId: setting.id.toString(),
        platformIdentifier: setting.storagePlatform.identifier,
        configData: JSON.stringify(editFormData),
        remark: editRemark.trim(),
      })
      toast.success(t('card.saveOk'))
      onRefresh()
      setEditModalOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteStorageSetting(setting.id)
      toast.success(t('card.deleteOk', { name: setting.storagePlatform.name }))
      onRefresh()
      setDeleteDialogOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = async () => {
    const action = setting.enabled === 1 ? 0 : 1
    setIsLoading(true)
    try {
      await toggleStorageSetting(setting.id.toString(), action)
      toast.success(
        action === 1
          ? t('card.enabledToast', { name: setting.storagePlatform.name })
          : t('card.disabledToast', { name: setting.storagePlatform.name })
      )
      setTimeout(() => {
        window.location.reload()
      }, 800)
    } catch (error) {
      setIsLoading(false)
    }
  }

  return (
    <>
      <li className='rounded-lg border p-4 hover:shadow-md'>
        {/* Header */}
        <div className='mb-8 flex items-center justify-between'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='flex size-10 cursor-help items-center justify-center rounded-lg bg-muted p-2'>
                  <Database className='h-5 w-5' />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className='text-xs'>ID: {setting.id}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Badge
            variant={setting.enabled === 1 ? 'default' : 'secondary'}
            className={
              setting.enabled === 1
                ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
                : ''
            }
          >
            {setting.enabled === 1
              ? t('card.statusOn')
              : t('card.statusOff')}
          </Badge>
        </div>

        {/* Content */}
        <div>
          <div className='mb-1 flex items-center gap-2'>
            <h2 className='font-semibold'>{setting.storagePlatform.name}</h2>
            {setting.storagePlatform.link && (
              <a
                href={setting.storagePlatform.link}
                target='_blank'
                rel='noopener noreferrer'
              >
                <LinkIcon className='h-3 w-3 text-muted-foreground hover:text-primary' />
              </a>
            )}
          </div>
          <div className='mb-2 h-4'>
            {setting.remark && (
              <p className='truncate text-xs text-muted-foreground'>
                {setting.remark}
              </p>
            )}
          </div>
          <p className='line-clamp-2 text-xs text-gray-500'>
            {setting.storagePlatform.desc || t('card.noDesc')}
          </p>
        </div>

        <div className='mt-4 flex items-center gap-2'>
          {canOperateStorage && (
            <>
              <Button
                variant={setting.enabled === 1 ? 'outline' : 'default'}
                size='sm'
                onClick={() => setToggleDialogOpen(true)}
                disabled={isLoading}
              >
                {setting.enabled === 1
                  ? t('card.disable')
                  : t('card.enable')}
              </Button>
              <div className='h-6 w-px bg-border' />
            </>
          )}
          <Button
            variant='outline'
            size='sm'
            className='flex-1'
            onClick={() => setViewModalOpen(true)}
          >
            <Eye className='mr-1.5 h-3 w-3' />
            {t('card.view')}
          </Button>
          {canOperateStorage && (
            <>
              <Button
                variant='outline'
                size='sm'
                className='flex-1'
                onClick={handleOpenEdit}
              >
                <Settings className='mr-1.5 h-3 w-3' />
                {t('card.edit')}
              </Button>
            </>
          )}
          {canDeleteStorage && (
            <Button
              variant='outline'
              size='sm'
              className='flex-1 text-red-600 hover:border-red-300 hover:text-red-700'
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className='mr-1.5 h-3 w-3' />
              {t('card.delete')}
            </Button>
          )}
        </div>
      </li>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>{t('card.detailTitle')}</DialogTitle>
          </DialogHeader>

          <div className='space-y-6'>
            <DescriptionFieldList>
              {schemes.map((field) => (
                <DescriptionField key={field.identifier}>
                  <DescriptionFieldLabel>{field.label}</DescriptionFieldLabel>
                  <DescriptionFieldValueRow>
                    <DescriptionFieldValue className='min-w-0 flex-1' breakAll>
                      {maskValue(
                        field.identifier,
                        configData[field.identifier]
                      )}
                    </DescriptionFieldValue>
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-8 w-8 shrink-0'
                      onClick={() =>
                        handleCopyField(
                          field.identifier,
                          configData[field.identifier]
                        )
                      }
                    >
                      {copiedField === field.identifier ? (
                        <Check className='h-4 w-4 text-green-600' />
                      ) : (
                        <Copy className='h-4 w-4' />
                      )}
                    </Button>
                  </DescriptionFieldValueRow>
                </DescriptionField>
              ))}
              <DescriptionField>
                <DescriptionFieldLabel>
                  {t('card.remarkField')}
                </DescriptionFieldLabel>
                <DescriptionFieldValue breakAll>
                  {setting.remark || t('card.noRemark')}
                </DescriptionFieldValue>
              </DescriptionField>
            </DescriptionFieldList>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>{t('card.cancel')}</Button>
            </DialogClose>
            <Button onClick={handleCopyConfig}>
              {copiedConfig ? (
                <>
                  <Check className='mr-2 h-4 w-4' />
                  {t('card.copiedBtn')}
                </>
              ) : (
                <>
                  <Copy className='mr-2 h-4 w-4' />
                  {t('card.copyConfig')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className='max-h-[85vh] sm:max-w-2xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>{t('card.editTitle')}</DialogTitle>
          </DialogHeader>
          <div className='space-y-6'>
            {schemes.map((field) => (
              <div key={field.identifier} className='space-y-3'>
                <Label htmlFor={`edit-${field.identifier}`}>
                  {field.validation.required && (
                    <span className='relative top-0.5 text-red-500'>* </span>
                  )}
                  {field.label}
                </Label>
                <Input
                  id={`edit-${field.identifier}`}
                  value={editFormData[field.identifier] || ''}
                  onChange={(e) => {
                    setEditFormData({
                      ...editFormData,
                      [field.identifier]: e.target.value,
                    })
                    clearEditFieldError(field.identifier)
                  }}
                  placeholder={t('addModal.fieldPh', { label: field.label })}
                  className={
                    editErrors[field.identifier] ? 'border-red-500' : ''
                  }
                />
                {editErrors[field.identifier] && (
                  <div className='flex items-center gap-1 text-sm text-red-500'>
                    <AlertCircle className='h-3 w-3' />
                    <span>{editErrors[field.identifier]}</span>
                  </div>
                )}
              </div>
            ))}
            <div className='space-y-3'>
              <Label htmlFor='edit-remark'>{t('card.remarkField')}</Label>
              <Input
                id='edit-remark'
                value={editRemark}
                onChange={(e) => setEditRemark(e.target.value)}
                placeholder={t('card.editRemarkPh')}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline' disabled={isLoading}>
                {t('card.cancel')}
              </Button>
            </DialogClose>
            <Button
              onClick={handleSaveEdit}
              disabled={
                isLoading ||
                !schemes.every((field) =>
                  field.validation.required
                    ? editFormData[field.identifier]?.trim()
                    : true
                )
              }
            >
              {isLoading ? t('addModal.saving') : t('addModal.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        destructive
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        handleConfirm={handleDelete}
        isLoading={isLoading}
        title={t('card.deleteTitle')}
        desc={t('card.deleteDesc', { name: setting.storagePlatform.name })}
        confirmText={isLoading ? t('card.deleting') : t('card.confirmDelete')}
        cancelBtnText={t('card.cancel')}
      />

      {/* Toggle Dialog */}
      <ConfirmDialog
        open={toggleDialogOpen}
        onOpenChange={setToggleDialogOpen}
        handleConfirm={handleToggle}
        isLoading={isLoading}
        title={
          setting.enabled === 1
            ? t('card.toggleDisableTitle')
            : t('card.toggleEnableTitle')
        }
        desc={
          setting.enabled === 1
            ? t('card.toggleDisableDesc')
            : t('card.toggleEnableDesc', {
                name: setting.storagePlatform.name,
              })
        }
        confirmText={
          isLoading
            ? t('card.processing')
            : t('card.confirmToggle', {
                action:
                  setting.enabled === 1
                    ? t('card.disable')
                    : t('card.enable'),
              })
        }
        cancelBtnText={t('card.cancel')}
      />
    </>
  )
}
