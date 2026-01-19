import React, { useMemo } from 'react';
import { HardDrive } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { StorageInfoProps } from '@/types/layout';
import { STORAGE_THRESHOLDS } from '../../lib/constants';
import { cn } from '@/lib/utils';

export const StorageInfo = React.memo(function StorageInfo({ 
  used, 
  total, 
  collapsed = false 
}: StorageInfoProps) {
  // Calculate storage percentage
  const percentage = useMemo(() => 
    total > 0 ? (used / total) * 100 : 0,
    [used, total]
  );
  
  // Determine status color based on usage percentage
  const statusColor = useMemo(() => {
    if (percentage >= STORAGE_THRESHOLDS.CRITICAL) {
      return 'text-red-500 dark:text-red-400';
    } else if (percentage >= STORAGE_THRESHOLDS.WARNING) {
      return 'text-orange-500 dark:text-orange-400';
    }
    return 'text-primary';
  }, [percentage]);

  const progressIndicatorClass = useMemo(() => {
    if (percentage >= STORAGE_THRESHOLDS.CRITICAL) {
      return '[&>div]:bg-red-500 [&>div]:dark:bg-red-400';
    } else if (percentage >= STORAGE_THRESHOLDS.WARNING) {
      return '[&>div]:bg-orange-500 [&>div]:dark:bg-orange-400';
    }
    return '';
  }, [percentage]);

  // Format storage values to 2 decimal places
  const formattedUsed = useMemo(() => used.toFixed(2), [used]);
  const formattedTotal = useMemo(() => total.toFixed(2), [total]);
  const formattedPercentage = useMemo(() => percentage.toFixed(1), [percentage]);

  const tooltipText = useMemo(() => 
    `${formattedUsed} GB / ${formattedTotal} GB (${formattedPercentage}%)`,
    [formattedUsed, formattedTotal, formattedPercentage]
  );

  if (collapsed) {
    // Collapsed mode: show only icon with tooltip
    return (
      <div
        className="flex items-center justify-center p-3 transition-all duration-200"
        title={tooltipText}
        role="status"
        aria-label={`Storage: ${tooltipText}`}
      >
        <HardDrive className={cn(
          'h-5 w-5 transition-all duration-300',
          statusColor
        )} aria-hidden="true" />
      </div>
    );
  }

  // Expanded mode: show full storage information
  return (
    <div className="px-3 py-3 border-t border-sidebar-border/50" role="region" aria-label="Storage information">
      <div className="space-y-2">
        {/* Storage icon and label */}
        <div className="flex items-center gap-2">
          <HardDrive className={cn(
            'h-4 w-4 transition-all duration-300',
            statusColor
          )} aria-hidden="true" />
          <span className="text-sm font-medium text-sidebar-foreground" id="storage-label">存储空间</span>
        </div>

        {/* Storage usage text */}
        <div className="text-xs text-sidebar-foreground/60 transition-colors duration-200" aria-labelledby="storage-label">
          <span className={cn(statusColor, 'transition-colors duration-300')}>
            {formattedUsed} GB
          </span>
          {' / '}
          <span>
            {formattedTotal} GB
          </span>
        </div>

        {/* Progress bar */}
        <Progress
          value={percentage}
          className={cn('h-1.5 transition-all duration-500', progressIndicatorClass)}
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Storage usage: ${formattedPercentage}% used`}
          role="progressbar"
        />

        {/* Percentage text */}
        <div className={cn(
          'text-xs text-right transition-colors duration-300',
          statusColor
        )} aria-live="polite">
          {formattedPercentage}%
        </div>
      </div>
    </div>
  );
});
