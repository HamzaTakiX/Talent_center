import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Pencil, Shield } from 'lucide-react';
import { useAdminCopy } from '../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import type { AdminAdministratorRow } from '../types/platformAdministrators';
import {
  PLATFORM_ADMIN_OUTLINE_ACTION_BTN_CLASS,
  platformAdminStatusBadgeClass,
  platformRoleBadgeClass,
} from '../constants/platformAdministratorsUi';
import { administratorRoleSlugs } from '../utils/platformAdministratorUtils';
import AdminMobileRowCard from '../../shared/AdminMobileRowCard';
import { AdminSearchEmptyState, AdminTableEmptyState, AdminTableScroll } from '../../ui';

interface AdministratorSublistTableProps {
  rows: AdminAdministratorRow[];
  primaryActionButtonClassName: string;
}

const AdministratorSublistTable: FunctionComponent<AdministratorSublistTableProps> = ({
  rows,
  primaryActionButtonClassName,
}) => {
  const { t } = useTranslation();
  const { tableColumn, emptyState, action } = useAdminCopy();
  const { adminRole, adminPermission, accountStatus } = useAdminTableValues();
  const permissionsLabel = tableColumn('permissions');

  return (
    <>
      <div className="space-y-3 px-3 pb-6 text-num-14 sm:px-5 md:px-6 lg:hidden">
        {rows.length === 0 ? (
          <AdminSearchEmptyState title={emptyState('administratorsSearch')} />
        ) : (
          rows.map((row) => {
            const roleSlugs = administratorRoleSlugs(row);
            const primaryRole = roleSlugs[0] ?? 'stage';
            const primaryPermission = row.permission_keys[0];
            return (
              <AdminMobileRowCard
                key={row.id}
                title={row.full_name}
                meta={row.email}
                badges={
                  <>
                    <span className={platformRoleBadgeClass(primaryRole)}>
                      {adminRole(primaryRole)}
                    </span>
                    <span className={platformAdminStatusBadgeClass(row.account_status)}>
                      {accountStatus(row.account_status)}
                    </span>
                  </>
                }
                fields={[
                  {
                    label: tableColumn('permissions'),
                    value: (
                      <span className="inline-flex items-center gap-2">
                        <Shield
                          className="h-4 w-4 shrink-0 text-[var(--admin-text-secondary)]"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                        {primaryPermission
                          ? adminPermission(primaryPermission)
                          : t('admin.common.notAvailable', { defaultValue: '—' })}
                      </span>
                    ),
                  },
                ]}
                actions={
                  <>
                    <button
                      type="button"
                      className={`${PLATFORM_ADMIN_OUTLINE_ACTION_BTN_CLASS} w-full justify-center sm:w-auto`}
                    >
                      <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                      {action('view')}
                    </button>
                    <button
                      type="button"
                      className={`${PLATFORM_ADMIN_OUTLINE_ACTION_BTN_CLASS} w-full justify-center sm:w-auto`}
                    >
                      <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                      {action('edit')}
                    </button>
                    <button
                      type="button"
                      className={`${primaryActionButtonClassName} w-full justify-center sm:w-auto`}
                    >
                      <Shield className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                      {permissionsLabel}
                    </button>
                  </>
                }
              />
            );
          })
        )}
      </div>

      <div className="admin-module-table-wrap hidden min-w-0 px-3 pb-6 text-num-14 sm:px-5 md:px-6 lg:block">
        <AdminTableScroll minWidth="900px" className="admin-table-scroll--panel">
          <thead>
            <tr>
              <th>{tableColumn('name')}</th>
              <th>{tableColumn('role')}</th>
              <th>{tableColumn('permissions')}</th>
              <th>{tableColumn('status')}</th>
              <th>{tableColumn('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <AdminTableEmptyState colSpan={5} title={emptyState('administratorsSearch')} />
            ) : (
              rows.map((row) => {
                const roleSlugs = administratorRoleSlugs(row);
                const primaryRole = roleSlugs[0] ?? 'stage';
                const primaryPermission = row.permission_keys[0];
                return (
                  <tr key={row.id}>
                    <td className="font-semibold text-[var(--admin-text)]">{row.full_name}</td>
                    <td>
                      <span className={platformRoleBadgeClass(primaryRole)}>
                        {adminRole(primaryRole)}
                      </span>
                    </td>
                    <td>
                      <span className="inline-flex items-center justify-center gap-2">
                        <Shield
                          className="h-4 w-4 shrink-0 text-[var(--admin-text-secondary)]"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                        {primaryPermission
                          ? adminPermission(primaryPermission)
                          : t('admin.common.notAvailable', { defaultValue: '—' })}
                      </span>
                    </td>
                    <td>
                      <span className={platformAdminStatusBadgeClass(row.account_status)}>
                        {accountStatus(row.account_status)}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          type="button"
                          className={`${PLATFORM_ADMIN_OUTLINE_ACTION_BTN_CLASS} min-w-[78.7px]`}
                        >
                          <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                          {action('view')}
                        </button>
                        <button
                          type="button"
                          className={`${PLATFORM_ADMIN_OUTLINE_ACTION_BTN_CLASS} min-w-[72.4px]`}
                        >
                          <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                          {action('edit')}
                        </button>
                        <button
                          type="button"
                          className={`${primaryActionButtonClassName} min-w-[120px]`}
                        >
                          <Shield className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                          {permissionsLabel}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </AdminTableScroll>
      </div>
    </>
  );
};

export default AdministratorSublistTable;
