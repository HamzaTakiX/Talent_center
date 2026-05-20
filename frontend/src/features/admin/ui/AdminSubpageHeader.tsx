import { FunctionComponent, ReactNode } from 'react';
import AdminModuleHeader from './AdminModuleHeader';

interface AdminSubpageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

/** En-tête compact pour sous-pages admin (listes filtrées, détail). */
const AdminSubpageHeader: FunctionComponent<AdminSubpageHeaderProps> = ({
  title,
  subtitle,
  actions,
  className = '',
}) => (
  <AdminModuleHeader
    title={title}
    subtitle={subtitle}
    actions={actions}
    layout={actions ? 'inline' : 'stacked'}
    className={['admin-subpage-header', className].filter(Boolean).join(' ')}
  />
);

export default AdminSubpageHeader;
