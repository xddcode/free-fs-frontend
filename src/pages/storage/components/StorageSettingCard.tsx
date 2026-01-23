import { useState } from 'react';
import { Database, CheckCircle, AlertCircle, Eye, Settings, Trash2, Power, Link as LinkIcon, Copy, Check } from 'lucide-react';
import type { StorageSetting, ConfigScheme } from '@/types/storage';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { deleteStorageSetting, toggleStorageSetting, updateStorageSetting } from '@/api/storage';

interface StorageSettingCardProps {
  setting: StorageSetting;
  onRefresh: () => void;
}

export function StorageSettingCard({ setting, onRefresh }: StorageSettingCardProps) {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editFormData, setEditFormData] = useState<Record<string, string>>({});
  const [editRemark, setEditRemark] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const schemes: ConfigScheme[] = JSON.parse(setting.storagePlatform.configScheme);
  const configData = setting.configData ? JSON.parse(setting.configData) : {};

  // 脱敏处理
  const maskValue = (identifier: string, value: string): string => {
    const lowerIdentifier = identifier.toLowerCase();
    const isAccessKey = lowerIdentifier.includes('access') && lowerIdentifier.includes('key');
    const isSecretKey =
      (lowerIdentifier.includes('secret') && lowerIdentifier.includes('key')) ||
      lowerIdentifier.includes('password') ||
      lowerIdentifier.includes('token');

    if (isSecretKey && !isAccessKey && value) {
      if (value.length > 8) {
        return `${value.substring(0, 4)}${'*'.repeat(Math.min(value.length - 8, 20))}${value.substring(value.length - 4)}`;
      }
      return '****';
    }
    return value || '未配置';
  };

  // 复制配置
  const handleCopyConfig = async () => {
    const configText: string[] = [];
    configText.push(`${setting.storagePlatform.name} 配置信息`);
    configText.push('='.repeat(30));
    schemes.forEach((field) => {
      const value = configData[field.identifier] || '未配置';
      configText.push(`${field.label}: ${value}`);
    });
    configText.push(`配置备注: ${setting.remark || '未设置备注'}`);

    try {
      await navigator.clipboard.writeText(configText.join('\n'));
      toast.success('配置信息已复制到剪贴板');
    } catch (error) {
      toast.error('复制失败');
    }
  };

  // 复制单个字段
  const handleCopyField = async (identifier: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(identifier);
      setTimeout(() => setCopiedField(null), 2000);
      toast.success('已复制');
    } catch (error) {
      toast.error('复制失败');
    }
  };

  // 打开编辑模态框
  const handleOpenEdit = () => {
    const initialData: Record<string, string> = {};
    schemes.forEach((field) => {
      initialData[field.identifier] = configData[field.identifier] || '';
    });
    setEditFormData(initialData);
    setEditRemark(setting.remark || '');
    setEditErrors({});
    setEditModalOpen(true);
  };

  // 验证编辑表单
  const validateEditForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    schemes.forEach((field) => {
      if (field.validation.required && !editFormData[field.identifier]?.trim()) {
        newErrors[field.identifier] = `请输入${field.label}`;
      }
    });
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 清除编辑字段错误
  const clearEditFieldError = (fieldName: string) => {
    if (editErrors[fieldName]) {
      setEditErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!validateEditForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await updateStorageSetting({
        settingId: setting.id.toString(),
        platformIdentifier: setting.storagePlatform.identifier,
        configData: JSON.stringify(editFormData),
        remark: editRemark.trim(),
      });
      toast.success('配置保存成功');
      onRefresh();
      setEditModalOpen(false);
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 删除配置
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteStorageSetting(setting.id);
      toast.success(`${setting.storagePlatform.name} 配置已删除`);
      onRefresh();
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error('删除失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 切换启用状态
  const handleToggle = async () => {
    const action = setting.enabled === 1 ? 0 : 1;
    setIsLoading(true);
    try {
      await toggleStorageSetting(setting.id.toString(), action);
      toast.success(
        action === 1
          ? `${setting.storagePlatform.name} 已启用，页面即将刷新...`
          : `${setting.storagePlatform.name} 已禁用，正在切换到默认平台...`
      );
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      toast.error('操作失败');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className={`h-full border rounded-xl transition-all hover:-translate-y-2 hover:shadow-lg ${setting.enabled === 1 ? 'border-green-500/30 bg-green-500/5 dark:border-green-500/30 dark:bg-green-500/10' : ''}`}>
        <div className="p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${setting.enabled === 1 ? 'bg-green-100 dark:bg-green-500/20' : 'bg-muted'}`}>
              <Database className={`h-6 w-6 ${setting.enabled === 1 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold truncate">{setting.storagePlatform.name}</div>
                {setting.storagePlatform.link && (
                  <a href={setting.storagePlatform.link} target="_blank" rel="noopener noreferrer">
                    <LinkIcon className="h-3 w-3 text-muted-foreground hover:text-primary" />
                  </a>
                )}
              </div>
              <div className="text-xs text-muted-foreground font-mono">ID: {setting.id}</div>
            </div>
            <Badge variant={setting.enabled === 1 ? 'default' : 'secondary'} className="flex-shrink-0">
              {setting.enabled === 1 ? (
                <><CheckCircle className="h-3 w-3 mr-1" />已启用</>
              ) : (
                <><AlertCircle className="h-3 w-3 mr-1" />已禁用</>
              )}
            </Badge>
          </div>

          {/* Remark */}
          {setting.remark ? (
            <div className="px-2 py-1 bg-muted text-foreground text-xs rounded mb-3 truncate">
              {setting.remark}
            </div>
          ) : (
            <div className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded mb-3 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              未设置备注
            </div>
          )}

          {/* Description */}
          <div className="flex-1 text-xs text-muted-foreground line-clamp-2 mb-3">
            {setting.storagePlatform.desc || '暂无描述信息'}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t">
            {/* Toggle Button */}
            <Button
              variant={setting.enabled === 1 ? 'default' : 'outline'}
              size="icon"
              className={`h-9 w-9 rounded-full ${setting.enabled === 1 ? 'bg-green-600 hover:bg-green-700' : ''}`}
              onClick={() => setToggleDialogOpen(true)}
              disabled={isLoading}
            >
              <Power className="h-4 w-4" />
            </Button>

            <div className="flex-1 flex gap-1">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setViewModalOpen(true)}>
                <Eye className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={handleOpenEdit}>
                <Settings className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-600" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {setting.storagePlatform.name} - 查看配置
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 px-6">
            {schemes.map((field) => (
              <div key={field.identifier} className="grid gap-3">
                <Label>{field.label}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={maskValue(field.identifier, configData[field.identifier])}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyField(field.identifier, configData[field.identifier])}
                  >
                    {copiedField === field.identifier ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
            <div className="grid gap-3">
              <Label>配置备注</Label>
              <Input value={setting.remark || '未设置备注'} readOnly />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">关闭</Button>
            </DialogClose>
            <Button onClick={handleCopyConfig}>复制配置</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <form>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {setting.storagePlatform.name} - 编辑配置
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 px-6">
              {schemes.map((field) => (
                <div key={field.identifier} className="grid gap-3">
                  <Label htmlFor={`edit-${field.identifier}`}>
                    {field.label} {field.validation.required && '*'}
                  </Label>
                  <Input
                    id={`edit-${field.identifier}`}
                    value={editFormData[field.identifier] || ''}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, [field.identifier]: e.target.value });
                      clearEditFieldError(field.identifier);
                    }}
                    placeholder={`请输入${field.label}`}
                    className={editErrors[field.identifier] ? 'border-red-500' : ''}
                  />
                  {editErrors[field.identifier] && (
                    <div className="flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-3 w-3" />
                      <span>{editErrors[field.identifier]}</span>
                    </div>
                  )}
                </div>
              ))}
              <div className="grid gap-3">
                <Label htmlFor="edit-remark">配置备注</Label>
                <Input
                  id="edit-remark"
                  value={editRemark}
                  onChange={(e) => setEditRemark(e.target.value)}
                  placeholder="例如：生产环境、测试环境、备份存储等"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isLoading}>
                  取消
                </Button>
              </DialogClose>
              <Button onClick={handleSaveEdit} disabled={isLoading}>
                {isLoading ? '保存中...' : '保存配置'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              删除后，"{setting.storagePlatform.name}" 的配置信息将无法恢复。确定要继续吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
              {isLoading ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Dialog */}
      <AlertDialog open={toggleDialogOpen} onOpenChange={setToggleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{setting.enabled === 1 ? '确认禁用' : '确认启用'}</AlertDialogTitle>
            <AlertDialogDescription>
              {setting.enabled === 1
                ? `禁用后将自动切换到默认存储平台。确定要继续吗？`
                : `启用后将自动切换到 "${setting.storagePlatform.name}" 存储平台，其他已启用的配置将被禁用。确定要继续吗？`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggle} disabled={isLoading}>
              {isLoading ? '处理中...' : `确认${setting.enabled === 1 ? '禁用' : '启用'}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
