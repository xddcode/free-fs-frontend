'use client';

import React, { useCallback } from 'react';
import { AppLayoutProps } from '@/types/layout';
import { useFileDrop } from '@/hooks/use-file-drop';
import { Sidebar } from './sidebar';
import { Upload } from 'lucide-react';

export const AppLayout = React.memo(function AppLayout({ 
  children 
}: AppLayoutProps): React.JSX.Element {
  // Handle file drop
  const handleFileDrop = useCallback(async (files: File[]) => {
    console.log('Files dropped:', files);
    
    // TODO: Implement actual file upload logic
    // This is a placeholder for future implementation
    // In a real application, you would:
    // 1. Upload files to the server
    // 2. Show upload progress
    // 3. Update the file list
    // 4. Show success/error notifications
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Files processed:', files.map(f => f.name));
  }, []);

  const { isDragging, dropZoneProps } = useFileDrop({
    onFileDrop: handleFileDrop,
    accept: undefined, // Accept all file types
    maxFiles: 100,
    maxSize: 100 * 1024 * 1024, // 100MB per file
  });

  return (
    <div className="flex h-screen overflow-hidden" role="application" aria-label="Cloud Drive Desktop Application">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area with Drag-and-Drop */}
      <main
        {...dropZoneProps}
        className="flex-1 overflow-y-auto relative"
        role="main"
        aria-label="Main content area"
        id="main-content"
      >
        {children}
        
        {/* Drag Overlay */}
        {isDragging && (
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
            role="status"
            aria-live="assertive"
            aria-label="Drop files here to upload"
          >
            <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-primary bg-background/95 p-12 shadow-lg animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
              <Upload className="h-16 w-16 text-primary animate-bounce" aria-hidden="true" />
              <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                <p className="text-xl font-semibold">拖放文件到这里</p>
                <p className="text-sm text-muted-foreground mt-2">
                  支持多个文件，最大 100MB
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
});
