import { useState, useEffect, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { shareFiles } from '@/api';
import type { FileItem } from '@/types/file';
import { FileIcon } from '@/components/file-icon';
import { formatFileSize } from '@/utils/format';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: FileItem | null;
  files: FileItem[];
  onSuccess?: () => void;
}

export function ShareModal({ open, onOpenChange, file, files, onSuccess }: ShareModalProps) {
  // 表单状态
  const [expireType, setExpireType] = useState<number>(1); // 1-7天 2-30天 3-自定义 4-永久
  const [customExpireTime, setCustomExpireTime] = useState<string>('');
  const [needShareCode, setNeedShareCode] = useState(false);
  const [maxViewCountType, setMaxViewCountType] = useState<'unlimited' | 'custom'>('unlimited');
  const [maxViewCount, setMaxViewCount] = useState<string>('');
  const [maxDownloadCountType, setMaxDownloadCountType] = useState<'unlimited' | 'custom'>('unlimited');
  const [maxDownloadCount, setMaxDownloadCount] = useState<string>('');
  const [scopeList, setScopeList] = useState<string[]>(['preview']);
  
  // 分享结果状态
  const [shareLink, setShareLink] = useState('');
  const [shareCode, setShareCode] = useState('');
  const [shareExpireTime, setShareExpireTime] = useState('');
  const [isPermanent, setIsPermanent] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sharingFiles = file ? [file] : files;
  const isBatchShare = sharingFiles.length > 1;
  const displayFiles = sharingFiles.slice(0, 3);

  // 文件数量提示文本
  const filesCountText = useMemo(() => {
    const total = sharingFiles.length;
    if (total > 3) {
      return `等 ${total} 个文件`;
    }
    return `共 ${total} 个文件`;
  }, [sharingFiles.length]);

  // 重置表单
  const resetForm = () => {
    setExpireType(1);
    setCustomExpireTime('');
    setNeedShareCode(false);
    setMaxViewCountType('unlimited');
    setMaxViewCount('');
    setMaxDownloadCountType('unlimited');
    setMaxDownloadCount('');
    setScopeList(['preview']);
    setShareLink('');
    setShareCode('');
    setShareExpireTime('');
    setIsPermanent(false);
  };

  // 获取分享文本
  const getShareText = () => {
    if (shareCode) {
      return `${shareLink}\n提取码：${shareCode}`;
    }
    return shareLink;
  };

  // 判断是否永久分享
  const isPermanentShare = () => {
    if (shareLink) {
      return isPermanent;
    }
    return expireType === 4;
  };

  // 获取过期时间文本
  const getExpireText = () => {
    if (shareExpireTime) {
      return shareExpireTime;
    }
    if (expireType === 4) return '永不';
    if (expireType === 3 && customExpireTime) {
      return customExpireTime;
    }
    const expireMap: Record<number, string> = {
      1: '7天',
      2: '30天',
    };
    return expireMap[expireType] || '未知';
  };

  // 生成分享链接
  const handleShare = async () => {
    // 验证自定义时间
    if (expireType === 3 && !customExpireTime) {
      toast.warning('请选择过期时间');
      return;
    }

    // 验证自定义次数
    if (maxViewCountType === 'custom' && !maxViewCount) {
      toast.warning('请输入最大查看次数');
      return;
    }

    if (maxDownloadCountType === 'custom' && !maxDownloadCount) {
      toast.warning('请输入最大下载次数');
      return;
    }

    setIsSubmitting(true);
    try {
      const fileIds = sharingFiles.map((f) => f.id);
      const scope = scopeList.join(',');

      const response = await shareFiles({
        fileIds,
        expireType,
        expireTime: expireType === 3 ? customExpireTime : undefined,
        needShareCode,
        maxViewCount: maxViewCountType === 'custom' ? Number(maxViewCount) : undefined,
        maxDownloadCount: maxDownloadCountType === 'custom' ? Number(maxDownloadCount) : undefined,
        scope,
      });

      if (response) {
        // 前端根据 shareToken 拼接完整的分享链接
        const shareToken = response.id;
        const baseUrl = window.location.origin;
        setShareLink(`${baseUrl}/s/${shareToken}`);
        setShareCode(response.shareCode || '');
        setShareExpireTime(response.expireTime || '');
        setIsPermanent(response.isPermanent);

        const successMsg =
          fileIds.length === 1
            ? '分享链接已生成'
            : `成功生成 ${fileIds.length} 个文件的分享链接`;
        toast.success(successMsg);
        onSuccess?.();
      }
    } catch (error) {
      toast.error('生成分享链接失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 复制链接
  const handleCopy = async () => {
    const textToCopy = getShareText();

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success(shareCode ? '链接和提取码已复制到剪贴板' : '链接已复制到剪贴板');
    } catch (error) {
      toast.error('复制失败，请手动复制');
    }
  };

  // 处理确认按钮点击
  const handleOk = async () => {
    if (shareLink) {
      await handleCopy();
    } else {
      await handleShare();
    }
  };

  // 处理权限选择变化
  const handleScopeChange = (value: string) => {
    if (scopeList.includes(value)) {
      setScopeList(scopeList.filter((v) => v !== value));
    } else {
      setScopeList([...scopeList, value]);
    }
  };

  // 关闭时重置
  useEffect(() => {
    if (!open) {
      setTimeout(resetForm, 300);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isBatchShare ? (
              <>
                分享文件 <span className="text-muted-foreground">({sharingFiles.length} 项)</span>
              </>
            ) : (
              '分享文件'
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 px-6 pb-4">
          {/* 文件信息预览 */}
          {!isBatchShare && file ? (
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <FileIcon
                type={file.isDir ? 'dir' : file.suffix || ''}
                size={48}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{file.displayName}</div>
                <div className="text-xs text-muted-foreground">{formatFileSize(file.size || 0)}</div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-center gap-6 p-6 bg-muted/30 rounded-lg">
                {displayFiles.map((previewFile) => (
                  <div key={previewFile.id} className="flex flex-col items-center gap-2 w-20">
                    <FileIcon
                      type={previewFile.isDir ? 'dir' : previewFile.suffix || ''}
                      size={64}
                    />
                    <span className="text-xs text-muted-foreground text-center truncate w-full">
                      {previewFile.displayName}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-sm text-center text-muted-foreground">{filesCountText}</div>
            </div>
          )}

          <Separator />

          {!shareLink ? (
            <>
              {/* 有效期 */}
              <div className="space-y-3">
                <Label>有效期</Label>
                <RadioGroup
                  value={String(expireType)}
                  onValueChange={(value) => setExpireType(Number(value))}
                  disabled={!!shareLink}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="expire-7d" />
                    <Label htmlFor="expire-7d" className="cursor-pointer font-normal">7天</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="expire-30d" />
                    <Label htmlFor="expire-30d" className="cursor-pointer font-normal">30天</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="expire-custom" />
                    <Label htmlFor="expire-custom" className="cursor-pointer font-normal">自定义</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4" id="expire-permanent" />
                    <Label htmlFor="expire-permanent" className="cursor-pointer font-normal">永久</Label>
                  </div>
                </RadioGroup>
                {expireType === 3 && (
                  <Input
                    type="datetime-local"
                    value={customExpireTime}
                    onChange={(e) => setCustomExpireTime(e.target.value)}
                    disabled={!!shareLink}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                )}
              </div>

              {/* 分享类型 */}
              <div className="space-y-3">
                <Label>分享类型</Label>
                <RadioGroup
                  value={needShareCode ? 'private' : 'public'}
                  onValueChange={(value) => setNeedShareCode(value === 'private')}
                  disabled={!!shareLink}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="share-public" />
                    <Label htmlFor="share-public" className="cursor-pointer font-normal">公开分享</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="share-private" />
                    <Label htmlFor="share-private" className="cursor-pointer font-normal">私密分享</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* 分享权限 */}
              <div className="space-y-3">
                <Label>分享权限</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="scope-preview"
                      checked={scopeList.includes('preview')}
                      onCheckedChange={() => handleScopeChange('preview')}
                      disabled={!!shareLink}
                    />
                    <Label htmlFor="scope-preview" className="cursor-pointer font-normal">预览</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="scope-download"
                      checked={scopeList.includes('download')}
                      onCheckedChange={() => handleScopeChange('download')}
                      disabled={!!shareLink}
                    />
                    <Label htmlFor="scope-download" className="cursor-pointer font-normal">下载</Label>
                  </div>
                </div>
              </div>

              {/* 最大查看次数 */}
              <div className="space-y-3">
                <Label>最大查看次数</Label>
                <div className="flex items-center gap-2">
                  <RadioGroup
                    value={maxViewCountType}
                    onValueChange={(value) => setMaxViewCountType(value as 'unlimited' | 'custom')}
                    disabled={!!shareLink}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unlimited" id="view-unlimited" />
                      <Label htmlFor="view-unlimited" className="cursor-pointer font-normal">不限制</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="view-custom" />
                      <Label htmlFor="view-custom" className="cursor-pointer font-normal">自定义</Label>
                    </div>
                  </RadioGroup>
                  {maxViewCountType === 'custom' && (
                    <Input
                      type="number"
                      min="1"
                      placeholder="请输入次数"
                      value={maxViewCount}
                      onChange={(e) => setMaxViewCount(e.target.value)}
                      disabled={!!shareLink}
                      className="w-32"
                    />
                  )}
                </div>
              </div>

              {/* 最大下载次数 */}
              <div className="space-y-3">
                <Label>最大下载次数</Label>
                <div className="flex items-center gap-2">
                  <RadioGroup
                    value={maxDownloadCountType}
                    onValueChange={(value) => setMaxDownloadCountType(value as 'unlimited' | 'custom')}
                    disabled={!!shareLink}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unlimited" id="download-unlimited" />
                      <Label htmlFor="download-unlimited" className="cursor-pointer font-normal">不限制</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="download-custom" />
                      <Label htmlFor="download-custom" className="cursor-pointer font-normal">自定义</Label>
                    </div>
                  </RadioGroup>
                  {maxDownloadCountType === 'custom' && (
                    <Input
                      type="number"
                      min="1"
                      placeholder="请输入次数"
                      value={maxDownloadCount}
                      onChange={(e) => setMaxDownloadCount(e.target.value)}
                      disabled={!!shareLink}
                      className="w-32"
                    />
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* 分享结果 */}
              <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-600 dark:text-green-400">
                  分享链接已生成
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>分享信息</Label>
                <Textarea
                  value={getShareText()}
                  readOnly
                  rows={shareCode ? 2 : 1}
                  className="resize-none"
                />
              </div>

              <div className="text-sm text-center text-muted-foreground">
                {isPermanentShare() ? (
                  '分享链接永久有效'
                ) : (
                  `分享链接将在 ${getExpireText()} 后失效`
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {!shareLink ? (
            <>
              <DialogClose asChild>
                <Button variant="outline" disabled={isSubmitting}>
                  取消
                </Button>
              </DialogClose>
              <Button onClick={handleOk} disabled={isSubmitting}>
                {isSubmitting ? '生成中...' : '生成分享链接'}
              </Button>
            </>
          ) : (
            <Button onClick={handleOk} className="w-full">
              <Copy className="h-4 w-4 mr-2" />
              复制链接
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
