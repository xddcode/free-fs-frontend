/**
 * useFileDrop Hook
 * 
 * Custom hook for handling drag-and-drop file uploads
 */

import { useState, useCallback, DragEvent } from 'react';

export interface UseFileDropOptions {
  onFileDrop: (files: File[]) => void | Promise<void>;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in bytes
}

export interface UseFileDropReturn {
  isDragging: boolean;
  dropZoneProps: {
    onDragEnter: (e: DragEvent) => void;
    onDragOver: (e: DragEvent) => void;
    onDragLeave: (e: DragEvent) => void;
    onDrop: (e: DragEvent) => void;
  };
}

export function useFileDrop(options: UseFileDropOptions): UseFileDropReturn {
  const { onFileDrop, maxFiles, maxSize } = options;
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragging(false);
      }
      return newCounter;
    });
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setDragCounter(0);

      const files = Array.from(e.dataTransfer.files);
      
      // Filter files based on options
      let validFiles = files;
      
      if (maxFiles && files.length > maxFiles) {
        console.warn(`Too many files. Maximum ${maxFiles} files allowed.`);
        validFiles = files.slice(0, maxFiles);
      }
      
      if (maxSize) {
        validFiles = validFiles.filter((file) => {
          if (file.size > maxSize) {
            console.warn(`File ${file.name} is too large. Maximum size is ${maxSize} bytes.`);
            return false;
          }
          return true;
        });
      }

      if (validFiles.length > 0) {
        await onFileDrop(validFiles);
      }
    },
    [onFileDrop, maxFiles, maxSize]
  );

  return {
    isDragging,
    dropZoneProps: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}
