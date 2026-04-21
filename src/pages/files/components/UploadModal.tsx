import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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

// 单个文件 item，memo 避免无关重渲染
const FileItem = memo(
  ({
    index,
    displayName,
    onRemove,
  }: {
    file: FileWithPath
    index: number
    displayName: string
    onRemove: (index: number) => void
  }) => (
    <div className='flex animate-in items-center justify-between rounded-lg bg-accent p-3 fade-in slide-in-from-top-1'>
      <div className='flex min-w-0 flex-1 items-center gap-2'>
        <FileIcon className='h-4 w-4 flex-shrink-0' />
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className='text-sm break-words whitespace-normal'
              style={{ wordBreak: 'break-all' }}
            >
              {displayName}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{displayName}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <X
        className='h-4 w-4 flex-shrink-0 cursor-pointer text-muted-foreground hover:text-destructive'
        onClick={() => onRemove(index)}
      />
    </div>
  )
)

export default function UploadModal({
  open,
  onOpenChange,
  parentId,
  isDirectoryMode = false,
}: UploadModalProps) {
  const { t } = useTranslation('files')
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
        toast.warning(t('upload.toastMax'))
        return
      }
      setFileList([...fileList, ...files])
    }
  }

  const handleRemoveFile = useCallback((index: number) => {
    setFileList((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const items = Array.from(e.dataTransfer.items)
    const files: FileWithPath[] = []

    // 递归读取文件夹，并行处理同级 entries
    const readEntry = (entry: any, path = ''): Promise<void> => {
      if (entry.isFile) {
        return new Promise((resolve) => {
          entry.file((file: File) => {
            // 直接复用原始 File 对象，避免重新构造 blob
            Object.defineProperty(file, 'webkitRelativePath', {
              value: path + file.name,
              writable: false,
              configurable: true,
            })
            files.push(file as FileWithPath)
            resolve()
          })
        })
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader()
        return new Promise((resolve) => {
          dirReader.readEntries(async (entries: any[]) => {
            // 并行处理同级子项
            await Promise.all(
              entries.map((childEntry) =>
                readEntry(childEntry, path + entry.name + '/')
              )
            )
            resolve()
          })
        })
      }
      return Promise.resolve()
    }

    // 并行处理所有顶层拖拽项
    const entries = items
      .map((item) => item.webkitGetAsEntry?.())
      .filter(Boolean)

    if (files.length > 0) {
      setFileList([...fileList, ...files])
    } else {
      // 如果没有通过 webkitGetAsEntry 获取到文件，使用传统方式
      const fallbackFiles = Array.from(e.dataTransfer.files) as FileWithPath[]
      if (!isDirectoryMode && fallbackFiles.length + fileList.length > 10) {
        toast.warning(t('upload.toastMax'))
        return
      }
    }

    // fallback：使用传统方式
    const fallbackFiles = Array.from(e.dataTransfer.files) as FileWithPath[]
    if (!isDirectoryMode && fallbackFiles.length > 0) {
      setFileList((prev) => {
        if (!isDirectoryMode && fallbackFiles.length + prev.length > 10) {
          toast.warning('单次最多上传 10 个文件')
          return prev
        }
        return [...prev, ...fallbackFiles]
      })
    }
  }, [isDirectoryMode])

  const handleSubmit = async () => {
    if (fileList.length === 0) {
      toast.warning(
        isDirectoryMode ? t('upload.pickFolder') : t('upload.pickFile')
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

    // 关闭弹窗（进度见右下角 UploadPanel，不再弹 toast，避免挡住进度条）
    onOpenChange(false)
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
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>
            {isDirectoryMode ? t('upload.titleFolder') : t('upload.titleFile')}
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
                ? t('upload.dropFolder')
                : t('upload.dropFile')}
            </div>
            <div className='mt-2 text-sm text-muted-foreground'>
              {isDirectoryMode
                ? t('upload.hintFolder')
                : t('upload.hintFile')}
            </div>
          </label>

          {fileList.length > 0 && (
            <TooltipProvider>
              <div className='mt-4 max-h-60 space-y-2 overflow-y-auto'>
                {fileList.map((file, index) => (
                  <FileItem
                    key={index}
                    file={file}
                    index={index}
                    displayName={getDisplayName(file)}
                    onRemove={handleRemoveFile}
                  />
                ))}
              </div>
            </TooltipProvider>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={fileList.length === 0}>
            {t('upload.addToList')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
