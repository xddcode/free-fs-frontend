import { useState, useEffect, useRef } from 'react'
import type { FileItem } from '@/types/file'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { FileIcon } from '@/components/file-icon'

interface RenameModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: FileItem | null
  onConfirm: (fileId: string, newName: string) => void
}

export function RenameModal({
  open,
  onOpenChange,
  file,
  onConfirm,
}: RenameModalProps) {
  const [newName, setNewName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && file) {
      // 如果是文件且有后缀，只显示文件名部分（不含后缀）
      if (!file.isDir && file.suffix) {
        const dotIndex = file.displayName.lastIndexOf('.')
        if (dotIndex > 0) {
          setNewName(file.displayName.substring(0, dotIndex))
        } else {
          setNewName(file.displayName)
        }
      } else {
        // 文件夹或无后缀文件，显示完整名称
        setNewName(file.displayName)
      }

      // 延迟聚焦并选中文本，确保在 Dialog 完全打开后执行
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.select()
        }
      }, 100)
    } else if (!open) {
      setNewName('')
    }
  }, [open, file])

  const handleConfirm = () => {
    if (!file || !newName.trim()) return

    let finalName = newName.trim()
    // 如果是文件且有后缀，拼接后缀名
    if (!file.isDir && file.suffix) {
      finalName = `${finalName}.${file.suffix}`
    }

    onConfirm(file.id, finalName)
    onOpenChange(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[420px]'>
        <DialogHeader>
          <DialogTitle>重命名</DialogTitle>
        </DialogHeader>
        <div className='space-y-6 px-6 pb-4'>
          {/* 文件图标预览 */}
          <div className='flex justify-center'>
            <FileIcon
              type={file?.isDir ? 'dir' : file?.suffix || ''}
              size={88}
            />
          </div>
          {/* 输入框 */}
          <Input
            ref={inputRef}
            placeholder='请输入新名称'
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={100}
          />
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!newName.trim()}>
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
