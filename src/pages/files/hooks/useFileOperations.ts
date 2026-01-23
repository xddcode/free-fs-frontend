import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  deleteFiles,
  renameFile,
  moveFiles,
  createFolder,
  favoriteFile,
  unfavoriteFile,
} from '@/api/file';
import type { FileItem } from '@/types/file';

export function useFileOperations(refreshCallback: () => void) {
  // 模态框状态
  const [createFolderModalVisible, setCreateFolderModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  // 操作的文件
  const [renamingFile, setRenamingFile] = useState<FileItem | null>(null);
  const [movingFile, setMovingFile] = useState<FileItem | null>(null);
  const [movingFiles, setMovingFiles] = useState<FileItem[]>([]);
  const [sharingFile, setSharingFile] = useState<FileItem | null>(null);
  const [sharingFiles, setSharingFiles] = useState<FileItem[]>([]);

  /**
   * 打开创建文件夹弹窗
   */
  const openCreateFolderModal = useCallback(() => {
    setCreateFolderModalVisible(true);
  }, []);

  /**
   * 创建文件夹
   */
  const handleCreateFolder = useCallback(
    async (folderName: string, parentId?: string) => {
      try {
        await createFolder({ folderName: folderName.trim(), parentId });
        toast.success('文件夹创建成功');
        setCreateFolderModalVisible(false);
        refreshCallback();
      } catch (error) {
        toast.error('创建文件夹失败');
      }
    },
    [refreshCallback]
  );

  /**
   * 打开重命名弹窗
   */
  const openRenameModal = useCallback((file: FileItem) => {
    setRenamingFile(file);
    setRenameModalVisible(true);
  }, []);

  /**
   * 重命名文件
   */
  const handleRename = useCallback(
    async (fileId: string, newName: string) => {
      try {
        await renameFile(fileId, newName.trim());
        toast.success('重命名成功');
        setRenameModalVisible(false);
        setRenamingFile(null);
        refreshCallback();
      } catch (error) {
        toast.error('重命名失败');
      }
    },
    [refreshCallback]
  );

  /**
   * 打开移动文件弹窗
   */
  const openMoveModal = useCallback((file: FileItem) => {
    setMovingFile(file);
    setMovingFiles([file]);
    setMoveModalVisible(true);
  }, []);

  /**
   * 打开批量移动弹窗
   */
  const openBatchMoveModal = useCallback((files: FileItem[]) => {
    setMovingFile(null);
    setMovingFiles(files);
    setMoveModalVisible(true);
  }, []);

  /**
   * 移动文件
   */
  const handleMove = useCallback(
    async (fileIds: string[], targetDirId: string) => {
      try {
        await moveFiles(targetDirId, fileIds);
        toast.success('移动成功');
        setMoveModalVisible(false);
        setMovingFile(null);
        setMovingFiles([]);
        refreshCallback();
      } catch (error) {
        toast.error('移动失败');
      }
    },
    [refreshCallback]
  );

  /**
   * 打开分享弹窗
   */
  const openShareModal = useCallback((file: FileItem) => {
    setSharingFile(file);
    setSharingFiles([file]);
    setShareModalVisible(true);
  }, []);

  /**
   * 打开批量分享弹窗
   */
  const openBatchShareModal = useCallback((files: FileItem[]) => {
    setSharingFile(null);
    setSharingFiles(files);
    setShareModalVisible(true);
  }, []);

  /**
   * 删除文件
   */
  const handleDelete = useCallback(
    async (fileIds: string[]) => {
      try {
        await deleteFiles(fileIds);
        const successMsg = fileIds.length === 1 ? '已移到回收站' : `已将 ${fileIds.length} 个文件移到回收站`;
        toast.success(successMsg);
        refreshCallback();
      } catch (error) {
        toast.error('删除失败');
      }
    },
    [refreshCallback]
  );

  /**
   * 删除文件确认
   */
  const openDeleteConfirm = useCallback(
    (file: FileItem) => {
      if (window.confirm(`确定要将文件 "${file.displayName}" 放入回收站吗？`)) {
        handleDelete([file.id]);
      }
    },
    [handleDelete]
  );

  /**
   * 批量删除确认
   */
  const openBatchDeleteConfirm = useCallback(
    (files: FileItem[]) => {
      if (window.confirm(`确定要将选中的 ${files.length} 个文件放入回收站吗？`)) {
        handleDelete(files.map((f) => f.id));
      }
    },
    [handleDelete]
  );

  /**
   * 下载文件
   */
  const handleDownload = useCallback((files: FileItem | FileItem[]) => {
    const fileArray = Array.isArray(files) ? files : [files];
    const token = localStorage.getItem('token');

    fileArray.forEach((file) => {
      const downloadUrl = `${import.meta.env.VITE_API_BASE_URL}/apis/file/download/${file.id}?token=${token}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.displayName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    toast.success(`开始下载 ${fileArray.length} 个文件`);
  }, []);

  /**
   * 收藏/取消收藏
   */
  const handleFavorite = useCallback(
    async (files: FileItem | FileItem[]) => {
      const fileArray = Array.isArray(files) ? files : [files];
      const fileIds = fileArray.map((f) => f.id);

      // 判断是收藏还是取消收藏（如果有任何一个未收藏，就执行收藏操作）
      const hasUnfavorited = fileArray.some((f) => !f.isFavorite);

      try {
        if (hasUnfavorited) {
          await favoriteFile(fileIds);
          toast.success('收藏成功');
        } else {
          await unfavoriteFile(fileIds);
          toast.success('取消收藏成功');
        }
        refreshCallback();
      } catch (error) {
        toast.error(hasUnfavorited ? '收藏失败' : '取消收藏失败');
      }
    },
    [refreshCallback]
  );

  /**
   * 预览文件
   */
  const openPreview = useCallback((file: FileItem) => {
    window.open(`${import.meta.env.VITE_API_VIEW_URL}/preview/${file.id}`, '_blank');
  }, []);

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

    // 操作的文件
    renamingFile,
    movingFile,
    movingFiles,
    sharingFile,
    sharingFiles,

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
  };
}
