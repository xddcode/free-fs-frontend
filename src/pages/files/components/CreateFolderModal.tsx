import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileIcon } from '@/components/file-icon';

interface CreateFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string;
  onConfirm: (folderName: string, parentId?: string) => void;
}

export function CreateFolderModal({ open, onOpenChange, parentId, onConfirm }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('');

  useEffect(() => {
    if (!open) {
      setFolderName('');
    }
  }, [open]);

  const handleConfirm = () => {
    if (!folderName.trim()) return;
    onConfirm(folderName, parentId);
    setFolderName('');
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>新建文件夹</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 px-6 pb-4">
          {/* 文件夹图标 */}
          <div className="flex items-center justify-center">
            <FileIcon type="folder" size={80} />
          </div>
          {/* 输入框 */}
          <Input
            placeholder="请输入文件夹名称"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="text-center"
            maxLength={50}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!folderName.trim()}>
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
