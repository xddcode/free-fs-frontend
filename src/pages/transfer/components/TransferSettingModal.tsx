import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TransferSettingForm } from '@/types/transfer';

interface TransferSettingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TransferSettingModal({
  open,
  onOpenChange,
}: TransferSettingModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TransferSettingForm>({
    downloadLocation: '',
    isDefaultDownloadLocation: false,
    downloadSpeedLimit: 5,
    enableDownloadSpeedLimit: false,
    concurrentUploadQuantity: 3,
    concurrentDownloadQuantity: 3,
    chunkSize: 5 * 1024 * 1024,
  });

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // TODO: 调用 API 加载设置
      // const response = await getTransferSetting();
      // setFormData(response.data);
    } catch (error) {
      toast.error('加载设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.downloadLocation) {
      toast.error('请输入文件下载位置');
      return;
    }

    setLoading(true);
    try {
      // TODO: 调用 API 保存设置
      // await updateTransferSetting(formData);
      toast.success('保存成功');
      onOpenChange(false);
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>传输设置</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 文件下载位置 */}
          <div className="space-y-2">
            <Label htmlFor="downloadLocation">文件下载位置 *</Label>
            <Input
              id="downloadLocation"
              value={formData.downloadLocation}
              onChange={(e) =>
                setFormData({ ...formData, downloadLocation: e.target.value })
              }
              placeholder="Windows: C:\Users\用户名\Desktop  |  Linux/Mac: /home/username/Desktop"
            />
          </div>

          {/* 默认下载路径 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefaultDownloadLocation"
              checked={formData.isDefaultDownloadLocation}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  isDefaultDownloadLocation: checked as boolean,
                })
              }
            />
            <Label htmlFor="isDefaultDownloadLocation" className="text-sm font-normal">
              默认此路径为下载路径
              <span className="text-muted-foreground ml-2">
                如果不勾选，每次下载时会询问保存地址
              </span>
            </Label>
          </div>

          {/* 下载速率限制 */}
          <div className="space-y-2">
            <Label>下载速率限制</Label>
            <div className="flex items-center gap-4">
              <RadioGroup
                value={formData.enableDownloadSpeedLimit ? 'limited' : 'unlimited'}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    enableDownloadSpeedLimit: value === 'limited',
                  })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unlimited" id="unlimited" />
                  <Label htmlFor="unlimited" className="font-normal">
                    不限制
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="limited" id="limited" />
                  <Label htmlFor="limited" className="font-normal">
                    上限
                  </Label>
                </div>
              </RadioGroup>

              {formData.enableDownloadSpeedLimit && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={200}
                    value={formData.downloadSpeedLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        downloadSpeedLimit: parseInt(e.target.value) || 5,
                      })
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">MB/s</span>
                  <span className="text-sm text-muted-foreground">
                    (可输入 1-200 之间的整数)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 并发限制 */}
          <div className="space-y-2">
            <Label>并发限制</Label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">同时上传数量</span>
              <Select
                value={formData.concurrentUploadQuantity.toString()}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    concurrentUploadQuantity: parseInt(value),
                  })
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}个
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-sm text-muted-foreground">同时下载数量</span>
              <Select
                value={formData.concurrentDownloadQuantity.toString()}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    concurrentDownloadQuantity: parseInt(value),
                  })
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}个
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 分片大小 */}
          <div className="space-y-2">
            <Label>分片大小</Label>
            <div className="flex items-center gap-4">
              <Select
                value={formData.chunkSize.toString()}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    chunkSize: parseInt(value),
                  })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={(2 * 1024 * 1024).toString()}>2 MB</SelectItem>
                  <SelectItem value={(5 * 1024 * 1024).toString()}>5 MB</SelectItem>
                  <SelectItem value={(10 * 1024 * 1024).toString()}>10 MB</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                上传文件时的分片大小，推荐设置 5 MB
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? '保存中...' : '保存'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
