import { useEffect } from 'react';
import { useTransferStore } from '@/store/transfer';

/**
 * 上传任务保护 Hook
 * 在用户刷新页面前显示警告，由用户决定是否继续
 */
export function useUploadGuard() {
  const { getUploadingTasks } = useTransferStore();

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const uploadingTasks = getUploadingTasks();
      
      if (uploadingTasks.length > 0) {
        // 阻止默认行为，显示浏览器警告对话框
        event.preventDefault();
        
        // 设置返回值（现代浏览器会显示自己的警告文本）
        const message = `有 ${uploadingTasks.length} 个文件正在上传，刷新页面将取消所有上传任务`;
        event.returnValue = message;
        
        return message;
      }
    };

    // 监听页面刷新/关闭
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [getUploadingTasks]);
}
