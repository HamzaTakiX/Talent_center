import { FunctionComponent } from 'react';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { AdminEncadrantRow } from '../../../../api/types';
import AdminMobileRowCard from '../../../../shared/AdminMobileRowCard';
import { AdminEmptyState, AdminTableScroll } from '../../../../ui';
import { adminTableBtn } from '../../../../ui/adminTableButtons';
import { encadrantProgramsLabel } from '../../shared/utils/dashboardCardFilters';

interface EncadrantsCardContentProps {
  encadrants: AdminEncadrantRow[];
  loading?: boolean;
}

const EncadrantsCardContent: FunctionComponent<EncadrantsCardContentProps> = ({
  encadrants,
  loading = false,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const globalScopeLabel = t('admin.tables.administrators.scopeGlobal');

  if (loading) {
    return (
      <div className="px-4 pb-6 sm:px-6">
        <p className="text-sm text-[var(--admin-text-secondary)]">Loading…</p>
      </div>
    );
  }

  if (encadrants.length === 0) {
    return (
      <div className="px-4 pb-6 sm:px-6">
        <AdminEmptyState title="No encadrants match your filters." />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 px-4 pb-3 pt-0 sm:px-6 lg:hidden">
        {encadrants.map((encadrant) => (
          <AdminMobileRowCard
            key={encadrant.id}
            title={encadrant.full_name || encadrant.email}
            fields={[
              { label: 'Programs', value: encadrantProgramsLabel(encadrant, globalScopeLabel) },
              {
                label: 'Students assigned',
                value: <span className="tabular-nums">{encadrant.current_students}</span>,
              },
            ]}
            actions={
              <button
                type="button"
                className={adminTableBtn}
                onClick={() => navigate(`/admin/encadrants/${encadrant.id}/edit`)}
              >
                <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                View
              </button>
            }
          />
        ))}
      </div>

      <div className="admin-module-table-wrap hidden min-w-0 px-4 pb-6 pt-0 sm:px-6 lg:block">
        <AdminTableScroll minWidth="720px" className="admin-table-scroll--panel">
          <thead>
            <tr>
              <th>Name</th>
              <th>Programs</th>
              <th>Students Assigned</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {encadrants.map((encadrant) => (
              <tr key={encadrant.id}>
                <td className="font-medium">{encadrant.full_name || encadrant.email}</td>
                <td>{encadrantProgramsLabel(encadrant, globalScopeLabel)}</td>
                <td className="tabular-nums">{encadrant.current_students}</td>
                <td className="text-right">
                  <button
                    type="button"
                    className={adminTableBtn}
                    onClick={() => navigate(`/admin/encadrants/${encadrant.id}/edit`)}
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

export default EncadrantsCardContent;
