import { FunctionComponent } from 'react';
import { Eye } from 'lucide-react';
import type { AdminRow } from '../data/adminsMockData';
import AdminMobileRowCard from '../../../../shared/AdminMobileRowCard';
import { AdminEmptyState, AdminTableScroll } from '../../../../ui';
import { ADMIN_TABLE_BADGE, adminBadgeClass } from '../../../../ui/adminStatusBadges';
import { adminTableBtn } from '../../../../ui/adminTableButtons';

interface AdminsCardContentProps {
  admins: AdminRow[];
}

const AdminsCardContent: FunctionComponent<AdminsCardContentProps> = ({ admins }) => {
  if (admins.length === 0) {
    return (
      <div className="px-4 pb-6 sm:px-6">
        <AdminEmptyState title="No admins match your filters." />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 px-4 pb-3 pt-0 sm:px-6 lg:hidden">
        {admins.map((admin, index) => (
          <AdminMobileRowCard
            key={`${admin.name}-${index}`}
            title={admin.name}
            badges={<span className={adminBadgeClass('neutral', ADMIN_TABLE_BADGE)}>{admin.role}</span>}
            actions={
              <button type="button" className={adminTableBtn}>
                <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                View
              </button>
            }
          />
        ))}
      </div>

      <div className="admin-module-table-wrap hidden min-w-0 px-4 pb-6 pt-0 sm:px-6 lg:block">
        <AdminTableScroll minWidth="520px" className="admin-table-scroll--panel">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin, index) => (
              <tr key={`${admin.name}-${index}`}>
                <td className="font-medium">{admin.name}</td>
                <td>
                  <span className={adminBadgeClass('neutral', ADMIN_TABLE_BADGE)}>{admin.role}</span>
                </td>
                <td className="text-right">
                  <button type="button" className={adminTableBtn}>
                    <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTableScroll>
      </div>
    </>
  );
};

export default AdminsCardContent;
