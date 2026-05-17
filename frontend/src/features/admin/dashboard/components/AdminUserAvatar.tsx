import { FunctionComponent } from 'react';
import type { User } from '../../../auth/types';
import {
  getAdminDisplayName,
  getAdminUserInitials,
  resolveAvatarUrl,
} from '../utils/adminUserDisplay';

interface AdminUserAvatarProps {
  user: User | null | undefined;
  previewUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-11 w-11 text-sm',
};

const AdminUserAvatar: FunctionComponent<AdminUserAvatarProps> = ({
  user,
  previewUrl,
  size = 'md',
  className = '',
}) => {
  const displayName = getAdminDisplayName(user);
  const initials = getAdminUserInitials(displayName, user?.email);
  const avatarSrc = previewUrl ?? resolveAvatarUrl(user?.profile?.avatar);

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white shadow-admin-sm ring-2 ring-[var(--admin-bg-elevated)] ${sizeClasses[size]} ${className}`}
      style={
        avatarSrc
          ? undefined
          : { background: 'linear-gradient(135deg, var(--admin-brand) 0%, #6366f1 100%)' }
      }
    >
      {avatarSrc ? (
        <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
};

export default AdminUserAvatar;
