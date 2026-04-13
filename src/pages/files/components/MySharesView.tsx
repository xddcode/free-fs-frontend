import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import type { ShareItem, ShareAccessRecord } from '@/types/share'
import dayjs from 'dayjs'
import {
  Copy,
  Eye,
  FileText,
  RouteOff,
  Link as LinkIcon,
  Check,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getMySharePage,
  cancelShares,
  clearAllShares,
  getShareDetailById,
  getShareAccessRecords,
} from '@/api/share'
import { cn } from '@/lib/utils'
import { formatTime, formatFileTime } from '@/utils/format'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BulkSelectionBar } from '@/components/bulk-selection-bar'
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
  DescriptionField,
  DescriptionFieldLabel,
  DescriptionFieldList,
  DescriptionFieldValue,
  DescriptionFieldValueRow,
} from '@/components/field-layout'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToolbarSearch } from '@/hooks/useToolbarSearch'
import { FileListRowActionIcon } from './FileListView'
import { FileBreadcrumb } from './FileBreadcrumb'
import { Toolbar } from './Toolbar'
import { DataTablePagination } from '@/components/data-table'

const SHARE_TABLE_HEAD: Record<string, string> = {
  select: 'w-12',
  shareName: '',
  expireTime: 'w-36',
  viewCount: 'w-28 text-center',
  downloadCount: 'w-28 text-center',
  scope: 'w-32 text-center',
  createdAt: 'w-44',
  actions: 'w-48 text-center',
}

