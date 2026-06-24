import { FunctionComponent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminCrudRoutes } from '../../shared/navigation/adminCrudRoutes';
import { useAdminCopy } from '../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import type { useTableRowSelection } from '../../shared/hooks/useTableRowSelection';
import type { AdminAdministratorRow } from '../types/platformAdministrators';
import {
  platformAdminStatusBadgeClass,
  platformRoleBadgeClass,
} from '../constants/platformAdministratorsUi';
import AdminMobileRowCard from '../../shared/AdminMobileRowCard';
import {
  AdminMobileTableSkeleton,
  AdminPagination,
  AdminSearchEmptyState,
  AdminTableEmptyState,
  AdminTableScroll,
  AdminTableSkeletonRows,
} from '../../ui';
import AdministratorDetailModal from './AdministratorDetailModal';
import AdministratorActions from './AdministratorActions';
import AdministratorTableIdentityCell from './AdministratorTableIdentityCell';
import {
  administratorRoleSlugs,
  isSuperAdminAdministrator,
} from '../utils/platformAdministratorUtils';
import { ADMIN_TABLE_COL } from '../../../../design-system/safeContent';

interface PlatformAdministratorsMainTableProps {
  rows: AdminAdministratorRow[];
  loading?: boolean;
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  selectionMode: boolean;
  selection: ReturnType<typeof useTableRowSelection>;
}

function formatScopePreview(row: AdminAdministratorRow, t: (k: string) => string): string {
  const parts: string[] = [];
  const scopes = row.scopes;
  if (scopes?.filiere_labels?.length) {
    parts.push(scopes.filiere_labels.slice(0, 2).join(', '));
  }
  if (scopes?.class_group_labels?.length) {
    parts.push(scopes.class_group_labels.slice(0, 2).join(', '));
  }
  if (!parts.length) return t('admin.tables.administrators.scopeGlobal');
  return parts.join(' · ');
}

function formatLastLogin(iso: string | null, locale: string, neverLabel: string): string {
  if (!iso) return neverLabel;
  try {
    return new Date(iso).toLocaleString(locale);
  } catch {
    return neverLabel;
  }
}

