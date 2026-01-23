import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavItemProps } from '@/types/layout';

/**
 * NavItem Component
 * 
 * A navigation item component that displays an icon, label, and optional badge.
 * Supports active state highlighting, collapsed mode, and keyboard navigation.
 * Optimized with React.memo and useCallback for performance.
 * 
 * @param icon - Lucide icon component to display
 * @param label - Text label for the navigation item
 * @param href - Navigation destination URL
 * @param active - Whether this item is currently active
 * @param collapsed - Whether the sidebar is in collapsed mode (icon-only)
 * @param badge - Optional badge number to display
 * @param onClick - Optional click handler
 */
export const NavItem = React.memo(function NavItem({
  icon: Icon,
  label,
  href,
  active = false,
  collapsed = false,
  badge,
  onClick,
}: NavItemProps): React.JSX.Element {
  const handleClick = useCallback((_e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLAnchorElement>) => {
    // Support keyboard navigation: Enter and Space keys
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick) {
        onClick();
      }
      // Trigger navigation
      e.currentTarget.click();
    }
  }, [onClick]);

  const content = useMemo(() => (
    <>
      <Icon className={cn(
        'shrink-0 transition-all duration-200',
        collapsed ? 'size-5' : 'size-4'
      )} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className={cn(
              'flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full',
              'text-xs font-medium',
              'transition-colors duration-200',
              active 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            )}>
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </>
      )}
    </>
  ), [Icon, collapsed, label, badge, active]);

  const linkElement = useMemo(() => (
    <Link
      to={href}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5',
        'text-sm font-medium',
        'transition-all duration-200 ease-in-out',
        'outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
        active 
          ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
        collapsed && 'justify-center px-2'
      )}
      title={collapsed ? label : undefined}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      aria-describedby={badge && badge > 0 ? `badge-${label}` : undefined}
      tabIndex={0}
      role="listitem"
    >
      {content}
    </Link>
  ), [href, handleClick, handleKeyDown, active, collapsed, label, content, badge]);

  return linkElement;
});

