import { FunctionComponent, ReactNode } from 'react';
import AdminSearchEmptyState from './AdminSearchEmptyState';

interface AdminTableEmptyStateProps {
  colSpan: number;
  title?: string;
  description?: string;
  titleKey?: string;
  descriptionKey?: string;
  icon?: ReactNode;
}

/** Ligne tableau vide — état recherche moderne (bleu). */
const AdminTableEmptyState: FunctionComponent<AdminTableEmptyStateProps> = ({
  colSpan,
  title,
  description,
  titleKey,
  descriptionKey,
  icon,
}) => (
  <tr className="admin-table-empty-row">
    <td colSpan={colSpan} className="admin-table-empty-cell">
      <AdminSearchEmptyState
        variant="table"
        title={title}
        description={description}
        titleKey={titleKey}
        descriptionKey={descriptionKey}
        icon={icon}
      />
    </td>
  </tr>
);

export default AdminTableEmptyState;