const PlatformAdministratorsMainTable: FunctionComponent<PlatformAdministratorsMainTableProps> = ({
  rows,
  loading = false,
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  selectionMode,
  selection,
}) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { tableColumn, emptyState } = useAdminCopy();
  const { adminRole, accountStatus } = useAdminTableValues();
  const neverLogin = t('admin.tables.administrators.neverLoggedIn');
  const dateLocale = i18n.language.startsWith('ar') ? 'ar-MA' : i18n.language.startsWith('en') ? 'en-GB' : 'fr-FR';
  const [viewRow, setViewRow] = useState<AdminAdministratorRow | null>(null);

  const colSpan = selectionMode ? 8 : 7;

  return (
    <>
      <AdministratorDetailModal
        open={viewRow != null}
        administrator={viewRow}
        onClose={() => setViewRow(null)}
        onEdit={
          viewRow && !isSuperAdminAdministrator(viewRow)
            ? (id) => {
                setViewRow(null);
                navigate(adminCrudRoutes.adminEdit(String(id)));
              }
            : undefined
        }
      />
      <div className="space-y-3 px-3 pb-6 text-num-14 sm:px-5 md:px-6 lg:hidden">
        {loading ? (
          <AdminMobileTableSkeleton />
        ) : rows.length === 0 ? (
          <AdminSearchEmptyState title={emptyState('administratorsSearch')} />
        ) : (
          rows.map((row) => {
            const superAdmin = isSuperAdminAdministrator(row);
            const roleSlugs = administratorRoleSlugs(row);
            return (
            <AdminMobileRowCard
              key={row.id}
              title={row.full_name}
              meta={row.email}
              badges={
                <>
                  {roleSlugs.map((slug) => (
                    <span key={slug} className={platformRoleBadgeClass(slug)}>
                      {adminRole(slug)}
                    </span>
                  ))}
                  <span className={platformAdminStatusBadgeClass(row.account_status)}>
                    {accountStatus(row.account_status)}
                  </span>
                </>
              }
              fields={[
                {
                  label: tableColumn('scopes'),
                  value: formatScopePreview(row, t),
                },
                {
                  label: tableColumn('lastLogin'),
                  value: formatLastLogin(row.last_login_at, dateLocale, neverLogin),
                },
                {
                  label: tableColumn('onboarding'),
                  value: row.onboarding_complete
                    ? t('admin.tables.administrators.onboardingComplete')
                    : t('admin.tables.administrators.onboardingPending'),
                },
              ]}
              actions={
                <AdministratorActions
                  administrator={row}
                  onView={() => setViewRow(row)}
                  onEdit={
                    !superAdmin
                      ? () => navigate(adminCrudRoutes.adminEdit(String(row.id)))
                      : undefined
                  }
                  onManagePermissions={
                    !superAdmin
                      ? () => navigate(adminCrudRoutes.adminPermissions(String(row.id)))
                      : undefined
                  }
                />
              }
            />
            );
          })
        )}
      </div>

      <div className="admin-module-table-wrap hidden min-w-0 px-3 pb-6 text-num-14 sm:px-5 md:px-6 lg:block">
        <AdminTableScroll
          minWidth={selectionMode ? '1140px' : '1100px'}
          className="admin-table-scroll--panel"
        >
          <thead>
            <tr>
              {selectionMode ? (
                <th className="w-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[var(--admin-border)] accent-[var(--admin-accent)]"
                    checked={selection.allOnPageSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = selection.someOnPageSelected;
                    }}
                    onChange={selection.toggleAllOnPage}
                    aria-label={t('admin.common.delete.clearSelection')}
                  />
                </th>
              ) : null}
              <th>{tableColumn('name')}</th>
              <th>{tableColumn('role')}</th>
              <th>{tableColumn('scopes')}</th>
              <th>{tableColumn('status')}</th>
              <th>{tableColumn('lastLogin')}</th>
              <th>{tableColumn('onboarding')}</th>
              <th className={`text-end ${ADMIN_TABLE_COL.actionsMenu}`}>{tableColumn('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <AdminTableSkeletonRows colSpan={colSpan} />
            ) : rows.length === 0 ? (
              <AdminTableEmptyState colSpan={colSpan} title={emptyState('administratorsSearch')} />
            ) : (
              rows.map((row) => {
                const superAdmin = isSuperAdminAdministrator(row);
                const roleSlugs = administratorRoleSlugs(row);
                return (
                <tr key={row.id}>
                  {selectionMode ? (
                    <td>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-[var(--admin-border)] accent-[var(--admin-accent)]"
                        checked={selection.isSelected(row.id)}
                        onChange={() => selection.toggleRow(row.id)}
                        disabled={superAdmin}
                        aria-label={row.full_name || row.email}
                      />
                    </td>
                  ) : null}
                  <td>
                    <AdministratorTableIdentityCell administrator={row} />
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {roleSlugs.length === 0 ? (
                        <span className="text-xs text-[var(--admin-text-secondary)]">—</span>
                      ) : (
                        roleSlugs.map((slug) => (
                          <span key={slug} className={platformRoleBadgeClass(slug)}>
                            {adminRole(slug)}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="max-w-[200px] truncate text-xs text-[var(--admin-text-secondary)]">
                    {formatScopePreview(row, t)}
                  </td>
                  <td>
                    <span className={platformAdminStatusBadgeClass(row.account_status)}>
                      {accountStatus(row.account_status)}
                    </span>
                  </td>
                  <td className="text-xs text-[var(--admin-text-secondary)]">
                    {formatLastLogin(row.last_login_at, dateLocale, neverLogin)}
                  </td>
                  <td>
                    <span
                      className={
                        row.onboarding_complete
                          ? 'text-emerald-400 text-xs font-medium'
                          : 'text-amber-400 text-xs font-medium'
                      }
                    >
                      {row.onboarding_complete
                        ? t('admin.tables.administrators.onboardingComplete')
                        : t('admin.tables.administrators.onboardingPending')}
                    </span>
                  </td>
                  <td className="admin-students-table__actions text-end">
                    <AdministratorActions
                      administrator={row}
                      onView={() => setViewRow(row)}
                      onEdit={
                        !superAdmin
                          ? () => navigate(adminCrudRoutes.adminEdit(String(row.id)))
                          : undefined
                      }
                      onManagePermissions={
                        !superAdmin
                          ? () => navigate(adminCrudRoutes.adminPermissions(String(row.id)))
                          : undefined
                      }
                    />
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </AdminTableScroll>
        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
          itemLabel={t('admin.pagination.administrators', { defaultValue: 'administrateurs' })}
        />
      </div>
    </>
  );
};

export default PlatformAdministratorsMainTable;
