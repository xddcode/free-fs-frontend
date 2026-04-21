import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { FileItem } from '@/types/file'
import { toast } from 'sonner'
import {
  deleteFiles,
  renameFile,
  moveFiles,
  createFolder,
  favoriteFile,
  unfavoriteFile,
} from '@/api/file'
import { openFilePreviewWithToken } from '@/utils/preview'
import { getCurrentWorkspaceId } from '@/store/workspace'

export function useFileOperations(
  refreshCallback: () => void,
  clearSelectionCallback?: () => void,
  onCreateFolderSuccess?: () => void,
  updateFileItemsCallback?: (ids: string[], patch: Partial<FileItem>) => void
) {
  const { t } = useTranslation('files')
  // 模态框状态
  const [createFolderModalVisible, setCreateFolderModalVisible] =
    useState(false)
  const [renameModalVisible, setRenameModalVisible] = useState(false)
  const [moveModalVisible, setMoveModalVisible] = useState(false)
  const [shareModalVisible, setShareModalVisible] = useState(false)
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)

  // 操作的文件
  const [renamingFile, setRenamingFile] = useState<FileItem | null>(null)
  const [movingFile, setMovingFile] = useState<FileItem | null>(null)
  const [movingFiles, setMovingFiles] = useState<FileItem[]>([])
  const [sharingFile, setSharingFile] = useState<FileItem | null>(null)
  const [sharingFiles, setSharingFiles] = useState<FileItem[]>([])
  const [deletingFiles, setDeletingFiles] = useState<FileItem[]>([])
  const [detailFile, setDetailFile] = useState<FileItem | null>(null)

  /**
   * 打开创建文件夹弹窗
   */
  const openCreateFolderModal = useCallback(() => {
    setCreateFolderModalVisible(true)
  }, [])

  /**
   * 创建文件夹
   */
  const handleCreateFolder = useCallback(
    async (folderName: string, parentId?: string) => {
      try {
        await createFolder({ folderName: folderName.trim(), parentId })
        toast.success(t('operations.mkdirOk'))
        setCreateFolderModalVisible(false)
        onCreateFolderSuccess?.()
        refreshCallback()
      } catch (error) {
        toast.error(t('operations.mkdirFail'))
      }
    },
    [refreshCallback, onCreateFolderSuccess, t]
  )

  /**
   * 打开重命名弹窗
   */
  const openRenameModal = useCallback((file: FileItem) => {
    setRenamingFile(file)
    setRenameModalVisible(true)
  }, [])

  /**
   * 重命名文件
   */
  const handleRename = useCallback(
    async (fileId: string, newName: string) => {
      try {
        await renameFile(fileId, newName.trim())
        toast.success(t('operations.renameOk'))
        setRenameModalVisible(false)
        setRenamingFile(null)
        clearSelectionCallback?.()
        refreshCallback()
      } catch (error) {
        toast.error(t('operations.renameFail'))
      }
    },
    [refreshCallback, clearSelectionCallback, t]
  )

  /**
   * 打开移动文件弹窗
   */
  const openMoveModal = useCallback((file: FileItem) => {
    setMovingFile(file)
    setMovingFiles([file])
    setMoveModalVisible(true)
  }, [])

  /**
   * 打开批量移动弹窗
   */
  const openBatchMoveModal = useCallback((files: FileItem[]) => {
    setMovingFile(null)
    setMovingFiles(files)
    setMoveModalVisible(true)
  }, [])

  /**
   * 移动文件
   */
  const handleMove = useCallback(
    async (fileIds: string[], targetDirId: string) => {
      try {
        await moveFiles(targetDirId, fileIds)
        toast.success(t('operations.moveOk'))
        setMoveModalVisible(false)
        setMovingFile(null)
        setMovingFiles([])
        clearSelectionCallback?.()
        refreshCallback()
      } catch (error) {
        toast.error(t('operations.moveFail'))
      }
    },
    [refreshCallback, clearSelectionCallback, t]
  )

  /**
   * 打开分享弹窗
   */
  const openShareModal = useCallback((file: FileItem) => {
    setSharingFile(file)
    setSharingFiles([file])
    setShareModalVisible(true)
  }, [])

  /**
   * 打开批量分享弹窗
   */
  const openBatchShareModal = useCallback((files: FileItem[]) => {
    setSharingFile(null)
    setSharingFiles(files)
    setShareModalVisible(true)
  }, [])

  /**
   * 删除文件
   */
  const handleDelete = useCallback(async () => {
    const fileIds = deletingFiles.map((f) => f.id)
    try {
      await deleteFiles(fileIds)
      const successMsg =
        fileIds.length === 1
          ? t('operations.trashOne')
          : t('operations.trashMany', { count: fileIds.length })
      toast.success(successMsg)
      setDeleteDialogVisible(false)
      setDeletingFiles([])
      clearSelectionCallback?.()
      refreshCallback()
    } catch (error) {
      toast.error(t('operations.trashFail'))
    }
  }, [deletingFiles, refreshCallback, clearSelectionCallback, t])

  /**
   * 打开删除确认对话框
   */
  const openDeleteConfirm = useCallback((file: FileItem) => {
    setDeletingFiles([file])
    setDeleteDialogVisible(true)
  }, [])

  /**
   * 打开批量删除确认对话框
   */
  const openBatchDeleteConfirm = useCallback((files: FileItem[]) => {
    setDeletingFiles(files)
    setDeleteDialogVisible(true)
  }, [])

  /**
   * 下载文件
   */
  const handleDownload = useCallback((files: FileItem | FileItem[]) => {
    const fileArray = Array.isArray(files) ? files : [files]
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken')
    const workspaceId = getCurrentWorkspaceId()

    // 使用延迟下载避免浏览器阻止多个下载
    fileArray.forEach((file, index) => {
      setTimeout(() => {
        // 构建下载链接，将 token 和 workspaceId 放到 URL 参数中
        const params = new URLSearchParams()
        params.set('Authorization', `Bearer ${token}`)
        if (workspaceId) {
          params.set('X-Workspace-Id', workspaceId)
        }
        
        const downloadUrl = `${import.meta.env.VITE_API_BASE_URL}/apis/transfer/download/${file.id}?${params.toString()}`

        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = file.displayName
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }, index * 200) // 每个文件延迟 200ms
    })

    const successMsg =
      fileArray.length === 1
        ? t('operations.downloadOne')
        : t('operations.downloadMany', { count: fileArray.length })
    toast.success(successMsg)
  }, [t])

  /**
   * 收藏/取消收藏
   * 使用乐观更新：直接修改本地状态，失败时回滚刷新列表
   */
  const handleFavorite = useCallback(
    async (files: FileItem | FileItem[]) => {
      const fileArray = Array.isArray(files) ? files : [files]
      const fileIds = fileArray.map((f) => f.id)

      // 判断是收藏还是取消收藏（如果有任何一个未收藏，就执行收藏操作）
      const hasUnfavorited = fileArray.some((f) => !f.isFavorite)
      const newFavoriteState = hasUnfavorited

      // 乐观更新本地状态
      updateFileItemsCallback?.(fileIds, { isFavorite: newFavoriteState })
      clearSelectionCallback?.()

      try {
        if (hasUnfavorited) {
          await favoriteFile(fileIds)
          toast.success(t('operations.favOk'))
        } else {
          await unfavoriteFile(fileIds)
          toast.success(t('operations.unfavOk'))
        }
      } catch (error) {
        toast.error(hasUnfavorited ? t('operations.favFail') : t('operations.unfavFail'))
      }
    },
    [refreshCallback, clearSelectionCallback, t]
  )

  /**
   * 预览文件
   */
  const openPreview = useCallback(async (file: FileItem) => {
    await openFilePreviewWithToken(file.id, import.meta.env.VITE_API_BASE_URL)
  }, [])

  /**
   * 打开详细信息弹窗
   */
  const openDetail = useCallback((file: FileItem) => {
    setDetailFile(file)
    setDetailModalVisible(true)
  }, [])

  return {
    // 模态框状态
    createFolderModalVisible,
    setCreateFolderModalVisible,
    renameModalVisible,
    setRenameModalVisible,
    moveModalVisible,
    setMoveModalVisible,
    shareModalVisible,
    setShareModalVisible,
    deleteDialogVisible,
    setDeleteDialogVisible,
    detailModalVisible,
    setDetailModalVisible,

    // 操作的文件
    renamingFile,
    movingFile,
    movingFiles,
    sharingFile,
    sharingFiles,
    deletingFiles,
    detailFile,

    // 操作方法
    openCreateFolderModal,
    handleCreateFolder,
    openRenameModal,
    handleRename,
    openMoveModal,
    openBatchMoveModal,
    handleMove,
    openShareModal,
    openBatchShareModal,
    openDeleteConfirm,
    openBatchDeleteConfirm,
    handleDelete,
    handleDownload,
    handleFavorite,
    openPreview,
    openDetail,
  }
}
