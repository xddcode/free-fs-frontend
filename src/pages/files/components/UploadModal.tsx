import { useState, useEffect } from 'react';
import { Upload, X, FileIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTransferStore } from '@/store/transfer';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string;
}

export default function UploadModal({
  open,
  onOpenChange,
  parentId,
}: UploadModalProps) {
  const [fileList, setFileList] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const { startUploadSession, createTask } = useTransferStore();

  useEffect(() => {
    if (!open) {
      setFileList([]);
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + fileList.length > 10) {
      toast.warning('单次最多上传 10 个文件');
      return;
    }
    setFileList([...fileList, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setFileList(fileList.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length + fileList.length > 10) {
      toast.warning('单次最多上传 10 个文件');
      return;
    }
    setFileList([...fileList, ...files]);
  };

  const handleSubmit = async () => {
    if (fileList.length === 0) {
      toast.warning('请选择要上传的文件');
      return;
    }

    // 开始新的上传批次
    startUploadSession();

    // 添加到上传任务列表
    await Promise.all(
      fileList.map((file) => createTask(file, parentId))
    );

    // 关闭弹窗
    onOpenChange(false);

    // 显示通知
    toast.success('文件已添加到传输列表', {
      description: '可前往传输列表查看上传进度',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>上传文件</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />

          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary hover:bg-accent'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-primary mb-4" />
            <div className="text-base font-medium text-foreground">
              点击或拖拽文件到此处上传
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              支持同时上传多个文件，单次最多 10 个
            </div>
          </label>

          {fileList.length > 0 && (
            <div className="mt-4 space-y-2">
              {fileList.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent animate-in fade-in slide-in-from-top-1"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm truncate">{file.name}</span>
                  </div>
                  <X
                    className="h-4 w-4 text-muted-foreground hover:text-destructive cursor-pointer flex-shrink-0"
                    onClick={() => handleRemoveFile(index)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={fileList.length === 0}>
            添加到上传列表
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
