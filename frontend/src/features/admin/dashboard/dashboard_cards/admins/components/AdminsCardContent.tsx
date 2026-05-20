import { FunctionComponent } from 'react';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AdminAdministratorRow } from '../../../../api/types';
import { useAdminTableValues } from '../../../../i18n/useAdminTableValues';
import { platformRoleBadgeClass } from '../../../../sous_Admin/constants/platformAdministratorsUi';
import { administratorRoleSlugs } from '../../../../sous_Admin/utils/platformAdministratorUtils';
import AdminMobileRowCard from '../../../../shared/AdminMobileRowCard';
import { AdminEmptyState, AdminTableScroll } from '../../../../ui';
import { adminTableBtn } from '../../../../ui/adminTableButtons';

interface AdminsCardContentProps {
  admins: AdminAdministratorRow[];
  loading?: boolean;
}

const AdminsCardContent: FunctionComponent<AdminsCardContentProps> = ({
  admins,
  loading = false,
}) => {
  const navigate = useNavigate();
  const { adminRole } = useAdminTableValues();

  if (loading) {
    return (
      <div className="px-4 pb-6 sm:px-6">
        <p className="text-sm text-[var(--admin-text-secondary)]">Loading…</p>
      </div>
    );
  }

  if (admins.length === 0) {
    return (
      <div className="px-4 pb-6 sm:px-6">
        <AdminEmptyState title="No admins match your filters." />
      </div>
    );
  }

  const roleBadges = (row: AdminAdministratorRow) => {
    const slugs = administratorRoleSlugs(row);
    if (slugs.length === 0) {
      return <span className={platformRoleBadgeClass('coordinator')}>—</span>;
    }
    return slugs.map((slug) => (
      <span key={slug} className={platformRoleBadgeClass(slug)}>
        {adminRole(slug)}
      </span>
    ));
  };

  return (
    <>
      <div className="space-y-3 px-4 pb-3 pt-0 sm:px-6 lg:hidden">
        {admins.map((admin) => (
          <AdminMobileRowCard
            key={admin.id}
            title={admin.full_name || admin.email}
            badges={<>{roleBadges(admin)}</>}
            actions={
              <button
                type="button"
                className={adminTableBtn}
                onClick={() => navigate(`/admin/admins/${admin.id}/edit`)}
              >
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
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td className="font-medium">{admin.full_name || admin.email}</td>
                <td>
                  <div className="flex flex-wrap gap-1">{roleBadges(admin)}</div>
                </td>
                <td className="text-right">
                  <button
                    type="button"
                    className={adminTableBtn}
                    onClick={() => navigate(`/admin/admins/${admin.id}/edit`)}
                  >
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
