import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import type { FileRecycleItem } from '@/types/file'
import { Undo2, Trash2, FileText } from 'lucide-react'
import { toast } from 'sonner'
import {
  getRecyclePage,
  restoreFiles,
  permanentDeleteFiles,
  clearRecycle,
} from '@/api/file'
import { cn } from '@/lib/utils'
import { formatFileSize, formatTime } from '@/utils/format'
import { usePermission } from '@/hooks/use-permission'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { BulkSelectionBar } from '@/components/bulk-selection-bar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FileIcon } from '@/components/file-icon'
import { useToolbarSearch } from '@/hooks/useToolbarSearch'
import { FileBreadcrumb } from './FileBreadcrumb'
import { Toolbar } from './Toolbar'
import { FileListRowActionIcon } from './FileListView'
import { DataTablePagination } from '@/components/data-table'

const RECYCLE_TABLE_HEAD: Record<string, string> = {
  select: 'w-12',
  displayName: '',
  size: 'w-32',
  deletedTime: 'w-48',
  actions: 'w-40 text-center',
}

export default function RecycleBinView() {
  const { t } = useTranslation('files')
  const { hasPermission } = usePermission()
  const canWrite = hasPermission('file:write')
  const canRestore = canWrite
  const canDelete = canWrite
  const canClear = canWrite
  const canOperateRecycle = canWrite

  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fileList, setFileList] = useState<FileRecycleItem[]>([])
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const { searchInput, setSearchInput, searchKeyword, commitSearch } =
    useToolbarSearch('keyword')
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const prevSearchKeyword = useRef(searchKeyword)

  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [operatingItem, setOperatingItem] = useState<{
    id: string
    name: string
  } | null>(null)

  const fetchRecyclePage = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getRecyclePage({
        keyword: searchKeyword || undefined,
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
      })
      setFileList(result.records)
      setTotal(Number(result.total ?? 0))
    } finally {
      setLoading(false)
    }
  }, [searchKeyword, pagination.pageIndex, pagination.pageSize])

  const handleRefresh = () => {
    void fetchRecyclePage()
  }

  const handleRestoreSingle = (fileId: string, fileName: string) => {
    setOperatingItem({ id: fileId, name: fileName })
    setRestoreDialogOpen(true)
  }

  const confirmRestore = async () => {
    const ids = operatingItem ? [operatingItem.id] : selectedIds
    if (ids.length === 0) return

    try {
      await restoreFiles(ids)
      toast.success(t('recycle.toastRestoreMany', { count: ids.length }))
      setSelectedIds([])
      setOperatingItem(null)
      void fetchRecyclePage()
    } finally {
      // noop
    }
  }

  const handleBatchRestore = () => {
    if (selectedIds.length === 0) return
    setOperatingItem(null)
    setRestoreDialogOpen(true)
  }

  const handleDeleteSingle = (fileId: string, fileName: string) => {
    setOperatingItem({ id: fileId, name: fileName })
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    const ids = operatingItem ? [operatingItem.id] : selectedIds
    if (ids.length === 0) return

    try {
      await permanentDeleteFiles(ids)
      toast.success(t('recycle.toastDeleteMany', { count: ids.length }))
      setSelectedIds([])
      setOperatingItem(null)
      void fetchRecyclePage()
    } finally {
      // noop
    }
  }

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return
    setOperatingItem(null)
    setDeleteDialogOpen(true)
  }

  const handleClearRecycle = () => {
    setClearDialogOpen(true)
  }

  const confirmClearRecycle = async () => {
    setLoading(true)
    try {
      await clearRecycle()
      toast.success(t('recycle.toastEmpty'))
      setClearDialogOpen(false)
      setSelectedIds([])
      commitSearch('')
      setPagination((p) => ({ ...p, pageIndex: 0 }))
    } finally {
      setLoading(false)
    }
  }

  const clearSelection = () => {
    setSelectedIds([])
  }

  const handleSelectAll = (checked: boolean) => {
    const pageIds = fileList.map((f) => f.id)
    setSelectedIds((prev) => {
      if (checked) {
        return [...new Set([...prev, ...pageIds])]
      }
      return prev.filter((id) => !pageIds.includes(id))
    })
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearSelection()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const keywordChanged = prevSearchKeyword.current !== searchKeyword
    prevSearchKeyword.current = searchKeyword

    if (keywordChanged && pagination.pageIndex !== 0) {
      setPagination((p) => ({ ...p, pageIndex: 0 }))
      return
    }

    void fetchRecyclePage()
  }, [searchKeyword, pagination.pageIndex, pagination.pageSize, fetchRecyclePage])

  const pageIds = fileList.map((f) => f.id)
  const selectedOnPageCount = pageIds.filter((id) =>
    selectedIds.includes(id)
  ).length
  const isAllPageSelected =
    pageIds.length > 0 && selectedOnPageCount === pageIds.length
  const isSomePageSelected =
    selectedOnPageCount > 0 && !isAllPageSelected

  const columns = useMemo<ColumnDef<FileRecycleItem>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={
              isAllPageSelected
                ? true
                : isSomePageSelected
                  ? 'indeterminate'
                  : false
            }
            onCheckedChange={handleSelectAll}
            aria-label={t('recycle.ariaSelectAll')}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedIds.includes(row.original.id)}
            onCheckedChange={(checked) => {
              const id = row.original.id
              setSelectedIds((prev) => {
                if (checked) {
                  return prev.includes(id) ? prev : [...prev, id]
                }
                return prev.filter((x) => x !== id)
              })
            }}
            aria-label={t('recycle.ariaSelectRow', {
              name: row.original.displayName,
            })}
          />
        ),
        enableSorting: false,
        size: 48,
      },
      {
        accessorKey: 'displayName',
        header: t('recycle.colName'),
        cell: ({ row }) => {
          const file = row.original
          if (!canOperateRecycle) {
            return null
          }
          return (
            <div className='flex items-center gap-3'>
              <div className='flex h-8 w-8 items-center justify-center rounded'>
                <FileIcon
                  type={file.isDir ? 'dir' : file.suffix || ''}
                  size={28}
                  className='shrink-0'
                />
              </div>
              <span className='truncate text-sm font-normal text-foreground/90'>
                {file.displayName}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'size',
        header: t('recycle.colSize'),
        cell: ({ row }) => (
          <span className='text-sm text-muted-foreground'>
            {row.original.isDir ? '-' : formatFileSize(row.original.size)}
          </span>
        ),
      },
      {
        accessorKey: 'deletedTime',
        header: t('recycle.colDeleted'),
        cell: ({ row }) => (
          <span className='text-sm text-muted-foreground'>
            {formatTime(row.original.deletedTime)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => (
          <span className='block w-full text-center'>
            {t('recycle.colActions')}
          </span>
        ),
        cell: ({ row }) => {
          const file = row.original
          return (
            <div
              className='text-center'
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu
                modal={false}
                onOpenChange={(open) =>
                  setOpenMenuId(open ? file.id : null)
                }
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className={cn(
                      'size-8 rounded-lg text-muted-foreground transition-colors',
                      'hover:bg-primary/10 hover:text-primary',
                      'group-hover:text-primary',
                      openMenuId === file.id &&
                        'bg-primary/10 text-primary'
                    )}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={t('recycle.ariaMore')}
                  >
                    <FileListRowActionIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  {canRestore && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRestoreSingle(file.id, file.displayName)
                      }}
                    >
                      <Undo2 className='size-4' />
                      {t('recycle.menuRestore')}
                    </DropdownMenuItem>
                  )}
                  {canRestore && canDelete && <DropdownMenuSeparator />}
                  {canDelete && (
                    <DropdownMenuItem
                      className='text-destructive focus:text-destructive'
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteSingle(file.id, file.displayName)
                      }}
                    >
                      <Trash2 className='size-4' />
                      {t('recycle.menuDeleteForever')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
        enableSorting: false,
      },
    ],
    [
      canDelete,
      canOperateRecycle,
      canRestore,
      fileList,
      selectedIds,
      openMenuId,
      t,
    ]
  )

  const pageCount = Math.max(
    1,
    Math.ceil(total / Math.max(1, pagination.pageSize))
  )

  const table = useReactTable({
    data: fileList,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount,
    rowCount: total,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    enableSorting: false,
  })

  return (
    <div className='flex h-full flex-col'>
      <div className='flex items-center gap-4 border-b px-6 py-4'>
        <div className='min-w-0 flex-1'>
          <FileBreadcrumb
            breadcrumbPath={[]}
            customTitle={t('recycle.title')}
            onNavigate={() => {}}
          />
        </div>

        <Toolbar
          searchKeyword={searchInput}
          onSearchChange={setSearchInput}
          onSearch={commitSearch}
          onUpload={() => {}}
          onCreateFolder={() => {}}
          onRefresh={handleRefresh}
          hideActions={true}
        />

        <Button
          variant='destructive'
          size='sm'
          disabled={total === 0}
          onClick={handleClearRecycle}
          hidden={!canClear}
        >
          <Trash2 className='mr-2 h-4 w-4' />
          {t('recycle.clearTrash')}
        </Button>
      </div>

      <div className='flex items-center justify-between border-b px-6 py-3'>
        <div className='flex items-center gap-3'>
          <span className='text-sm text-muted-foreground'>
            {selectedIds.length > 0
              ? t('recycle.selectedHint', { count: selectedIds.length })
              : t('recycle.totalHint', { total })}
          </span>
        </div>
      </div>

      <div className='flex-1 overflow-hidden'>
        <div className='flex h-full min-h-0 flex-col'>
          {loading ? (
            <div className='flex h-full items-center justify-center'>
              <p className='text-muted-foreground'>{t('common.loading')}</p>
            </div>
          ) : fileList.length === 0 ? (
            <div className='flex h-full items-center justify-center'>
              <Empty className='border-none'>
                <EmptyHeader>
                  <EmptyMedia variant='icon'>
                    <FileText className='h-12 w-12' />
                  </EmptyMedia>
                  <EmptyTitle>{t('recycle.emptyTitle')}</EmptyTitle>
                  <EmptyDescription>
                    {searchKeyword
                      ? t('recycle.emptySearch')
                      : t('recycle.emptyDefault')}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <>
              <div className='min-h-0 flex-1 overflow-auto px-6 pt-6'>
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className='bg-muted/50'>
                          {headerGroup.headers.map((header) => (
                            <TableHead
                              key={header.id}
                              className={cn(
                                'font-medium text-muted-foreground',
                                RECYCLE_TABLE_HEAD[header.column.id] ?? ''
                              )}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows.length > 0 ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            className={cn(
                              'group transition-colors',
                              selectedIds.includes(row.original.id) &&
                                'bg-primary/5'
                            )}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell
                                key={cell.id}
                                onClick={
                                  cell.column.id === 'select' ||
                                  cell.column.id === 'actions'
                                    ? (e) => e.stopPropagation()
                                    : undefined
                                }
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className='h-24 text-center'
                          >
                            {t('recycle.noData')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className='shrink-0 border-t px-6 py-3'>
                <DataTablePagination table={table} />
              </div>
            </>
          )}
        </div>
      </div>

      {selectedIds.length > 0 && canOperateRecycle && (
        <BulkSelectionBar
          selectedCount={selectedIds.length}
          onClear={clearSelection}
          ariaLabel={t('recycle.bulkBar')}
        >
          {canRestore && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className='size-8 shrink-0'
                  onClick={handleBatchRestore}
                  aria-label={t('recycle.ariaRestore')}
                >
                  <Undo2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('recycle.tooltipRestore')}</p>
              </TooltipContent>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='destructive'
                  size='icon'
                  className='size-8 shrink-0'
                  onClick={handleBatchDelete}
                  aria-label={t('recycle.ariaDelete')}
                >
                  <Trash2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('recycle.tooltipDeleteForever')}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </BulkSelectionBar>
      )}

      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('recycle.confirmRestoreTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {operatingItem
                ? t('recycle.confirmRestoreOne', {
                    name: operatingItem.name,
                  })
                : t('recycle.confirmRestoreMany', {
                    count: selectedIds.length,
                  })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore}>
              {t('recycle.restoreAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('recycle.confirmDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {operatingItem
                ? t('recycle.confirmDeleteOne', {
                    name: operatingItem.name,
                  })
                : t('recycle.confirmDeleteMany', {
                    count: selectedIds.length,
                  })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {t('recycle.deleteForever')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('recycle.confirmEmptyTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('recycle.confirmEmptyDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClearRecycle}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {t('recycle.emptyTrash')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
