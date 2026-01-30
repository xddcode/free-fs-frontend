import { useState } from 'react';
import { Database, Eye, Settings, Trash2, Link as LinkIcon, Copy, Check } from 'lucide-react';
import type { StorageSetting, ConfigScheme } from '@/types/storage';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ConfirmDialog } from '@/components/confirm-dialog';
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
    setEditModalOpen(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
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
      <li className="rounded-lg border p-4 hover:shadow-md">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted p-2 cursor-help">
                  <Database className="h-5 w-5" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">ID: {setting.id}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Badge
            variant={setting.enabled === 1 ? 'default' : 'secondary'}
            className={
              setting.enabled === 1
                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
                : ''
            }
          >
            {setting.enabled === 1 ? '已启用' : '未启用'}
          </Badge>
        </div>

        {/* Content */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h2 className="font-semibold">{setting.storagePlatform.name}</h2>
            {setting.storagePlatform.link && (
              <a href={setting.storagePlatform.link} target="_blank" rel="noopener noreferrer">
                <LinkIcon className="h-3 w-3 text-muted-foreground hover:text-primary" />
              </a>
            )}
          </div>
          <div className="mb-2 h-4">
            {setting.remark && (
              <p className="text-xs text-muted-foreground truncate">{setting.remark}</p>
            )}
          </div>
          <p className="line-clamp-2 text-xs text-gray-500">{setting.storagePlatform.desc || '暂无描述信息'}</p>
        </div>

        {/* Actions Menu */}
        <div className="mt-4 flex items-center gap-2">
          <Button
            variant={setting.enabled === 1 ? 'outline' : 'default'}
            size="sm"
            onClick={() => setToggleDialogOpen(true)}
            disabled={isLoading}
          >
            {setting.enabled === 1 ? '禁用' : '启用'}
          </Button>
          <div className="h-6 w-px bg-border" />
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setViewModalOpen(true)}
          >
            <Eye className="h-3 w-3 mr-1.5" />
            查看
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleOpenEdit}
          >
            <Settings className="h-3 w-3 mr-1.5" />
            编辑
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-red-600 hover:text-red-700 hover:border-red-300"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-3 w-3 mr-1.5" />
            删除
          </Button>
        </div>
      </li>

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
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, [field.identifier]: e.target.value })
                  }
                  placeholder={`请输入${field.label}`}
                />
              </div>
            ))}
            <div className="grid gap-3">
              <Label htmlFor="edit-remark">配置备注</Label>
              <Input
                id="edit-remark"
                value={editRemark}
                onChange={(e) => setEditRemark(e.target.value)}
                placeholder="例如：生产环境、测试环境等"
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
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        destructive
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        handleConfirm={handleDelete}
        isLoading={isLoading}
        title="确认删除"
        desc={`删除后，"${setting.storagePlatform.name}" 的配置信息将无法恢复。确定要继续吗？`}
        confirmText={isLoading ? '删除中...' : '确认删除'}
        cancelBtnText="取消"
      />

      {/* Toggle Dialog */}
      <ConfirmDialog
        open={toggleDialogOpen}
        onOpenChange={setToggleDialogOpen}
        handleConfirm={handleToggle}
        isLoading={isLoading}
        title={setting.enabled === 1 ? '确认禁用' : '确认启用'}
        desc={
          setting.enabled === 1
            ? '禁用后将自动切换到默认存储平台。确定要继续吗？'
            : `启用后将自动切换到 "${setting.storagePlatform.name}" 存储平台，其他已启用的配置将被禁用。确定要继续吗？`
        }
        confirmText={isLoading ? '处理中...' : `确认${setting.enabled === 1 ? '禁用' : '启用'}`}
        cancelBtnText="取消"
      />
    </>
  );
}
