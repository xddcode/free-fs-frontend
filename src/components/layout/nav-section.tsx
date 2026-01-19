'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { NavSectionProps } from '@/types/layout';

/**
 * NavSection Component
 * 
 * A navigation section component that groups related navigation items together.
 * Supports an optional title header and adapts to collapsed sidebar state.
 * Optimized with React.memo for performance.
 * 
 * @param title - Optional section title to display above the items
 * @param children - Navigation items to render within this section
 * @param collapsed - Whether the sidebar is in collapsed mode
 */
export const NavSection = React.memo(function NavSection({
  title,
  children,
  collapsed = false,
}: NavSectionProps): React.JSX.Element {
  return (
    <nav 
      className={cn('flex flex-col gap-0.5', collapsed && 'items-center')}
      aria-label={title || 'Navigation section'}
    >
      {title && !collapsed && (
        <h3 
          className={cn(
            'px-3 py-2 mb-1 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider'
          )}
          id={`nav-section-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {title}
        </h3>
      )}
      <div 
        className="flex flex-col gap-1"
        role="list"
        aria-labelledby={title && !collapsed ? `nav-section-${title.toLowerCase().replace(/\s+/g, '-')}` : undefined}
      >
        {children}
      </div>
    </nav>
  );
});

