import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, CircleCheck } from 'lucide-react';
import { useAdminCopy, useAdminSearchPlaceholder } from '../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import type {
  StudentFinancialRowStatus,
  StudentFinancialTableRow,
} from '../data/srfFinancialMock';
import AdminMobileRowCard from '../../shared/AdminMobileRowCard';
import AdminBadge, { type AdminBadgeVariant } from '../../ui/AdminBadge';
import { AdminEmptyState, AdminListToolbar, AdminModuleHeader, AdminTableEmptyState, AdminTableScroll } from '../../ui';
import { adminTableBtn, adminTableBtnMobile, adminTableBtnMobilePrimary } from '../../ui/adminTableButtons';

const statusBadgeVariant: Record<StudentFinancialRowStatus, AdminBadgeVariant> = {
  Paid: 'success',
  Unpaid: 'danger',
  'Partially Paid': 'warning',
  'Pending Validation': 'info',
  Late: 'danger',
};

const mad = (n: number) => `${n} MAD`;

interface StudentFinancialStatusTableProps {
  rows: StudentFinancialTableRow[];
  query: string;
  onQueryChange: (value: string) => void;
}

const StudentFinancialStatusTable: FunctionComponent<StudentFinancialStatusTableProps> = ({
  rows,
  query,
  onQueryChange,
}) => {
  const { t } = useTranslation();
  const { tableColumn, emptyState, filterLabel } = useAdminCopy();
  const { srfPaymentStatus } = useAdminTableValues();
  const searchPh = useAdminSearchPlaceholder('srf');
  const [statusFilter, setStatusFilter] = useState('all');

  const statusFilterOptions = useMemo(
    () => [
      { value: 'all', label: filterLabel('allStatuses') },
      { value: 'Paid', label: srfPaymentStatus('Paid') },
      { value: 'Unpaid', label: srfPaymentStatus('Unpaid') },
      { value: 'Partially Paid', label: srfPaymentStatus('Partially Paid') },
      { value: 'Pending Validation', label: srfPaymentStatus('Pending Validation') },
      { value: 'Late', label: srfPaymentStatus('Late') },
    ],
    [filterLabel, srfPaymentStatus]
  );

  const StatusBadge: FunctionComponent<{ status: StudentFinancialRowStatus }> = ({ status }) => (
    <AdminBadge variant={statusBadgeVariant[status]} className="rounded-full px-2.5 py-1 font-semibold">
      {srfPaymentStatus(status)}
    </AdminBadge>
  );

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      if (!q) return matchStatus;
      const matchQuery =
        r.studentName.toLowerCase().includes(q) ||
        r.className.toLowerCase().includes(q) ||
        srfPaymentStatus(r.status).toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [rows, query, statusFilter, srfPaymentStatus]);

  return (
    <div className="box-border flex w-full min-w-0 flex-col admin-module-panel text-start font-inter shadow-sm">
      <AdminModuleHeader
        layout="toolbar"
        title={t('admin.modules.srf.title')}
        subtitle={t('admin.modules.srf.subtitle')}
        actions={
          <AdminListToolbar
            controlsLayout="grouped"
            searchValue={query}
            onSearchChange={onQueryChange}
            searchPlaceholder={searchPh}
            toolbarAriaLabel={filterLabel('filterSrfToolbar')}
            filter1={{
              value: statusFilter,
              onChange: setStatusFilter,
              options: statusFilterOptions,
              ariaLabel: filterLabel('filterByPaymentStatus'),
            }}
          />
        }
      />

      <div className="space-y-3 px-4 pb-6 pt-3 sm:px-6 lg:hidden">
        {filteredRows.length === 0 ? (
          <AdminEmptyState title={emptyState('srfStudentsFilters')} />
        ) : (
          filteredRows.map((row) => (
            <AdminMobileRowCard
              key={row.id}
              title={row.studentName}
              badges={<StatusBadge status={row.status} />}
              fields={[
                { label: tableColumn('class'), value: row.className },
                { label: tableColumn('amountDue'), value: <span className="tabular-nums">{mad(row.amountDue)}</span> },
                { label: tableColumn('amountPaid'), value: <span className="tabular-nums">{mad(row.amountPaid)}</span> },
              ]}
              actions={
                <>
                  <button type="button" className={adminTableBtnMobile}>
                    <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                    {t('admin.common.actions.viewDetails')}
                  </button>
                  {row.status === 'Pending Validation' && (
                    <button type="button" className={adminTableBtnMobilePrimary}>
                      <CircleCheck className="h-4 w-4 shrink-0" strokeWidth={2} />
                      {t('admin.common.actions.validate')}
                    </button>
                  )}
                </>
              }
            />
          ))
        )}
      </div>

      <div className="admin-module-table-wrap hidden px-4 pb-6 lg:block lg:px-6">
        <AdminTableScroll minWidth="880px" className="admin-table-scroll--panel">
          <thead>
            <tr>
              <th>{tableColumn('studentName')}</th>
              <th>{tableColumn('class')}</th>
              <th>{tableColumn('amountDue')}</th>
              <th>{tableColumn('amountPaid')}</th>
              <th>{tableColumn('status')}</th>
              <th className="text-end">{tableColumn('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <AdminTableEmptyState colSpan={6} title={emptyState('srfStudentsFilters')} />
            ) : (
              filteredRows.map((row) => (
                <tr key={row.id}>
                  <td className="font-medium text-[var(--admin-text)]">{row.studentName}</td>
                  <td>{row.className}</td>
                  <td className="tabular-nums">{mad(row.amountDue)}</td>
                  <td className="tabular-nums">{mad(row.amountPaid)}</td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="text-end">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button type="button" className={adminTableBtn}>
                        <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                        {t('admin.common.actions.viewDetails')}
                      </button>
                      {row.status === 'Pending Validation' && (
                        <button
                          type="button"
                          className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg admin-btn-primary px-3 py-2 font-inter text-sm font-medium leading-5 text-white transition-opacity hover:opacity-90"
                        >
                          <CircleCheck className="h-4 w-4 shrink-0" strokeWidth={2} />
                          {t('admin.common.actions.validate')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTableScroll>
      </div>
    </div>
  );
};

export default StudentFinancialStatusTable;
