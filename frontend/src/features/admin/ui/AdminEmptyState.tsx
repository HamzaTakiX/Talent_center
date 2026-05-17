import { FunctionComponent, ReactNode } from 'react';
import AdminSearchEmptyState from './AdminSearchEmptyState';

interface AdminEmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

const AdminEmptyState: FunctionComponent<AdminEmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => (
  <div className="admin-empty-state-legacy-wrap">
    <AdminSearchEmptyState title={title} description={description} icon={icon} variant="panel" />
    {action ? <div className="admin-empty-state-legacy-action">{action}</div> : null}
  </div>
);

export default AdminEmptyState;
