import { useState, useEffect } from 'react'
import { useTransferStore } from '@/store/transfer'
import { Upload, X, FileIcon, FolderUp } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface UploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parentId?: string
  isDirectoryMode?: boolean
}

interface FileWithPath extends File {
  webkitRelativePath: string
}

export default function UploadModal({
  open,
  onOpenChange,
  parentId,
  isDirectoryMode = false,
}: UploadModalProps) {
  const [fileList, setFileList] = useState<FileWithPath[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const { startUploadSession, createTask, createTasksWithDirectory } =
    useTransferStore()

  useEffect(() => {
    if (!open) {
      setFileList([])
    }
  }, [open])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as FileWithPath[]

    if (isDirectoryMode) {
      // 目录模式：不限制数量
      setFileList([...fileList, ...files])
    } else {
      // 文件模式：限制 10 个
      if (files.length + fileList.length > 10) {
        toast.warning('单次最多上传 10 个文件')
        return
      }
      setFileList([...fileList, ...files])
    }
  }

  const handleRemoveFile = (index: number) => {
    setFileList(fileList.filter((_, i) => i !== index))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const items = Array.from(e.dataTransfer.items)
    const files: FileWithPath[] = []

    // 递归读取文件夹
    const readEntry = async (entry: any, path = ''): Promise<void> => {
      if (entry.isFile) {
        return new Promise((resolve) => {
          entry.file((file: File) => {
            const fileWithPath = file as FileWithPath
            fileWithPath.webkitRelativePath = path + file.name
            files.push(fileWithPath)
            resolve()
          })
        })
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader()
        return new Promise((resolve) => {
          dirReader.readEntries(async (entries: any[]) => {
            for (const childEntry of entries) {
              await readEntry(childEntry, path + entry.name + '/')
            }
            resolve()
          })
        })
      }
    }

    // 处理拖拽的项目
    for (const item of items) {
      const entry = item.webkitGetAsEntry?.()
      if (entry) {
        await readEntry(entry)
      }
    }

    if (files.length > 0) {
      setFileList([...fileList, ...files])
    } else {
      // 如果没有通过 webkitGetAsEntry 获取到文件，使用传统方式
      const fallbackFiles = Array.from(e.dataTransfer.files) as FileWithPath[]
      if (!isDirectoryMode && fallbackFiles.length + fileList.length > 10) {
        toast.warning('单次最多上传 10 个文件')
        return
      }
      setFileList([...fileList, ...fallbackFiles])
    }
  }

  const handleSubmit = async () => {
    if (fileList.length === 0) {
      toast.warning(
        isDirectoryMode ? '请选择要上传的文件夹' : '请选择要上传的文件'
      )
      return
    }

    // 开始新的上传批次
    startUploadSession()

    if (isDirectoryMode) {
      // 目录模式：解析目录结构并上传
      await createTasksWithDirectory(fileList, parentId)
    } else {
      // 文件模式：直接上传
      await Promise.all(fileList.map((file) => createTask(file, parentId)))
    }

    // 关闭弹窗
    onOpenChange(false)

    // 显示通知
    toast.success(
      isDirectoryMode ? '文件夹已添加到传输列表' : '文件已添加到传输列表',
      {
        description: '可前往传输列表查看上传进度',
      }
    )
  }

  // 获取显示的文件名
  const getDisplayName = (file: FileWithPath) => {
    if (isDirectoryMode && file.webkitRelativePath) {
      return file.webkitRelativePath
    }
    return file.name
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle>
            {isDirectoryMode ? '上传文件夹' : '上传文件'}
          </DialogTitle>
        </DialogHeader>

        <div className='py-4'>
          <input
            type='file'
            multiple={!isDirectoryMode}
            {...(isDirectoryMode ? { webkitdirectory: '', directory: '' } : {})}
            onChange={handleFileChange}
            className='hidden'
            id='file-upload'
          />

          <label
            htmlFor='file-upload'
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary hover:bg-accent'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDirectoryMode ? (
              <FolderUp className='mb-4 h-12 w-12 text-primary' />
            ) : (
              <Upload className='mb-4 h-12 w-12 text-primary' />
            )}
            <div className='text-base font-medium text-foreground'>
              {isDirectoryMode
                ? '点击或拖拽文件夹到此处上传'
                : '点击或拖拽文件到此处上传'}
            </div>
            <div className='mt-2 text-sm text-muted-foreground'>
              {isDirectoryMode
                ? '支持上传整个文件夹，保留目录结构'
                : '支持同时上传多个文件，单次最多 10 个'}
            </div>
          </label>

          {fileList.length > 0 && (
            <div className='mt-4 max-h-60 space-y-2 overflow-y-auto'>
              {fileList.map((file, index) => (
                <div
                  key={index}
                  className='flex animate-in items-center justify-between rounded-lg bg-accent p-3 fade-in slide-in-from-top-1'
                >
                  <div className='flex min-w-0 flex-1 items-center gap-2'>
                    <FileIcon className='h-4 w-4 flex-shrink-0' />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className='text-sm break-words whitespace-normal'
                            style={{ wordBreak: 'break-all' }}
                          >
                            {getDisplayName(file)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getDisplayName(file)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <X
                    className='h-4 w-4 flex-shrink-0 cursor-pointer text-muted-foreground hover:text-destructive'
                    onClick={() => handleRemoveFile(index)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={fileList.length === 0}>
            添加到上传列表
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
