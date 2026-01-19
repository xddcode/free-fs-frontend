import React, { useState, useCallback, useMemo } from 'react';
import { User, LogOut, Settings, UserCircle, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserProfileProps } from '@/types/layout';
import { useAuth } from '@/contexts/auth-context';
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
    console.log('Settings clicked');
    // TODO: Navigate to settings page
  }, []);

  const handleProfile = useCallback(() => {
    console.log('Profile clicked');
    // TODO: Navigate to profile page
  }, []);

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
    showDefaultAvatar ? (
      <div className={`${collapsed ? 'h-8 w-8' : 'h-9 w-9'} rounded-full bg-sidebar-accent flex items-center justify-center transition-all duration-200`} aria-hidden="true">
        <User className={`${collapsed ? 'h-4 w-4' : 'h-5 w-5'} text-sidebar-foreground/60 transition-all duration-200`} aria-hidden="true" />
      </div>
    ) : (
      <img
        src={avatar}
        alt=""
        className={`${collapsed ? 'h-8 w-8' : 'h-9 w-9'} rounded-full object-cover transition-all duration-200`}
        onError={handleImageError}
        aria-hidden="true"
      />
    )
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
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{username}</p>
              <p className="text-xs leading-none text-muted-foreground">{email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleProfile}>
            <UserCircle className="mr-2 h-4 w-4" />
            <span>个人资料</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSettings}>
            <Settings className="mr-2 h-4 w-4" />
            <span>设置</span>
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
          <DropdownMenuLabel>我的账户</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleProfile}>
            <UserCircle className="mr-2 h-4 w-4" />
            <span>个人资料</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSettings}>
            <Settings className="mr-2 h-4 w-4" />
            <span>设置</span>
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
