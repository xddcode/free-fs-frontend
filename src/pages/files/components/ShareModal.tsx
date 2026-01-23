import { useState, useEffect } from 'react';
import { Share2, Copy, Check, Calendar, Lock, Eye, Download } from 'lucide-react';
import { shareFiles } from '@/api';
import type { FileItem } from '@/types/file';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: FileItem | null;
  files: FileItem[];
  onSuccess?: () => void;
}

export function ShareModal({ open, onOpenChange, file, files, onSuccess }: ShareModalProps) {
  const [expireType, setExpireType] = useState<string>('7');
  const [needShareCode, setNeedShareCode] = useState(false);
  const [maxViewCount, setMaxViewCount] = useState<string>('');
  const [maxDownloadCount, setMaxDownloadCount] = useState<string>('');
  const [shareLink, setShareLink] = useState('');
  const [shareCode, setShareCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const sharingFiles = file ? [file] : files;
  const sharingFileIds = sharingFiles.map((f) => f.id);

  // 重置表单
  const resetForm = () => {
    setExpireType('7');
    setNeedShareCode(false);
    setMaxViewCount('');
    setMaxDownloadCount('');
    setShareLink('');
    setShareCode('');
    setCopied(false);
  };

  // 生成分享链接
  const handleShare = async () => {
    setIsSubmitting(true);
    try {
      const response = await shareFiles({
        fileIds: sharingFileIds,
        expireType: expireType === 'permanent' ? null : Number(expireType),
        needShareCode,
        maxViewCount: maxViewCount ? Number(maxViewCount) : undefined,
        maxDownloadCount: maxDownloadCount ? Number(maxDownloadCount) : undefined,
      });

      if (response) {
        setShareLink(response.shareLink || '');
        setShareCode(response.shareCode || '');
        toast.success('分享链接已生成');
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
    const textToCopy = needShareCode
      ? `链接: ${shareLink}\n提取码: ${shareCode}`
      : shareLink;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success('已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('复制失败');
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            分享文件
            {sharingFiles.length > 1 && (
              <span className="text-muted-foreground text-sm font-normal">({sharingFiles.length} 项)</span>
            )}
          </DialogTitle>
        </DialogHeader>

        {!shareLink ? (
          <div className="space-y-4">
            {/* 有效期 */}
            <div className="space-y-2">
              <Label htmlFor="expireType" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                有效期
              </Label>
              <Select value={expireType} onValueChange={setExpireType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1天</SelectItem>
                  <SelectItem value="7">7天</SelectItem>
                  <SelectItem value="30">30天</SelectItem>
                  <SelectItem value="permanent">永久有效</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 提取码 */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="needShareCode"
                checked={needShareCode}
                onCheckedChange={(checked) => setNeedShareCode(checked as boolean)}
              />
              <Label htmlFor="needShareCode" className="flex items-center gap-2 cursor-pointer">
                <Lock className="h-4 w-4" />
                需要提取码
              </Label>
            </div>

            {/* 查看次数限制 */}
            <div className="space-y-2">
              <Label htmlFor="maxViewCount" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                最大查看次数（可选）
              </Label>
              <Input
                id="maxViewCount"
                type="number"
                min="1"
                placeholder="不限制"
                value={maxViewCount}
                onChange={(e) => setMaxViewCount(e.target.value)}
              />
            </div>

            {/* 下载次数限制 */}
            <div className="space-y-2">
              <Label htmlFor="maxDownloadCount" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                最大下载次数（可选）
              </Label>
              <Input
                id="maxDownloadCount"
                type="number"
                min="1"
                placeholder="不限制"
                value={maxDownloadCount}
                onChange={(e) => setMaxDownloadCount(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 分享链接 */}
            <div className="space-y-2">
              <Label>分享链接</Label>
              <div className="flex gap-2">
                <Input value={shareLink} readOnly className="flex-1" />
                <Button onClick={handleCopy} variant="outline" size="icon">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* 提取码 */}
            {shareCode && (
              <div className="space-y-2">
                <Label>提取码</Label>
                <Input value={shareCode} readOnly />
              </div>
            )}

            {/* 提示信息 */}
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <p>分享链接已生成，有效期 {expireType === 'permanent' ? '永久' : `${expireType}天`}</p>
              {maxViewCount && <p>最大查看次数: {maxViewCount}</p>}
              {maxDownloadCount && <p>最大下载次数: {maxDownloadCount}</p>}
            </div>
          </div>
        )}

        <DialogFooter>
          {!shareLink ? (
            <>
              <DialogClose asChild>
                <Button variant="outline" disabled={isSubmitting}>
                  取消
                </Button>
              </DialogClose>
              <Button onClick={handleShare} disabled={isSubmitting}>
                {isSubmitting ? '生成中...' : '生成链接'}
              </Button>
            </>
          ) : (
            <DialogClose asChild>
              <Button className="w-full">关闭</Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
