import { useState, useCallback } from 'react';
import type { FileItem } from '@/types/file';

export interface DragDropState {
  isDragging: boolean;
  draggedItems: FileItem[];
  dropTargetId: string | null;
  dropTargetName: string | null;
}

export function useFileDragDrop(
  selectedKeys: string[],
  fileList: FileItem[],
  onMove: (fileIds: string[], targetDirId: string) => Promise<void>
) {
  const [dragState, setDragState] = useState<DragDropState>({
    isDragging: false,
    draggedItems: [],
    dropTargetId: null,
    dropTargetName: null,
  });

  /**
   * 开始拖拽
   */
  const handleDragStart = useCallback(
    (e: React.DragEvent, file: FileItem) => {
      // 如果拖拽的文件在选中列表中，拖拽所有选中的文件
      // 否则只拖拽当前文件
      const draggedItems = selectedKeys.includes(file.id)
        ? fileList.filter((f) => selectedKeys.includes(f.id))
        : [file];

      setDragState({
        isDragging: true,
        draggedItems,
        dropTargetId: null,
      });

      // 设置拖拽数据
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('application/json', JSON.stringify(draggedItems.map((f) => f.id)));

      // 创建自定义拖拽图像（克隆元素但去掉背景色）
      const currentElement = e.currentTarget as HTMLElement;
      const clone = currentElement.cloneNode(true) as HTMLElement;
      
      // 检查是否是表格行（列表视图）
      const isTableRow = currentElement.tagName === 'TR';
      
      if (isTableRow) {
        // 列表视图：创建一个包装器来正确显示表格行
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
          position: absolute;
          top: -10000px;
          left: -10000px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: hsl(var(--accent));
          border-radius: 8px;
          opacity: 0.95;
          pointer-events: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        `;
        
        // 只提取图标和文件名
        const nameCell = clone.querySelectorAll('td')[1]; // 第二列是文件名
        if (nameCell) {
          const iconElement = nameCell.querySelector('div > div:first-child');
          const nameElement = nameCell.querySelector('span');
          
          if (iconElement) {
            const clonedIcon = iconElement.cloneNode(true) as HTMLElement;
            wrapper.appendChild(clonedIcon);
          }
          
          if (nameElement) {
            const clonedName = nameElement.cloneNode(true) as HTMLElement;
            clonedName.style.cssText = `
              font-size: 14px;
              color: hsl(var(--foreground));
              white-space: nowrap;
            `;
            wrapper.appendChild(clonedName);
          }
        }
        
        document.body.appendChild(wrapper);
        
        // 如果是多选，添加数量标识
        if (draggedItems.length > 1) {
          const badge = document.createElement('div');
          badge.style.cssText = `
            margin-left: 8px;
            background: #ef4444;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 700;
            box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
          `;
          badge.textContent = String(draggedItems.length);
          wrapper.appendChild(badge);
        }
        
        e.dataTransfer.setDragImage(wrapper, 20, 20);
        
        // 清理克隆元素
        setTimeout(() => {
          if (document.body.contains(wrapper)) {
            document.body.removeChild(wrapper);
          }
        }, 0);
      } else {
        // 网格视图：原有逻辑
        clone.style.cssText = `
          position: absolute;
          top: -10000px;
          left: -10000px;
          width: ${currentElement.offsetWidth}px;
          height: ${currentElement.offsetHeight}px;
          background: transparent !important;
          border-radius: 8px;
          opacity: 0.9;
          pointer-events: none;
        `;
        
        // 移除克隆元素中所有子元素的背景色
        const allElements = clone.querySelectorAll('*');
        allElements.forEach((el) => {
          (el as HTMLElement).style.background = 'transparent';
          (el as HTMLElement).style.backgroundColor = 'transparent';
        });
        
        document.body.appendChild(clone);
        
        // 如果是多选，添加数量标识（放在文件名右上角）
        if (draggedItems.length > 1) {
          // 找到文件名元素的位置
          const nameElement = clone.querySelector('.text-sm.font-normal');
          if (nameElement) {
            const nameRect = nameElement.getBoundingClientRect();
            const cloneRect = clone.getBoundingClientRect();
            
            const badge = document.createElement('div');
            badge.style.cssText = `
              position: absolute;
              top: ${nameRect.top - cloneRect.top - 6}px;
              left: ${nameRect.right - cloneRect.left + 4}px;
              background: #ef4444;
              color: white;
              border-radius: 50%;
              width: 20px;
              height: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: 700;
              box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
            `;
            badge.textContent = String(draggedItems.length);
            clone.appendChild(badge);
          }
        }
        
        e.dataTransfer.setDragImage(clone, currentElement.offsetWidth / 2, currentElement.offsetHeight / 2);
        
        // 清理克隆元素
        setTimeout(() => {
          if (document.body.contains(clone)) {
            document.body.removeChild(clone);
          }
        }, 0);
      }
    },
    [selectedKeys, fileList]
  );

  /**
   * 拖拽结束
   */
  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedItems: [],
      dropTargetId: null,
      dropTargetName: null,
    });
  }, []);

  /**
   * 拖拽进入目标
   */
  const handleDragEnter = useCallback(
    (e: React.DragEvent, targetFolder: FileItem) => {
      e.preventDefault();
      e.stopPropagation();

      // 只有文件夹才能作为拖放目标
      if (!targetFolder.isDir) return;

      // 不能拖拽到自己身上
      const draggedIds = dragState.draggedItems.map((f) => f.id);
      if (draggedIds.includes(targetFolder.id)) return;

      setDragState((prev) => ({
        ...prev,
        dropTargetId: targetFolder.id,
        dropTargetName: targetFolder.displayName,
      }));
    },
    [dragState.draggedItems]
  );

  /**
   * 拖拽经过目标
   */
  const handleDragOver = useCallback((e: React.DragEvent, targetFolder: FileItem) => {
    e.preventDefault();
    e.stopPropagation();

    // 只有文件夹才能作为拖放目标
    if (!targetFolder.isDir) return;

    e.dataTransfer.dropEffect = 'move';
  }, []);

  /**
   * 拖拽离开目标
   */
  const handleDragLeave = useCallback((e: React.DragEvent, targetFolder: FileItem) => {
    e.preventDefault();
    e.stopPropagation();

    // 检查是否真的离开了目标元素（而不是进入子元素）
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setDragState((prev) => ({
        ...prev,
        dropTargetId: prev.dropTargetId === targetFolder.id ? null : prev.dropTargetId,
        dropTargetName: prev.dropTargetId === targetFolder.id ? null : prev.dropTargetName,
      }));
    }
  }, []);

  /**
   * 放置到目标
   */
  const handleDrop = useCallback(
    async (e: React.DragEvent, targetFolder: FileItem) => {
      e.preventDefault();
      e.stopPropagation();

      // 只有文件夹才能作为拖放目标
      if (!targetFolder.isDir) return;

      try {
        const fileIdsJson = e.dataTransfer.getData('application/json');
        if (!fileIdsJson) return;

        const fileIds = JSON.parse(fileIdsJson) as string[];

        // 不能拖拽到自己身上
        if (fileIds.includes(targetFolder.id)) return;

        // 执行移动操作
        await onMove(fileIds, targetFolder.id);
      } catch (error) {
        console.error('拖拽移动失败:', error);
      } finally {
        setDragState({
          isDragging: false,
          draggedItems: [],
          dropTargetId: null,
          dropTargetName: null,
        });
      }
    },
    [onMove]
  );

  return {
    dragState,
    handleDragStart,
    handleDragEnd,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
