import { FunctionComponent, ReactNode } from 'react';

export type AdminBadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'event'
  | 'interview';

interface AdminBadgeProps {
  children: ReactNode;
  variant?: AdminBadgeVariant;
  className?: string;
}

const AdminBadge: FunctionComponent<AdminBadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
}) => (
  <span className={`admin-badge admin-badge--${variant} ${className}`}>{children}</span>
);

export default AdminBadge;