export function MySharesView() {
  const { t } = useTranslation('files')
  const { t: tc } = useTranslation('common')
  const { hasPermission } = usePermission()
  const canShare = hasPermission('file:share')
  const canCancelShare = canShare
  const canClearShares = canShare

  const [loading, setLoading] = useState(false)
  const [shareList, setShareList] = useState<ShareItem[]>([])
  const [total, setTotal] = useState(0)
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const { searchInput, setSearchInput, searchKeyword, commitSearch } =
    useToolbarSearch('keyword')
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const prevSearchKeyword = useRef(searchKeyword)

  // 分享详情弹窗
  const [shareDetailVisible, setShareDetailVisible] = useState(false)
  const [shareDetailLoading, setShareDetailLoading] = useState(false)
  const [currentShare, setCurrentShare] = useState<ShareItem | null>(null)
  const [copiedShareDetail, setCopiedShareDetail] = useState(false)
  const [copiedDetailLink, setCopiedDetailLink] = useState(false)
  const [copiedDetailCode, setCopiedDetailCode] = useState(false)

  // 访问记录弹窗
  const [accessRecordsVisible, setAccessRecordsVisible] = useState(false)
  const [accessRecordsLoading, setAccessRecordsLoading] = useState(false)
  const [accessRecords, setAccessRecords] = useState<ShareAccessRecord[]>([])
  const [currentShareForRecords, setCurrentShareForRecords] =
    useState<ShareItem | null>(null)

  // 删除确认弹窗
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
  const [deletingShare, setDeletingShare] = useState<ShareItem | null>(null)
  const [batchDeleteDialogVisible, setBatchDeleteDialogVisible] =
    useState(false)
  const [clearAllDialogVisible, setClearAllDialogVisible] = useState(false)

  const fetchSharePage = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getMySharePage({
        keyword: searchKeyword || undefined,
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
      })
      setShareList(result.records)
      setTotal(Number(result.total ?? 0))
    } finally {
      setLoading(false)
    }
  }, [searchKeyword, pagination.pageIndex, pagination.pageSize])

  const handleRefresh = () => {
    void fetchSharePage()
  }

  const handleClearAllShares = () => {
    setClearAllDialogVisible(true)
  }

  const confirmClearAllShares = async () => {
    setLoading(true)
    try {
      await clearAllShares()
      toast.success(t('myShares.toastCleared'))
      setClearAllDialogVisible(false)
      setSelectedKeys([])
      setPagination((p) => ({ ...p, pageIndex: 0 }))
      const result = await getMySharePage({
        keyword: searchKeyword || undefined,
        page: 1,
        pageSize: pagination.pageSize,
      })
      setShareList(result.records)
      setTotal(Number(result.total ?? 0))
    } finally {
      setLoading(false)
    }
  }

  // 判断是否已过期
  const isExpired = (expireTime: string | null) => {
    if (!expireTime) return false
    return dayjs(expireTime).isBefore(dayjs())
  }

  const formatExpireTime = useCallback(
    (expireTime: string | null) => {
      if (!expireTime) return '-'

      const now = dayjs()
      const expireDate = dayjs(expireTime)

      if (expireDate.isBefore(now)) return t('myShares.expired')

      const hoursLeft = expireDate.diff(now, 'hour')
      if (hoursLeft < 1) return t('myShares.soon')
      if (hoursLeft < 24) return t('myShares.hoursLeft', { hours: hoursLeft })

      const daysLeft = expireDate.diff(now, 'day')
      return t('myShares.daysLeft', { days: daysLeft })
    },
    [t]
  )

  // 获取分享链接
  const getShareUrl = (share: ShareItem) => {
    if (share.shareUrl) return share.shareUrl
    if (share.id) {
      const baseUrl = window.location.origin
      return `${baseUrl}/s/${share.id}`
    }
    return null
  }

  const formatScopeText = useCallback(
    (scope?: string) => {
      if (!scope) return t('myShares.permPreviewDownload')
      const permissions: string[] = []
      if (scope.includes('preview')) permissions.push(t('myShares.permPreview'))
      if (scope.includes('download'))
        permissions.push(t('myShares.permDownload'))
      return permissions.length > 0 ? permissions.join(' + ') : '-'
    },
    [t]
  )

  // 快捷复制
  const handleQuickCopy = async (share: ShareItem) => {
    const content: string[] = []
    content.push(t('myShares.copyLineName', { name: share.shareName }))

    const shareUrl = getShareUrl(share)
    if (shareUrl) {
      content.push(t('myShares.copyLineLink', { url: shareUrl }))
    }

    if (share.shareCode) {
      content.push(t('myShares.copyLineCode', { code: share.shareCode }))
    }

    try {
      await navigator.clipboard.writeText(content.join('\n'))
      toast.success(t('common.copied'))
    } catch (error) {
      toast.error(t('common.copyFailed'))
    }
  }

  // 复制链接
  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      setCopiedDetailLink(true)
      setTimeout(() => setCopiedDetailLink(false), 2000)
      toast.success(t('common.copied'))
    } catch (error) {
      toast.error(t('common.copyFailed'))
    }
  }

  // 复制提取码
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedDetailCode(true)
      setTimeout(() => setCopiedDetailCode(false), 2000)
      toast.success(t('common.copied'))
    } catch (error) {
      toast.error(t('common.copyFailed'))
    }
  }

  // 复制分享详情
  const handleCopyShareDetail = async () => {
    if (!currentShare) return

    const detailText: string[] = []
    detailText.push(t('myShares.copyLineName', { name: currentShare.shareName }))

    const shareUrl = getShareUrl(currentShare)
    if (shareUrl) {
      detailText.push(t('myShares.copyLineLink', { url: shareUrl }))
    }

    if (currentShare.shareCode) {
      detailText.push(
        t('myShares.copyLineCode', { code: currentShare.shareCode })
      )
    }

    try {
      await navigator.clipboard.writeText(detailText.join('\n'))
      setCopiedShareDetail(true)
      setTimeout(() => setCopiedShareDetail(false), 2000)
      toast.success(t('common.copied'))
    } catch (error) {
      toast.error(t('common.copyFailed'))
    }
  }

  // 查看分享详情
  const handleViewShare = async (share: ShareItem) => {
    setShareDetailVisible(true)
    setShareDetailLoading(true)
    try {
      const data = await getShareDetailById(share.id)
      setCurrentShare(data)
    } finally {
      setShareDetailLoading(false)
    }
  }

  const handleViewAccessRecords = async (share: ShareItem) => {
    setCurrentShareForRecords(share)
    setAccessRecordsVisible(true)
    setAccessRecordsLoading(true)
    setAccessRecords([])
    try {
      const data = await getShareAccessRecords(share.id)
      setAccessRecords(data)
    } finally {
      setAccessRecordsLoading(false)
    }
  }

  const handleCancelShare = (share: ShareItem) => {
    setDeletingShare(share)
    setDeleteDialogVisible(true)
  }

  const confirmCancelShare = async () => {
    if (!deletingShare) return
    try {
      await cancelShares([deletingShare.id])
      toast.success(t('myShares.toastCancelOk'))
      setDeleteDialogVisible(false)
      setDeletingShare(null)
      void fetchSharePage()
    } finally {
      // 无需处理
    }
  }

  const handleBatchCancel = () => {
    if (selectedKeys.length === 0) {
      toast.warning(t('myShares.toastSelectFirst'))
      return
    }
    setBatchDeleteDialogVisible(true)
  }

  const confirmBatchCancel = async () => {
    try {
      await cancelShares(selectedKeys)
      toast.success(t('myShares.toastCancelMany', { count: selectedKeys.length }))
      setBatchDeleteDialogVisible(false)
      setSelectedKeys([])
      void fetchSharePage()
    } finally {
      // 无需处理
    }
  }

  // 全选/取消全选：仅作用于当前页，与其它页已选项合并（跨页保留）
  const handleSelectAll = (checked: boolean) => {
    const pageIds = shareList.map((s) => s.id)
    setSelectedKeys((prev) => {
      if (checked) {
        return [...new Set([...prev, ...pageIds])]
      }
      return prev.filter((id) => !pageIds.includes(id))
    })
  }

  // ESC 键取消选择
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedKeys.length > 0) {
        setSelectedKeys([])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedKeys.length])

  useEffect(() => {
    const keywordChanged = prevSearchKeyword.current !== searchKeyword
    prevSearchKeyword.current = searchKeyword

    if (keywordChanged && pagination.pageIndex !== 0) {
      setPagination((p) => ({ ...p, pageIndex: 0 }))
      return
    }

    void fetchSharePage()
  }, [searchKeyword, pagination.pageIndex, pagination.pageSize, fetchSharePage])

  const pageIds = shareList.map((s) => s.id)
  const selectedOnPageCount = pageIds.filter((id) =>
    selectedKeys.includes(id)
  ).length
  const isAllPageSelected =
    pageIds.length > 0 && selectedOnPageCount === pageIds.length
  const isSomePageSelected =
    selectedOnPageCount > 0 && !isAllPageSelected

  const columns = useMemo<ColumnDef<ShareItem>[]>(
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
            aria-label={t('myShares.ariaSelectAll')}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedKeys.includes(row.original.id)}
            onCheckedChange={(checked) => {
              const id = row.original.id
              setSelectedKeys((prev) => {
                if (checked) {
                  return prev.includes(id) ? prev : [...prev, id]
                }
                return prev.filter((x) => x !== id)
              })
            }}
            aria-label={t('myShares.ariaSelectRow', {
              name: row.original.shareName,
            })}
          />
        ),
        enableSorting: false,
        size: 48,
      },
      {
        accessorKey: 'shareName',
        header: t('myShares.colName'),
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <LinkIcon className='h-4 w-4 shrink-0 text-primary' />
            <span className='truncate text-sm'>{row.original.shareName}</span>
          </div>
        ),
      },
      {
        id: 'expireTime',
        accessorFn: (row) => row.expireTime,
        header: t('myShares.colExpire'),
        cell: ({ row }) => {
          const share = row.original
          return share.isPermanent ? (
            <Badge
              variant='outline'
              className='border-green-600 text-green-600'
            >
              {t('myShares.permanent')}
            </Badge>
          ) : (
            <span
              className={cn(
                'text-sm',
                isExpired(share.expireTime)
                  ? 'text-destructive'
                  : 'text-muted-foreground'
              )}
            >
              {formatExpireTime(share.expireTime)}
            </span>
          )
        },
      },
      {
        accessorKey: 'viewCount',
        header: t('myShares.colViews'),
        cell: ({ row }) => (
          <div className='text-center text-sm'>
            {row.original.viewCount}
            {row.original.maxViewCount > 0 && (
              <span className='text-xs text-muted-foreground'>
                {' '}
                / {row.original.maxViewCount}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'downloadCount',
        header: t('myShares.colDownloads'),
        cell: ({ row }) => (
          <div className='text-center text-sm'>
            {row.original.downloadCount}
            {row.original.maxDownloadCount > 0 && (
              <span className='text-xs text-muted-foreground'>
                {' '}
                / {row.original.maxDownloadCount}
              </span>
            )}
          </div>
        ),
      },
      {
        id: 'scope',
        accessorFn: (row) => row.scope,
        header: t('myShares.colScope'),
        cell: ({ row }) => {
          const share = row.original
          return (
            <div className='flex items-center justify-center gap-1'>
              {(!share.scope || share.scope.includes('preview')) && (
                <Badge variant='secondary' className='text-xs'>
                  {t('myShares.permPreview')}
                </Badge>
              )}
              {(!share.scope || share.scope.includes('download')) && (
                <Badge
                  variant='secondary'
                  className='bg-green-100 text-xs text-green-700'
                >
                  {t('myShares.permDownload')}
                </Badge>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'createdAt',
        header: t('myShares.colCreated'),
        cell: ({ row }) => (
          <span className='text-sm text-muted-foreground'>
            {formatTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => (
          <span className='block w-full text-center'>
            {t('myShares.colActions')}
          </span>
        ),
        cell: ({ row }) => {
          const share = row.original
          return (
            <div
              className='text-center'
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className={cn(
                      'size-8 rounded-lg text-muted-foreground transition-colors',
                      'hover:bg-primary/10 hover:text-primary',
                      'group-hover:text-primary',
                      'data-[state=open]:bg-primary/10 data-[state=open]:text-primary'
                    )}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    aria-label={t('myShares.ariaMore')}
                  >
                    <FileListRowActionIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleQuickCopy(share)
                    }}
                  >
                    <Copy className='size-4' />
                    {t('myShares.quickCopy')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewShare(share)
                    }}
                  >
                    <Eye className='size-4' />
                    {t('myShares.viewDetail')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewAccessRecords(share)
                    }}
                  >
                    <FileText className='size-4' />
                    {t('myShares.accessRecordsMenu')}
                  </DropdownMenuItem>
                  {canCancelShare && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className='text-destructive focus:text-destructive'
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCancelShare(share)
                        }}
                      >
                        <RouteOff className='size-4' />
                        {t('myShares.cancelShareMenu')}
                      </DropdownMenuItem>
                    </>
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
      canCancelShare,
      shareList,
      selectedKeys,
      t,
      formatExpireTime,
      formatScopeText,
      isExpired,
      isAllPageSelected,
      isSomePageSelected,
    ]
  )

  const pageCount = Math.max(
    1,
    Math.ceil(total / Math.max(1, pagination.pageSize))
  )

  const table = useReactTable({
    data: shareList,
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
      {/* 顶部工具栏 */}
      <div className='flex items-center gap-4 border-b px-6 py-4'>
        <div className='min-w-0 flex-1'>
          <FileBreadcrumb
            breadcrumbPath={[]}
            customTitle={t('myShares.title')}
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
        {canClearShares && (
          <Button
            variant='destructive'
            size='sm'
            disabled={total === 0}
            onClick={handleClearAllShares}
          >
            <Trash2 className='mr-2 h-4 w-4' />
            {t('myShares.clearAllButton')}
          </Button>
        )}
      </div>

      {/* 次级工具栏：统计信息 */}
      <div className='flex items-center justify-between border-b px-6 py-3'>
        <div className='flex items-center gap-3'>
          <span className='text-sm text-muted-foreground'>
            {selectedKeys.length > 0
              ? t('myShares.selectedHint', { count: selectedKeys.length })
              : t('myShares.totalHint', { total })}
          </span>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className='flex-1 overflow-hidden'>
        <div className='flex h-full min-h-0 flex-col'>
          {loading ? (
            <div className='flex h-full items-center justify-center'>
              <p className='text-muted-foreground'>{tc('loading')}</p>
            </div>
          ) : shareList.length === 0 ? (
            <div className='flex h-full items-center justify-center'>
              <Empty className='border-none'>
                <EmptyHeader>
                  <EmptyMedia variant='icon'>
                    <LinkIcon className='h-12 w-12' />
                  </EmptyMedia>
                  <EmptyTitle>{t('myShares.emptySharesTitle')}</EmptyTitle>
                  <EmptyDescription>
                    {searchKeyword
                      ? t('myShares.emptySearch')
                      : t('myShares.emptyDefault')}
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
                                SHARE_TABLE_HEAD[header.column.id] ?? ''
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
                              'group',
                              selectedKeys.includes(row.original.id) &&
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
                            {t('myShares.noData')}
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

      {selectedKeys.length > 0 && canCancelShare && (
        <BulkSelectionBar
          selectedCount={selectedKeys.length}
          onClear={() => setSelectedKeys([])}
          ariaLabel={t('myShares.bulkBar')}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='destructive'
                size='icon'
                className='size-8 shrink-0'
                onClick={handleBatchCancel}
                aria-label={t('myShares.ariaCancelShare')}
              >
                <RouteOff />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('myShares.tooltipCancelShare')}</p>
            </TooltipContent>
          </Tooltip>
        </BulkSelectionBar>
      )}

      {/* 分享详情弹窗 */}
      <Dialog open={shareDetailVisible} onOpenChange={setShareDetailVisible}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>{t('myShares.detailTitle')}</DialogTitle>
          </DialogHeader>

          <div className='space-y-6'>
            {shareDetailLoading ? (
              <div className='py-8 text-center text-sm text-muted-foreground'>
                {tc('loading')}
              </div>
            ) : (
              currentShare && (
                <DescriptionFieldList>
                  <DescriptionField>
                    <DescriptionFieldLabel>
                      {t('myShares.labelShareName')}
                    </DescriptionFieldLabel>
                    <DescriptionFieldValue breakAll>
                      {currentShare.shareName}
                    </DescriptionFieldValue>
                  </DescriptionField>

                  {getShareUrl(currentShare) && (
                    <DescriptionField>
                      <DescriptionFieldLabel>
                        {t('myShares.labelShareLink')}
                      </DescriptionFieldLabel>
                      <DescriptionFieldValueRow>
                        <DescriptionFieldValue className='min-w-0 flex-1' breakAll>
                          {getShareUrl(currentShare)}
                        </DescriptionFieldValue>
                        <Button
                          size='icon'
                          variant='outline'
                          className='h-8 w-8 shrink-0'
                          onClick={() =>
                            handleCopyLink(getShareUrl(currentShare)!)
                          }
                        >
                          {copiedDetailLink ? (
                            <Check className='h-4 w-4 text-green-600' />
                          ) : (
                            <Copy className='h-4 w-4' />
                          )}
                        </Button>
                      </DescriptionFieldValueRow>
                    </DescriptionField>
                  )}

                  <DescriptionField>
                    <DescriptionFieldLabel>
                      {t('myShares.codeLabel')}
                    </DescriptionFieldLabel>
                    <DescriptionFieldValueRow>
                      <DescriptionFieldValue
                        className='min-w-0 flex-1 font-semibold tracking-wider text-primary'
                        breakAll
                      >
                        {currentShare.shareCode || '-'}
                      </DescriptionFieldValue>
                      {currentShare.shareCode && (
                        <Button
                          size='icon'
                          variant='outline'
                          className='h-8 w-8 shrink-0'
                          onClick={() =>
                            handleCopyCode(currentShare.shareCode!)
                          }
                        >
                          {copiedDetailCode ? (
                            <Check className='h-4 w-4 text-green-600' />
                          ) : (
                            <Copy className='h-4 w-4' />
                          )}
                        </Button>
                      )}
                    </DescriptionFieldValueRow>
                  </DescriptionField>

                  <DescriptionField>
                    <DescriptionFieldLabel>
                      {t('myShares.validityLabel')}
                    </DescriptionFieldLabel>
                    <DescriptionFieldValue>
                      {currentShare.isPermanent
                        ? t('myShares.permanent')
                        : formatExpireTime(currentShare.expireTime)}
                    </DescriptionFieldValue>
                  </DescriptionField>

                  <DescriptionField>
                    <DescriptionFieldLabel>
                      {t('myShares.colScope')}
                    </DescriptionFieldLabel>
                    <DescriptionFieldValue>
                      {formatScopeText(currentShare.scope)}
                    </DescriptionFieldValue>
                  </DescriptionField>

                  <DescriptionField>
                    <DescriptionFieldLabel>
                      {t('myShares.labelViews')}
                    </DescriptionFieldLabel>
                    <DescriptionFieldValue>
                      {currentShare.viewCount}
                      {currentShare.maxViewCount > 0 &&
                        ` / ${currentShare.maxViewCount}`}
                    </DescriptionFieldValue>
                  </DescriptionField>

                  <DescriptionField>
                    <DescriptionFieldLabel>
                      {t('myShares.labelDownloads')}
                    </DescriptionFieldLabel>
                    <DescriptionFieldValue>
                      {currentShare.downloadCount}
                      {currentShare.maxDownloadCount > 0 &&
                        ` / ${currentShare.maxDownloadCount}`}
                    </DescriptionFieldValue>
                  </DescriptionField>

                  <DescriptionField>
                    <DescriptionFieldLabel>
                      {t('myShares.labelCreatedAt')}
                    </DescriptionFieldLabel>
                    <DescriptionFieldValue>
                      {formatFileTime(currentShare.createdAt)}
                    </DescriptionFieldValue>
                  </DescriptionField>
                </DescriptionFieldList>
              )
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>{t('myShares.detailClose')}</Button>
            </DialogClose>
            <Button onClick={handleCopyShareDetail}>
              {copiedShareDetail ? (
                <>
                  <Check className='mr-2 h-4 w-4' />
                  {t('common.copied')}
                </>
              ) : (
                <>
                  <Copy className='mr-2 h-4 w-4' />
                  {t('myShares.copyShareBtn')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 访问记录弹窗 */}
      <Dialog
        open={accessRecordsVisible}
        onOpenChange={setAccessRecordsVisible}
      >
        <DialogContent className='max-h-[85vh] sm:max-w-5xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {t('myShares.accessRecordsHeading', {
                name: currentShareForRecords?.shareName || '',
              })}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-6 px-6 pb-4'>
            {accessRecordsLoading ? (
              <div className='py-8 text-center text-sm text-muted-foreground'>
                {tc('loading')}
              </div>
            ) : accessRecords.length === 0 ? (
              <div className='py-8 text-center text-sm text-muted-foreground'>
                {t('myShares.noAccessRecords')}
              </div>
            ) : (
              <div className='max-h-[60vh] overflow-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='font-medium text-muted-foreground'>
                        {t('myShares.recordsColIp')}
                      </TableHead>
                      <TableHead className='font-medium text-muted-foreground'>
                        {t('myShares.recordsColAddress')}
                      </TableHead>
                      <TableHead className='font-medium text-muted-foreground'>
                        {t('myShares.recordsColBrowser')}
                      </TableHead>
                      <TableHead className='font-medium text-muted-foreground'>
                        {t('myShares.recordsColOs')}
                      </TableHead>
                      <TableHead className='font-medium text-muted-foreground'>
                        {t('myShares.recordsColTime')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className='text-sm'>
                          {record.accessIp}
                        </TableCell>
                        <TableCell className='text-sm'>
                          {record.accessAddress || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant='secondary' className='text-xs'>
                            {record.browser || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline' className='text-xs'>
                            {record.os || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-sm text-muted-foreground'>
                          {formatFileTime(record.accessTime)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <AlertDialog
        open={deleteDialogVisible}
        onOpenChange={setDeleteDialogVisible}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('myShares.confirmCancelShareTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('myShares.confirmCancelShareDesc', {
                name: deletingShare?.shareName ?? '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelShare}
              className='bg-destructive hover:bg-destructive/90'
            >
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 清空所有分享确认 */}
      <AlertDialog
        open={clearAllDialogVisible}
        onOpenChange={setClearAllDialogVisible}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('myShares.confirmClearAllTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('myShares.confirmClearAllDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClearAllShares}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {t('myShares.clearAllAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 批量删除确认弹窗 */}
      <AlertDialog
        open={batchDeleteDialogVisible}
        onOpenChange={setBatchDeleteDialogVisible}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('myShares.confirmBatchTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('myShares.confirmBatchDesc', {
                count: selectedKeys.length,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBatchCancel}
              className='bg-destructive hover:bg-destructive/90'
            >
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
