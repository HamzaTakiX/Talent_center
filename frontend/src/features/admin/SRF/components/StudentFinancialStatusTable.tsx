import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import SrfValidateButton from './student-detail/SrfValidateButton';
import { srfRoutes } from '../../api/srf';
import { useAdminCopy, useAdminSearchPlaceholder } from '../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import type {
  StudentFinancialRowStatus,
  StudentFinancialTableRow,
} from '../../api/srf';
import AdminMobileRowCard from '../../shared/AdminMobileRowCard';
import AdminBadge, { type AdminBadgeVariant } from '../../ui/AdminBadge';
import { useAdminPagination } from '../../shared/hooks/useAdminPagination';
import {
  AdminListToolbar,
  AdminModuleHeader,
  AdminPagination,
  AdminSearchEmptyState,
  AdminTableEmptyState,
  AdminTableScroll,
} from '../../ui';
import { AdminMobileTableSkeleton, AdminTableSkeletonRows } from '../../ui/AdminTableSkeleton';
import { SrfEmptyState } from './SrfModuleStates';
import { SafeText, ADMIN_TABLE_COL } from '../../../../design-system/safeContent';
import { adminTableBtn, adminTableBtnMobile } from '../../ui/adminTableButtons';

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
  loading?: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  emptyTitleKey?: string;
  emptyDescriptionKey?: string;
  searchEmptyTitleKey?: string;
}

const StudentFinancialStatusTable: FunctionComponent<StudentFinancialStatusTableProps> = ({
  rows,
  loading = false,
  query,
  onQueryChange,
  emptyTitleKey = 'admin.empty.srfNoAccounts',
  emptyDescriptionKey = 'admin.empty.srfNoAccountsDesc',
  searchEmptyTitleKey = 'admin.empty.srfSearchFilters',
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tableColumn, filterLabel } = useAdminCopy();
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

  const {
    page,
    setPage,
    paginatedItems,
    totalItems,
    totalPages,
    pageSize,
    resetPage,
  } = useAdminPagination(filteredRows);

  useEffect(() => {
    resetPage();
  }, [query, statusFilter, resetPage]);

  const isEmpty = !loading && rows.length === 0;
  const isSearchEmpty = !loading && rows.length > 0 && filteredRows.length === 0;
  const showPagination = !loading && !isEmpty && !isSearchEmpty;

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
        {loading ? (
          <AdminMobileTableSkeleton count={4} />
        ) : isEmpty ? (
          <SrfEmptyState titleKey={emptyTitleKey} descriptionKey={emptyDescriptionKey} />
        ) : isSearchEmpty ? (
          <AdminSearchEmptyState
            variant="panel"
            titleKey={searchEmptyTitleKey}
            descriptionKey="admin.empty.tryAdjusting"
          />
        ) : (
          paginatedItems.map((row) => (
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
                  <button
                    type="button"
                    className={adminTableBtnMobile}
                    onClick={() => navigate(srfRoutes.student(row.id))}
                  >
                    <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                    {t('admin.common.actions.viewDetails')}
                  </button>
                  {row.status === 'Pending Validation' ? (
                    <SrfValidateButton pendingProofId={row.pendingProofId} size="sm" />
                  ) : null}
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
              <th className={ADMIN_TABLE_COL.name}>{tableColumn('studentName')}</th>
              <th className={ADMIN_TABLE_COL.text}>{tableColumn('class')}</th>
              <th className={ADMIN_TABLE_COL.text}>{tableColumn('amountDue')}</th>
              <th className={ADMIN_TABLE_COL.text}>{tableColumn('amountPaid')}</th>
              <th className={ADMIN_TABLE_COL.status}>{tableColumn('status')}</th>
              <th className={`text-end ${ADMIN_TABLE_COL.actions}`}>{tableColumn('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <AdminTableSkeletonRows colSpan={6} rows={8} />
            ) : isEmpty ? (
              <tr>
                <td colSpan={6} className="admin-table-empty-cell p-0">
                  <SrfEmptyState titleKey={emptyTitleKey} descriptionKey={emptyDescriptionKey} />
                </td>
              </tr>
            ) : isSearchEmpty ? (
              <AdminTableEmptyState
                colSpan={6}
                titleKey={searchEmptyTitleKey}
                descriptionKey="admin.empty.tryAdjusting"
              />
            ) : (
              paginatedItems.map((row) => (
                <tr key={row.id}>
                  <td className="font-medium text-[var(--admin-text)]"><SafeText>{row.studentName}</SafeText></td>
                  <td><SafeText>{row.className}</SafeText></td>
                  <td className="tabular-nums">{mad(row.amountDue)}</td>
                  <td className="tabular-nums">{mad(row.amountPaid)}</td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="text-end">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        className={adminTableBtn}
                        onClick={() => navigate(srfRoutes.student(row.id))}
                      >
                        <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                        {t('admin.common.actions.viewDetails')}
                      </button>
                      {row.status === 'Pending Validation' ? (
                        <SrfValidateButton pendingProofId={row.pendingProofId} size="sm" />
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTableScroll>
      </div>

      {showPagination ? (
        <div className="px-4 pb-6 sm:px-6 lg:px-6">
          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
            itemLabel={t('admin.pagination.srfAccounts', { defaultValue: 'comptes' })}
          />
        </div>
      ) : null}
    </div>
  );
};

export default StudentFinancialStatusTable;

