import { FunctionComponent } from 'react';
import type { User } from '../../../auth/types';
import { getAdminDisplayName } from '../utils/adminUserDisplay';
import { useAdminRoleLabel } from '../hooks/useAdminRoleLabel';
import AdminUserAvatar from './AdminUserAvatar';

export type AdminUserIdentityVariant = 'stacked' | 'inline';

interface AdminUserIdentityProps {
  user: User | null | undefined;
  avatarSize?: 'sm' | 'md' | 'lg';
  variant?: AdminUserIdentityVariant;
  className?: string;
  hideMetaOnMobile?: boolean;
}

const AdminUserIdentity: FunctionComponent<AdminUserIdentityProps> = ({
  user,
  avatarSize = 'md',
  variant = 'stacked',
  className = '',
  hideMetaOnMobile = false,
}) => {
  const roleLabel = useAdminRoleLabel(user?.role);
  const displayName = getAdminDisplayName(user);

  const metaClass = hideMetaOnMobile
    ? 'admin-user-identity-meta hidden min-w-0 flex-col md:flex'
    : 'admin-user-identity-meta min-w-0 flex-col';

  if (variant === 'inline') {
    return (
      <div className={`admin-user-identity flex min-w-0 items-center gap-2.5 ${className}`}>
        <AdminUserAvatar user={user} size={avatarSize} />
        <p className="min-w-0 flex-1 truncate text-sm leading-snug">
          <span className="font-semibold text-[var(--admin-text)]">{displayName || roleLabel}</span>
          <span className="mx-1.5 font-normal text-[var(--admin-text-muted)]" aria-hidden>
            ·
          </span>
          <span className="font-medium text-[var(--admin-brand)]">{roleLabel}</span>
        </p>
      </div>
    );
  }

  return (
    <div
      className={`admin-user-identity admin-user-identity--stacked flex min-w-0 items-center gap-2.5 ${className}`}
    >
      <AdminUserAvatar user={user} size={avatarSize} />
      <div className={metaClass}>
        {displayName ? (
          <span className="admin-user-identity-name truncate">{displayName}</span>
        ) : null}
        <span className="admin-role-badge admin-role-badge--compact truncate">{roleLabel}</span>
      </div>
    </div>
  );
};

export default AdminUserIdentity;

