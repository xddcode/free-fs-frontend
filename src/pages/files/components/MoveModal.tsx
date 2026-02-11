import { useState, useEffect, useRef } from 'react'
import type { FileItem } from '@/types/file'
import { Home, FolderPlus, Check, X } from 'lucide-react'
import FolderIconSvg from '../../../../public/fi/folder'
import { toast } from 'sonner'
import { getFolders, createFolder } from '@/api/file'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { FileIcon } from '@/components/file-icon'

interface MoveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: FileItem | null
  files: FileItem[]
  onConfirm: (fileIds: string[], targetDirId: string) => Promise<void>
  onRefresh?: () => void
}

export function MoveModal({
  open,
  onOpenChange,
  file,
  files,
  onConfirm,
  onRefresh,
}: MoveModalProps) {
  const [loading, setLoading] = useState(false)
  const [folders, setFolders] = useState<FileItem[]>([])
  const [breadcrumbPath, setBreadcrumbPath] = useState<FileItem[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string>('')
  const [currentParentId, setCurrentParentId] = useState<string | undefined>(
    undefined
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const movingFiles = file ? [file] : files
  const movingFileIds = movingFiles.map((f) => f.id)

  // 加载文件夹列表
  const loadFolders = async (parentId?: string) => {
    setLoading(true)
    try {
      const response = await getFolders(parentId)
      const filteredFolders = response.filter(
        (folder) => !movingFileIds.includes(folder.id)
      )
      setFolders(filteredFolders)
    } finally {
      setLoading(false)
    }
  }

  // 选择文件夹
  const selectFolder = (folder: FileItem) => {
    setSelectedFolderId(folder.id)
  }

  // 进入文件夹（双击）
  const enterFolder = (folder: FileItem) => {
    setBreadcrumbPath([...breadcrumbPath, folder])
    setCurrentParentId(folder.id)
    setSelectedFolderId('')
    loadFolders(folder.id)
  }

  // 打开创建文件夹输入框
  const handleCreateFolder = () => {
    setIsCreatingFolder(true)
    setNewFolderName('')
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  // 确认创建文件夹
  const confirmCreateFolder = async () => {
    const folderName = newFolderName.trim()
    if (!folderName) {
      toast.warning('请输入文件夹名称')
      return
    }

    try {
      await createFolder({
        folderName,
        parentId: currentParentId,
      })
      toast.success('创建文件夹成功')
      setIsCreatingFolder(false)
      setNewFolderName('')
      loadFolders(currentParentId)
      onRefresh?.()
    } finally {
      // 无需处理
    }
  }

  // 取消创建文件夹
  const cancelCreateFolder = () => {
    setIsCreatingFolder(false)
    setNewFolderName('')
  }

  // 处理输入框按键
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      confirmCreateFolder()
    } else if (e.key === 'Escape') {
      cancelCreateFolder()
    }
  }

  // 通过面包屑导航
  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      // 返回根目录
      setBreadcrumbPath([])
      setCurrentParentId(undefined)
      setSelectedFolderId('')
      loadFolders(undefined)
    } else {
      // 返回到指定层级
      const newPath = breadcrumbPath.slice(0, index + 1)
      setBreadcrumbPath(newPath)
      setCurrentParentId(newPath[index].id)
      setSelectedFolderId('')
      loadFolders(newPath[index].id)
    }
  }

  // 确认移动
  const handleConfirm = async () => {
    const targetDirId = selectedFolderId || currentParentId || ''

    setIsSubmitting(true)
    try {
      await onConfirm(movingFileIds, targetDirId)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 初始化
  useEffect(() => {
    if (open) {
      setBreadcrumbPath([])
      setCurrentParentId(undefined)
      setSelectedFolderId('')
      setIsCreatingFolder(false)
      setNewFolderName('')
      loadFolders(undefined)
    }
  }, [open])

  // 检查是否移动到当前所在目录
  const targetDirId = selectedFolderId || currentParentId || ''
  const isSameDirectory = movingFiles.every((file) => {
    const fileParentId = file.parentId || ''
    return fileParentId === targetDirId
  })

  const isOkDisabled =
    (!selectedFolderId && breadcrumbPath.length > 0) || isSameDirectory

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='max-h-[85vh] max-w-2xl overflow-y-auto'
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>移动到</DialogTitle>
        </DialogHeader>

        <div className='space-y-6 px-6 pb-4'>
          {/* 面包屑导航 */}
          <div className='flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm'>
            <button
              type='button'
              className={cn(
                'flex items-center gap-1 transition-colors outline-none hover:text-primary focus:outline-none',
                breadcrumbPath.length === 0 &&
                  'cursor-default font-medium text-foreground'
              )}
              onClick={() =>
                breadcrumbPath.length > 0 && navigateToBreadcrumb(-1)
              }
              tabIndex={-1}
            >
              <Home className='h-4 w-4' />
              <span>全部文件</span>
            </button>
            {breadcrumbPath.map((folder, index) => (
              <div key={folder.id} className='flex items-center gap-2'>
                <span className='text-muted-foreground'>/</span>
                <button
                  type='button'
                  className={cn(
                    'flex items-center gap-1 transition-colors outline-none hover:text-primary focus:outline-none',
                    index === breadcrumbPath.length - 1 &&
                      'cursor-default font-medium text-foreground'
                  )}
                  onClick={() =>
                    index < breadcrumbPath.length - 1 &&
                    navigateToBreadcrumb(index)
                  }
                  tabIndex={-1}
                >
                  <FolderIconSvg size={16} />
                  <span>{folder.displayName}</span>
                </button>
              </div>
            ))}
          </div>

          {/* 文件夹列表 */}
          <div className='max-h-[400px] min-h-[300px] overflow-y-auto rounded-lg bg-muted/50'>
            {loading ? (
              <div className='flex h-[300px] items-center justify-center'>
                <p className='text-sm text-muted-foreground'>加载中...</p>
              </div>
            ) : folders.length === 0 && !isCreatingFolder ? (
              <div className='flex h-[300px] flex-col items-center justify-center text-muted-foreground'>
                <FolderIconSvg size={48} className='mb-3 opacity-50' />
                <p className='text-sm'>当前目录下没有子文件夹</p>
              </div>
            ) : (
              <div className='space-y-0.5 p-2'>
                {/* 新建文件夹输入框 */}
                {isCreatingFolder && (
                  <div
                    className='flex items-center justify-between gap-3 rounded border border-primary bg-background px-3 py-2.5'
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className='flex flex-1 items-center gap-3'>
                      <div className='h-5 w-5 flex items-center justify-center overflow-hidden'>
                        <FileIcon
                          type='dir'
                          size={20}
                          className='flex-shrink-0'
                        />
                      </div>
                      <input
                        ref={inputRef}
                        type='text'
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                        placeholder='请输入文件夹名称'
                        className='flex-1 border-none bg-transparent text-sm outline-none focus:outline-none'
                        maxLength={50}
                      />
                    </div>
                    <div className='flex items-center gap-1'>
                      <button
                        onClick={confirmCreateFolder}
                        className='rounded p-1.5 text-primary transition-colors hover:bg-primary/10'
                        title='确认'
                      >
                        <Check className='h-4 w-4' />
                      </button>
                      <button
                        onClick={cancelCreateFolder}
                        className='rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted-foreground/10'
                        title='取消'
                      >
                        <X className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                )}

                {/* 现有文件夹列表 */}
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded px-3 py-1.5 transition-colors select-none',
                      'hover:bg-muted',
                      selectedFolderId === folder.id &&
                        'bg-primary/10 font-medium text-primary'
                    )}
                    onClick={() => selectFolder(folder)}
                    onDoubleClick={() => enterFolder(folder)}
                  >
                    <div className='h-5 w-5 flex items-center justify-center overflow-hidden'>
                      <FileIcon type='dir' size={20} className='flex-shrink-0' />
                    </div>
                    <span className='flex-1 truncate text-sm'>
                      {folder.displayName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 提示信息 */}
          {isSameDirectory ? (
            <div className='flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-300'>
              <svg
                className='mt-0.5 h-4 w-4 flex-shrink-0'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              <span>文件已在当前目录，无需移动</span>
            </div>
          ) : (
            <div className='flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-300'>
              <svg
                className='mt-0.5 h-4 w-4 flex-shrink-0'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                  clipRule='evenodd'
                />
              </svg>
              <span>提示：单击选择目标文件夹，双击进入该文件夹</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant='ghost'
            onClick={handleCreateFolder}
            className='mr-auto'
          >
            <FolderPlus className='mr-2 h-4 w-4' />
            新建文件夹
          </Button>
          <DialogClose asChild>
            <Button variant='outline' disabled={isSubmitting}>
              取消
            </Button>
          </DialogClose>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || isOkDisabled}
          >
            {isSubmitting ? '移动中...' : '移动到此处'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
