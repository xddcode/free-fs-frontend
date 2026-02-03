import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getFileList, getFolderPath } from '@/api/file';
import type { FileItem, SortOrder, FileType, BreadcrumbItem } from '@/types/file';

export function useFileList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 状态管理
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<FileItem[]>([]);
  const [breadcrumbPath, setBreadcrumbPath] = useState<BreadcrumbItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('keyword') || '');
  const [orderBy, setOrderBy] = useState('updateTime');
  const [orderDirection, setOrderDirection] = useState<SortOrder>('DESC');

  // 从 URL 获取当前目录 ID 和筛选参数
  const currentParentId = searchParams.get('parentId') || undefined;
  const viewType = searchParams.get('view');
  const fileType = searchParams.get('type');
  const isDirFilter = searchParams.get('isDir') === 'true';

  /**
   * 更新面包屑路径
   */
  const updateBreadcrumbPath = useCallback(async (parentId?: string) => {
    if (!parentId) {
      setBreadcrumbPath([]);
      return;
    }

    try {
      const response = await getFolderPath(parentId);
      if (response) {
        setBreadcrumbPath(
          response.map((item) => ({
            id: item.id,
            name: item.displayName,
          }))
        );
      }
    } catch {
      setBreadcrumbPath([]);
    }
  }, []);

  /**
   * 获取文件列表
   */
  const fetchFileList = useCallback(async () => {
    setLoading(true);
    try {
      const isFavoritesView = viewType === 'favorites';
      const isRecentsView = viewType === 'recents';

      const response = await getFileList({
        orderBy,
        orderDirection,
        parentId: currentParentId,
        keyword: searchKeyword || undefined,
        fileType: fileType as FileType | undefined,
        isFavorite: isFavoritesView ? true : undefined,
        isRecents: isRecentsView ? true : undefined,
        isDir: searchParams.get('isDir') === 'true' ? true : undefined,
      });

      setFileList(response || []);

      // 收藏/最近/类型筛选/文件夹筛选视图不需要面包屑
      if (isFavoritesView || isRecentsView || fileType || isDirFilter) {
        setBreadcrumbPath([]);
      } else {
        await updateBreadcrumbPath(currentParentId);
      }
    } catch (error) {
      console.error('Failed to fetch file list:', error);
      setFileList([]);
    } finally {
      setLoading(false);
    }
  }, [viewType, orderBy, orderDirection, currentParentId, searchKeyword, fileType, isDirFilter, updateBreadcrumbPath]);

  /**
   * 进入文件夹
   */
  const enterFolder = useCallback(
    (folderId: string, viewMode: string) => {
      const params = new URLSearchParams(searchParams);
      params.set('parentId', folderId);
      params.set('viewMode', viewMode);
      navigate(`/files?${params.toString()}`);
    },
    [searchParams, navigate]
  );

  /**
   * 导航到指定文件夹
   */
  const navigateToFolder = useCallback(
    (folderId?: string) => {
      const params = new URLSearchParams(searchParams);
      if (!folderId) {
        params.delete('parentId');
      } else {
        params.set('parentId', folderId);
      }
      navigate(`/files?${params.toString()}`);
    },
    [searchParams, navigate]
  );

  /**
   * 刷新列表
   */
  const refresh = useCallback(() => {
    fetchFileList();
  }, [fetchFileList]);

  /**
   * 搜索
   */
  const search = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
  }, []);

  /**
   * 处理排序变化
   */
  const handleSortChange = useCallback((field: string, direction: SortOrder) => {
    setOrderBy(field);
    setOrderDirection(direction);
  }, []);

  // 监听 URL 参数变化自动刷新
  useEffect(() => {
    fetchFileList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentParentId, viewType, fileType, orderBy, orderDirection, searchKeyword]);

  // 监听 URL 中的 keyword 参数变化
  useEffect(() => {
    const urlKeyword = searchParams.get('keyword') || '';
    if (urlKeyword !== searchKeyword) {
      setSearchKeyword(urlKeyword);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return {
    loading,
    fileList,
    breadcrumbPath,
    currentParentId,
    searchKeyword,
    setSearchKeyword,
    fetchFileList,
    enterFolder,
    navigateToFolder,
    refresh,
    search,
    handleSortChange,
  };
}
