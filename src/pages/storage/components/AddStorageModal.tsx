import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Info, AlertCircle, Tag } from 'lucide-react';
import { getStoragePlatforms, addStorageSetting, getUserStorageSettings } from '@/api/storage';
import type { ConfigScheme } from '@/types/storage';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface AddStorageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddStorageModal({ open, onOpenChange, onSuccess }: AddStorageModalProps) {
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [remark, setRemark] = useState('');
  const [schemes, setSchemes] = useState<ConfigScheme[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 获取平台列表
  const { data: platforms = [], isLoading: platformsLoading } = useQuery({
    queryKey: ['storagePlatforms'],
    queryFn: getStoragePlatforms,
    enabled: open,
  });

  // 获取用户已配置的平台
  const { data: userSettings = [] } = useQuery({
    queryKey: ['userStorageSettings'],
    queryFn: getUserStorageSettings,
    enabled: open,
  });

  const selectedPlatform = platforms.find((p) => p.id.toString() === selectedPlatformId);
  const userPlatformIdentifiers = userSettings.map((s) => s.storagePlatform.identifier);
  const hasSamePlatform = selectedPlatform && userPlatformIdentifiers.includes(selectedPlatform.identifier);

  // 当选择平台时，解析配置方案
  useEffect(() => {
    if (selectedPlatform) {
      try {
        const parsedSchemes: ConfigScheme[] = JSON.parse(selectedPlatform.configScheme);
        setSchemes(parsedSchemes);
        // 初始化表单数据
        const initialData: Record<string, string> = {};
        parsedSchemes.forEach((field) => {
          initialData[field.identifier] = '';
        });
        setFormData(initialData);
        setErrors({});
      } catch (error) {
        toast.error('配置方案格式错误');
        setSchemes([]);
      }
    } else {
      setSchemes([]);
      setFormData({});
      setErrors({});
    }
  }, [selectedPlatform]);

  // 重置表单
  const resetForm = () => {
    setSelectedPlatformId('');
    setFormData({});
    setRemark('');
    setSchemes([]);
    setErrors({});
  };

  // 关闭时重置
  useEffect(() => {
    if (!open) {
      setTimeout(resetForm, 300);
    }
  }, [open]);

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedPlatformId) {
      newErrors.platform = '请选择存储平台';
    }

    schemes.forEach((field) => {
      if (field.validation.required && !formData[field.identifier]?.trim()) {
        newErrors[field.identifier] = `请输入${field.label}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 清除单个字段错误
  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addStorageSetting({
        platformIdentifier: selectedPlatform!.identifier,
        configData: JSON.stringify(formData),
        remark: remark.trim(),
      });
      toast.success('配置添加成功');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('添加配置失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            添加存储平台配置
          </DialogTitle>
          <DialogDescription>
            配置您的对象存储平台，支持 MinIO、阿里云 OSS、腾讯云 COS 等
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 px-6">
          {/* 选择平台 */}
          <div className="grid gap-3">
            <Label htmlFor="platform">选择存储平台 *</Label>
            <Select
              value={selectedPlatformId}
              onValueChange={(value) => {
                setSelectedPlatformId(value);
                clearFieldError('platform');
              }}
            >
              <SelectTrigger className={errors.platform ? 'border-red-500' : ''}>
                <SelectValue placeholder="请选择存储平台" />
              </SelectTrigger>
              <SelectContent>
                {platformsLoading ? (
                  <div className="p-2 text-sm text-muted-foreground">加载中...</div>
                ) : (
                  platforms.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id.toString()}>
                      {platform.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.platform && (
              <div className="flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.platform}</span>
              </div>
            )}
          </div>

          {/* 配置字段 */}
          {schemes.length > 0 && (
            <>
              {schemes.map((field) => (
                <div key={field.identifier} className="grid gap-3">
                  <Label htmlFor={field.identifier}>
                    {field.label} {field.validation.required && '*'}
                  </Label>
                  <Input
                    id={field.identifier}
                    value={formData[field.identifier] || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, [field.identifier]: e.target.value });
                      clearFieldError(field.identifier);
                    }}
                    placeholder={`请输入${field.label}`}
                    className={errors[field.identifier] ? 'border-red-500' : ''}
                  />
                  {errors[field.identifier] && (
                    <div className="flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors[field.identifier]}</span>
                    </div>
                  )}
                </div>
              ))}

              {/* 备注 */}
              <div className="grid gap-3">
                <Label htmlFor="remark">配置备注</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="remark"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="例如：生产环境、测试环境、备份存储等"
                    className="pl-10"
                  />
                </div>
                <div className="flex items-start gap-2 text-xs text-primary">
                  <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>强烈建议添加备注（如"生产环境"、"测试环境"），便于在切换时快速识别</span>
                </div>
              </div>

              {/* 警告提示 */}
              {hasSamePlatform && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    您已配置过 <strong>{selectedPlatform?.name}</strong>，强烈建议填写备注以便区分！
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* 空状态 */}
          {!selectedPlatformId && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p>请先选择存储平台</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              取消
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!selectedPlatformId || isSubmitting}>
            {isSubmitting ? '保存中...' : '保存配置'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
