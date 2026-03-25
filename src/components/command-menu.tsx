import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { Command as CommandPrimitive } from 'cmdk'
import {
  FileText,
  Folder,
  Image,
  Music,
  Search,
  Video,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useSearch } from '@/context/search-provider'
import {
  CommandDialog,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import type { FileType } from '@/types/file'
import { cn } from '@/lib/utils'

/** `all` 表示未选类型；其余与文件页 URL `type` / `isDir` 一致 */
export type SearchScopeId = 'all' | 'image' | 'video' | 'folder' | 'document' | 'audio'

const FILE_TYPE_OPTIONS: {
  id: Exclude<SearchScopeId, 'all'>
  label: string
  icon: ComponentType<{ className?: string }>
}[] = [
  { id: 'image', label: '图片', icon: Image },
  { id: 'video', label: '视频', icon: Video },
  { id: 'folder', label: '文件夹', icon: Folder },
  { id: 'document', label: '文档', icon: FileText },
  { id: 'audio', label: '音频', icon: Music },
]

function scopeLabel(scope: SearchScopeId): string {
  if (scope === 'all') return ''
  return FILE_TYPE_OPTIONS.find((o) => o.id === scope)?.label ?? ''
}

/** 与 `useFileList` / 文件页 `searchParams` 约定一致：`keyword`、`type`、`isDir` */
function buildFilesSearchHref(keyword: string, scope: SearchScopeId): string {
  const k = keyword.trim()
  const params = new URLSearchParams()
  if (k) params.set('keyword', k)
  if (scope === 'all') {
    // 仅关键字
  } else if (scope === 'folder') {
    params.set('isDir', 'true')
  } else {
    params.set('type', scope as FileType)
  }
  const q = params.toString()
  return q ? `/files?${q}` : '/files'
}

export function CommandMenu() {
  const { open, setOpen } = useSearch()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [keyword, setKeyword] = useState('')
  const [scopeId, setScopeId] = useState<SearchScopeId>('all')

  useEffect(() => {
    if (!open) return
    setKeyword('')
    setScopeId('all')
  }, [open])

  /** 选中类型后聚焦输入框 */
  useLayoutEffect(() => {
    if (!open || scopeId === 'all') return
    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(id)
  }, [open, scopeId])

  const showScopeBadge = scopeId !== 'all'
  const hasKeyword = keyword.trim().length > 0

  const submitToFilesPage = () => {
    const q = keyword.trim()
    if (!q) return
    setOpen(false)
    navigate(buildFilesSearchHref(q, scopeId))
  }

  /** 清空关键字并恢复为「全部」类型 */
  const clearSearch = () => {
    setKeyword('')
    setScopeId('all')
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      contentTitle='搜索文件'
      hideClose
      commandProps={{ shouldFilter: false }}
    >
      <div
        className='flex items-center gap-2 border-b px-3 py-2'
        cmdk-input-wrapper=''
      >
        <Search className='size-4 shrink-0 opacity-50' aria-hidden />
        {showScopeBadge ? (
          <span className='inline-flex max-w-[45%] shrink-0 items-center rounded-md bg-primary/12 px-2 py-0.5 text-xs font-medium text-primary'>
            <span className='truncate'>{scopeLabel(scopeId)}:</span>
          </span>
        ) : null}
        <CommandPrimitive.Input
          ref={inputRef}
          className='flex h-10 min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
          placeholder={
            showScopeBadge ? '输入关键字…' : '搜索全部文件，输入关键字…'
          }
          value={keyword}
          onValueChange={setKeyword}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return
            e.preventDefault()
            e.stopPropagation()
            submitToFilesPage()
          }}
        />
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-8 shrink-0 px-2 text-xs text-muted-foreground hover:text-foreground'
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onClick={(e) => {
            e.stopPropagation()
            clearSearch()
          }}
        >
          清空
        </Button>
        <Separator orientation='vertical' className='h-4 shrink-0' />
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8 shrink-0'
          aria-label='关闭'
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onClick={(e) => {
            e.stopPropagation()
            setOpen(false)
          }}
        >
          <X className='size-4' />
        </Button>
      </div>

      <CommandList className='max-h-[min(380px,55vh)]'>
        {scopeId === 'all' ? (
          <CommandGroup heading='文件类型（可选）'>
            {FILE_TYPE_OPTIONS.map(({ id, label, icon: Icon }) => (
              <CommandItem
                key={id}
                value={`type-${id}`}
                keywords={[label]}
                onSelect={() => {
                  setScopeId(id)
                }}
              >
                <Icon className='size-4' />
                <span>{label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}

        <div
          className={cn(
            'px-4 py-3 text-center text-xs text-muted-foreground',
            scopeId === 'all' ? 'border-t' : ''
          )}
        >
          {showScopeBadge
            ? hasKeyword
              ? '按回车跳转至文件页并搜索'
              : '在当前类型下输入关键字，按回车跳转并搜索'
            : hasKeyword
              ? '按回车跳转至「全部文件」并搜索'
              : '默认搜索全部文件；可先选择类型再输入关键字，按回车跳转'}
        </div>
      </CommandList>
    </CommandDialog>
  )
}
