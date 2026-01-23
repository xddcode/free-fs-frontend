import React, { useState, useCallback, useMemo } from 'react';
import { User, LogOut, Settings, MoreVertical, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserProfileProps } from '@/types/layout';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/components/theme-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const UserProfile = React.memo(function UserProfile({
  avatar,
  username,
  email,
  collapsed = false,
  onProfileClick, // Kept for backward compatibility, but not used with dropdown menu
}: UserProfileProps) {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();

  // Determine if we should show the default avatar
  const showDefaultAvatar = useMemo(() => 
    !avatar || imageError,
    [avatar, imageError]
  );

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleSettings = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  const isDark = theme === 'dark';

  const tooltipText = useMemo(() => 
    `${username}\n${email}`,
    [username, email]
  );

  const ariaLabel = useMemo(() => 
    `User profile: ${username}`,
    [username]
  );

  // Avatar component for reuse
  const AvatarComponent = () => (
    <Avatar className='h-8 w-8 rounded-lg'>
      <AvatarImage src={avatar} alt={username} />
      <AvatarFallback className='rounded-lg'>
        {username?.slice(0, 2).toUpperCase() || 'UN'}
      </AvatarFallback>
    </Avatar>
  );

  if (collapsed) {
    // Collapsed mode: show only avatar icon with dropdown menu
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center justify-center p-3 hover:bg-sidebar-accent/50 transition-all duration-200 ease-in-out w-full focus-visible:outline-none focus-visible:ring-0"
            title={tooltipText}
            aria-label={ariaLabel}
            type="button"
          >
            <AvatarComponent />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-56">
          <DropdownMenuLabel className='p-0 font-normal'>
            <div className='flex items-center gap-2 px-1 py-1.5 text-start text-sm'>
              <AvatarComponent />
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>{username}</span>
                <span className='truncate text-xs'>{email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSettings}>
            <Settings className="mr-2 h-4 w-4" />
            <span>账户设置</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleTheme}>
            {isDark ? (
              <>
                <Sun className="mr-2 h-4 w-4" />
                <span>明亮模式</span>
              </>
            ) : (
              <>
                <Moon className="mr-2 h-4 w-4" />
                <span>暗黑模式</span>
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>退出登录</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Expanded mode: show full user profile information with dropdown menu
  return (
    <div className="flex items-center border-t border-sidebar-border/50">
      {/* User info display (non-clickable) */}
      <div className="flex items-center gap-3 px-3 py-3 flex-1">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <AvatarComponent />
        </div>

        {/* User info */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-sidebar-foreground truncate" id="user-name">
            {username}
          </div>
          <div className="text-xs text-sidebar-foreground/60 truncate" id="user-email">
            {email}
          </div>
        </div>
      </div>

      {/* Right side icon button with dropdown menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex-shrink-0 p-3 hover:bg-sidebar-accent/50 transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-0"
            aria-label="用户菜单"
            type="button"
          >
            <MoreVertical className="h-5 w-5 text-sidebar-foreground/60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className='p-0 font-normal'>
            <div className='flex items-center gap-2 px-1 py-1.5 text-start text-sm'>
              <AvatarComponent />
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>{username}</span>
                <span className='truncate text-xs'>{email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSettings}>
            <Settings className="mr-2 h-4 w-4" />
            <span>账户设置</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleTheme}>
            {isDark ? (
              <>
                <Sun className="mr-2 h-4 w-4" />
                <span>明亮模式</span>
              </>
            ) : (
              <>
                <Moon className="mr-2 h-4 w-4" />
                <span>暗黑模式</span>
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>退出登录</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});
