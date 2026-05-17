import { FunctionComponent } from 'react';
import AdminSearchEmptyState from './AdminSearchEmptyState';

interface AdminTableEmptyStateProps {
  colSpan: number;
  title?: string;
  description?: string;
}

/** Ligne tableau vide — état recherche moderne (bleu). */
const AdminTableEmptyState: FunctionComponent<AdminTableEmptyStateProps> = ({
  colSpan,
  title,
  description,
}) => (
  <tr className="admin-table-empty-row">
    <td colSpan={colSpan} className="admin-table-empty-cell">
      <AdminSearchEmptyState variant="table" title={title} description={description} />
    </td>
  </tr>
);

export default AdminTableEmptyState;
