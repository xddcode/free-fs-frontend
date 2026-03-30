import {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react'
import type {
  FileItem,
  SortOrder,
  FileType,
  BreadcrumbItem,
} from '@/types/file'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getFileList, getFolderPath } from '@/api/file'
import { useToolbarSearch } from '@/hooks/useToolbarSearch'

/** 每页条数（与后端约定一致） */
export const FILE_LIST_PAGE_SIZE = 100

function mergeFileRecords(prev: FileItem[], incoming: FileItem[]): FileItem[] {
  const seen = new Set(prev.map((f) => f.id))
  const merged = [...prev]
  for (const item of incoming) {
    if (!seen.has(item.id)) {
      seen.add(item.id)
      merged.push(item)
    }
  }
  return merged
}

export function useFileList() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [fileList, setFileList] = useState<FileItem[]>([])
  const [total, setTotal] = useState(0)
  const pageRef = useRef(1)
  const totalRef = useRef(0)
  const fileCountRef = useRef(0)
  const fileListRef = useRef<FileItem[]>([])
  const fetchGenerationRef = useRef(0)
  const loadMoreInFlightRef = useRef(false)

  /** 已确定没有后续页（空页 / 不足一页 / 已凑满 total / 合并无增量），避免 total 不准时无限请求 */
  const [noMorePages, setNoMorePages] = useState(false)

  const [breadcrumbPath, setBreadcrumbPath] = useState<BreadcrumbItem[]>([])
  const { searchInput, setSearchInput, searchKeyword, commitSearch } =
    useToolbarSearch('keyword')
  const [orderBy, setOrderBy] = useState('updateTime')
  const [orderDirection, setOrderDirection] = useState<SortOrder>('DESC')

  const currentParentId = searchParams.get('parentId') || undefined
  const viewType = searchParams.get('view')
  const fileType = searchParams.get('type')
  const isDirFilter = searchParams.get('isDir') === 'true'

  const updateBreadcrumbPath = useCallback(async (parentId?: string) => {
    if (!parentId) {
      setBreadcrumbPath([])
      return
    }

    try {
      const response = await getFolderPath(parentId)
      if (response) {
        setBreadcrumbPath(
          response.map((item) => ({
            id: item.id,
            name: item.displayName,
          }))
        )
      }
    } catch {
      setBreadcrumbPath([])
    }
  }, [])

  const buildQuery = useCallback(
    (pageNum: number) => {
      const isFavoritesView = viewType === 'favorites'
      const isRecentsView = viewType === 'recents'

      return {
        orderBy,
        orderDirection,
        parentId: currentParentId,
        keyword: searchKeyword || undefined,
        fileType: fileType as FileType | undefined,
        isFavorite: isFavoritesView ? true : undefined,
        isRecents: isRecentsView ? true : undefined,
        isDir: isDirFilter ? true : undefined,
        page: pageNum,
        pageSize: FILE_LIST_PAGE_SIZE,
      }
    },
    [
      viewType,
      orderBy,
      orderDirection,
      currentParentId,
      searchKeyword,
      fileType,
      isDirFilter,
    ]
  )

  const fetchInitial = useCallback(async () => {
    const gen = ++fetchGenerationRef.current
    setLoading(true)
    setNoMorePages(false)
    try {
      const isFavoritesView = viewType === 'favorites'
      const isRecentsView = viewType === 'recents'

      const response = await getFileList(buildQuery(1))
      if (gen !== fetchGenerationRef.current) return

      const records = response?.records ?? []
      const t = response?.total ?? records.length

      setFileList(records)
      setTotal(t)
      pageRef.current = 1

      const firstPageDone =
        records.length === 0 ||
        records.length < FILE_LIST_PAGE_SIZE ||
        (t > 0 && records.length >= t)
      setNoMorePages(firstPageDone)

      if (isFavoritesView || isRecentsView || fileType || isDirFilter) {
        setBreadcrumbPath([])
      } else {
        await updateBreadcrumbPath(currentParentId)
        if (gen !== fetchGenerationRef.current) return
      }
    } catch (error) {
      console.error('Failed to fetch file list:', error)
      if (gen !== fetchGenerationRef.current) return
      setFileList([])
      setTotal(0)
      pageRef.current = 1
      setNoMorePages(true)
    } finally {
      if (gen === fetchGenerationRef.current) {
        setLoading(false)
      }
    }
  }, [
    buildQuery,
    viewType,
    fileType,
    isDirFilter,
    currentParentId,
    updateBreadcrumbPath,
  ])

  useLayoutEffect(() => {
    totalRef.current = total
    fileCountRef.current = fileList.length
    fileListRef.current = fileList
  }, [total, fileList])

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || loadMoreInFlightRef.current) return
    if (noMorePages) return
    if (fileCountRef.current >= totalRef.current) return

    loadMoreInFlightRef.current = true
    setLoadingMore(true)
    try {
      const nextPage = pageRef.current + 1
      const response = await getFileList(buildQuery(nextPage))
      const records = response?.records ?? []
      const prev = fileListRef.current
      const merged = mergeFileRecords(prev, records)
      const serverTotal = response?.total ?? totalRef.current

      const noProgress =
        records.length > 0 && merged.length === prev.length
      const reachedEnd =
        noProgress ||
        records.length === 0 ||
        records.length < FILE_LIST_PAGE_SIZE ||
        (serverTotal > 0 && merged.length >= serverTotal)

      setFileList(merged)
      if (reachedEnd) {
        setNoMorePages(true)
        setTotal(merged.length)
      } else {
        setTotal(serverTotal)
      }
      pageRef.current = nextPage
    } catch (error) {
      console.error('Failed to load more files:', error)
    } finally {
      loadMoreInFlightRef.current = false
      setLoadingMore(false)
    }
  }, [loading, loadingMore, noMorePages, buildQuery])

  const refresh = useCallback(() => {
    fetchInitial()
  }, [fetchInitial])

  const handleSortChange = useCallback(
    (field: string, direction: SortOrder) => {
      setOrderBy(field)
      setOrderDirection(direction)
    },
    []
  )

  useEffect(() => {
    fetchInitial()
  }, [fetchInitial])

  const hasMore =
    !noMorePages && total > 0 && fileList.length < total

  const enterFolder = useCallback(
    (folderId: string, viewModeParam: string) => {
      const params = new URLSearchParams(searchParams)
      params.set('parentId', folderId)
      params.set('viewMode', viewModeParam)
      navigate(`/files?${params.toString()}`)
    },
    [searchParams, navigate]
  )

  const navigateToFolder = useCallback(
    (folderId?: string) => {
      const params = new URLSearchParams(searchParams)
      if (!folderId) {
        params.delete('parentId')
      } else {
        params.set('parentId', folderId)
      }
      navigate(`/files?${params.toString()}`)
    },
    [searchParams, navigate]
  )

  return {
    loading,
    loadingMore,
    hasMore,
    loadMore,
    total,
    fileList,
    breadcrumbPath,
    currentParentId,
    searchKeyword,
    searchInput,
    setSearchInput,
    fetchFileList: fetchInitial,
    enterFolder,
    navigateToFolder,
    refresh,
    commitSearch,
    handleSortChange,
  }
}
