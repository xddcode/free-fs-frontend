import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getFileIcon, handleIconError } from '@/utils/file-icon';
import type { FileItem } from '@/types/file';

interface RenameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: FileItem | null;
  onConfirm: (fileId: string, newName: string) => void;
}

export function RenameModal({ open, onOpenChange, file, onConfirm }: RenameModalProps) {
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (open && file) {
      // 如果是文件且有后缀，只显示文件名部分（不含后缀）
      if (!file.isDir && file.suffix) {
        const dotIndex = file.displayName.lastIndexOf('.');
        if (dotIndex > 0) {
          setNewName(file.displayName.substring(0, dotIndex));
        } else {
          setNewName(file.displayName);
        }
      } else {
        // 文件夹或无后缀文件，显示完整名称
        setNewName(file.displayName);
      }
    } else if (!open) {
      setNewName('');
    }
  }, [open, file]);

  const handleConfirm = () => {
    if (!file || !newName.trim()) return;
    
    let finalName = newName.trim();
    // 如果是文件且有后缀，拼接后缀名
    if (!file.isDir && file.suffix) {
      finalName = `${finalName}.${file.suffix}`;
    }
    
    onConfirm(file.id, finalName);
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
          <DialogTitle>重命名</DialogTitle>
        </DialogHeader>
        <div className="py-3 pb-4 px-5">
          {/* 文件图标预览 */}
          <div className="flex justify-center mb-6">
            <img
              src={getFileIcon(file?.isDir ? 'dir' : file?.suffix || '')}
              alt={file?.displayName}
              className="w-[88px] h-[88px] object-contain"
              onError={handleIconError}
            />
          </div>
          {/* 输入框 */}
          <Input
            placeholder="请输入新名称"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            maxLength={100}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!newName.trim()}>
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
