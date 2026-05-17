import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Hexagon, Pencil } from 'lucide-react';
import { useAdminCopy } from '../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import type { PlatformAdministratorRow } from '../types/platformAdministrators';
import {
  PLATFORM_ADMIN_OUTLINE_ACTION_BTN_CLASS,
  PLATFORM_ADMIN_PRIMARY_ACTION_BTN_MAIN_TABLE_CLASS,
  PLATFORM_ADMIN_ACTIVE_BADGE_CLASS,
  PLATFORM_ADMIN_ROLE_BADGE_CLASS,
} from '../constants/platformAdministratorsUi';
import AdminMobileRowCard from '../../shared/AdminMobileRowCard';
import { AdminSearchEmptyState, AdminTableEmptyState, AdminTableScroll } from '../../ui';

interface PlatformAdministratorsMainTableProps {
  rows: PlatformAdministratorRow[];
}

const PlatformAdministratorsMainTable: FunctionComponent<PlatformAdministratorsMainTableProps> = ({
  rows
}) => {
  const { t } = useTranslation();
  const { tableColumn, emptyState, action } = useAdminCopy();
  const { adminRole, adminPermission, accountStatus } = useAdminTableValues();
  const managePermissionsLabel = t('admin.common.actions.managePermissions');

  return (
  <>
    <div className="space-y-3 px-3 pb-6 text-num-14 sm:px-5 md:px-6 lg:hidden">
      {rows.length === 0 ? (
        <AdminSearchEmptyState title={emptyState('administratorsSearch')} />
      ) : (
        rows.map((row) => (
          <AdminMobileRowCard
            key={row.id}
            title={row.name}
            badges={
              <>
                <span className={PLATFORM_ADMIN_ROLE_BADGE_CLASS[row.roleVariant]}>{adminRole(row.roleVariant)}</span>
                <span className={PLATFORM_ADMIN_ACTIVE_BADGE_CLASS}>
                  {accountStatus(row.status)}
                </span>
              </>
            }
            fields={[
              {
                label: tableColumn('permissions'),
                value: (
                  <span className="inline-flex items-center gap-2">
                    <Hexagon className="h-4 w-4 shrink-0 text-[var(--admin-text-secondary)]" strokeWidth={1.75} aria-hidden />
                    {adminPermission(row.permissionKey)}
                  </span>
                )
              }
            ]}
            actions={
              <>
                <button type="button" className={`${PLATFORM_ADMIN_OUTLINE_ACTION_BTN_CLASS} w-full justify-center sm:w-auto`}>
                  <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  {action('view')}
                </button>
                <button type="button" className={`${PLATFORM_ADMIN_OUTLINE_ACTION_BTN_CLASS} w-full justify-center sm:w-auto`}>
                  <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  {action('edit')}
                </button>
                <button type="button" className={`${PLATFORM_ADMIN_PRIMARY_ACTION_BTN_MAIN_TABLE_CLASS} w-full justify-center sm:w-auto`}>
                  <Hexagon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  {managePermissionsLabel}
                </button>
              </>
            }
          />
        ))
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
            rows.map((row) => (
              <tr key={row.id}>
                <td className="font-medium">{row.name}</td>
                <td>
                  <span className={PLATFORM_ADMIN_ROLE_BADGE_CLASS[row.roleVariant]}>{adminRole(row.roleVariant)}</span>
                </td>
                <td>
                  <span className="inline-flex items-center gap-2">
                    <Hexagon className="h-4 w-4 shrink-0 text-[var(--admin-text-secondary)]" strokeWidth={1.75} aria-hidden />
                    {adminPermission(row.permissionKey)}
                  </span>
                </td>
                <td>
                  <span className={PLATFORM_ADMIN_ACTIVE_BADGE_CLASS}>{accountStatus(row.status)}</span>
                </td>
                <td>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button type="button" className={`${PLATFORM_ADMIN_OUTLINE_ACTION_BTN_CLASS} min-w-[78.7px]`}>
                      <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                      {action('view')}
                    </button>
                    <button type="button" className={`${PLATFORM_ADMIN_OUTLINE_ACTION_BTN_CLASS} min-w-[72.4px]`}>
                      <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                      {action('edit')}
                    </button>
                    <button type="button" className={`${PLATFORM_ADMIN_PRIMARY_ACTION_BTN_MAIN_TABLE_CLASS} min-w-[176px]`}>
                      <Hexagon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                      {managePermissionsLabel}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </AdminTableScroll>
    </div>
  </>
  );
};

export default PlatformAdministratorsMainTable;
