import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { StudentFinancialRowStatus, StudentFinancialTableRow } from '../../api/srf';
import { srfRoutes } from '../../api/srf';
import { useAdminCopy, useAdminSearchPlaceholder } from '../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import { useAdminPagination } from '../../shared/hooks/useAdminPagination';
import AdminMobileRowCard from '../../shared/AdminMobileRowCard';
import AdminBadge, { type AdminBadgeVariant } from '../../ui/AdminBadge';
import {
  AdminPagination,
  AdminSelectField,
  AdminSearchEmptyState,
  AdminTableEmptyState,
  AdminTableScroll,
} from '../../ui';
import { AdminMobileTableSkeleton, AdminTableSkeletonRows } from '../../ui/AdminTableSkeleton';
import { adminTableBtn, adminTableBtnMobile } from '../../ui/adminTableButtons';
import { SrfEmptyState, SrfErrorState } from './SrfModuleStates';

const statusBadgeVariant: Record<StudentFinancialRowStatus, AdminBadgeVariant> = {
  Paid: 'success',
  Unpaid: 'danger',
  'Partially Paid': 'warning',
  'Pending Validation': 'info',
  Late: 'danger',
};

const mad = (n: number) => `${n.toLocaleString()} MAD`;

interface SrfSubpageTableProps {
  rows: StudentFinancialTableRow[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  emptyTitleKey: string;
  emptyDescriptionKey: string;
  showRemaining?: boolean;
}

const SrfSubpageTable: FunctionComponent<SrfSubpageTableProps> = ({
  rows,
  loading,
  error,
  onRetry,
  emptyTitleKey,
  emptyDescriptionKey,
  showRemaining = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tableColumn } = useAdminCopy();
  const { srfPaymentStatus } = useAdminTableValues();
  const searchPh = useAdminSearchPlaceholder('students');
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  const classOptions = useMemo(() => {
    const uniq = [...new Set(rows.map((r) => r.className).filter(Boolean))].sort();
    return uniq;
  }, [rows]);

  const classSelectOptions = useMemo(
    () => [
      { value: 'all', label: t('admin.filters.allClasses', { defaultValue: 'All classes' }) },
      ...classOptions.map((c) => ({ value: c, label: c })),
    ],
    [classOptions, t],
  );

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (classFilter !== 'all' && r.className !== classFilter) return false;
      if (!q) return true;
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.className.toLowerCase().includes(q) ||
        srfPaymentStatus(r.status).toLowerCase().includes(q)
      );
    });
  }, [rows, query, classFilter, srfPaymentStatus]);

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
  }, [query, classFilter, resetPage]);

  const colSpan = showRemaining ? 7 : 6;
  const isEmpty = !loading && !error && filteredRows.length === 0;
  const isSearchEmpty = rows.length > 0 && filteredRows.length === 0;
  const showPagination = !loading && !isEmpty && !isSearchEmpty;

  if (error) {
    return <SrfErrorState onRetry={onRetry} />;
  }

  const StatusBadge: FunctionComponent<{ status: StudentFinancialRowStatus }> = ({ status }) => (
    <AdminBadge variant={statusBadgeVariant[status]} className="rounded-full px-2.5 py-1 font-semibold">
      {srfPaymentStatus(status)}
    </AdminBadge>
  );

  return (
    <div className="flex w-full flex-col overflow-hidden admin-module-panel font-inter shadow-sm">
      <div className="box-border flex w-full flex-col gap-6 px-4 pb-6 pt-6 text-start sm:px-6">
        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
          <div className="relative min-h-0 min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-secondary)]"
              strokeWidth={1.75}
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPh}
              disabled={loading}
              className="box-border h-9 w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-input-bg)] py-1 ps-9 pe-3 font-inter text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-text-secondary)] outline-none focus:ring-2 focus:ring-[var(--admin-brand-muted)] disabled:opacity-60"
            />
          </div>
          <AdminSelectField
            aria-label={t('admin.filters.filterByClass', { defaultValue: 'Filter by class' })}
            value={classFilter}
            onChange={setClassFilter}
            options={classSelectOptions}
            wrapperClassName="h-9 w-full shrink-0 lg:w-[180px]"
            disabled={loading}
          />
        </div>

        {loading ? (
          <>
            <AdminMobileTableSkeleton count={4} />
            <div className="hidden lg:block admin-module-table-wrap">
              <AdminTableScroll minWidth="880px">
                <table className="w-full text-sm">
                  <tbody>
                    <AdminTableSkeletonRows colSpan={colSpan} rows={6} />
                  </tbody>
                </table>
              </AdminTableScroll>
            </div>
          </>
        ) : null}

        {!loading && isEmpty ? (
          <SrfEmptyState titleKey={emptyTitleKey} descriptionKey={emptyDescriptionKey} />
        ) : null}

        {!loading && !isEmpty ? (
          <>
            <div className="space-y-3 lg:hidden">
              {isSearchEmpty ? (
                <AdminSearchEmptyState
                  variant="panel"
                  titleKey="admin.empty.srfSearchFilters"
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
                      {
                        label: tableColumn('amountDue'),
                        value: <span className="tabular-nums">{mad(row.amountDue)}</span>,
                      },
                      {
                        label: tableColumn('amountPaid'),
                        value: <span className="tabular-nums">{mad(row.amountPaid)}</span>,
                      },
                      ...(showRemaining
                        ? [
                            {
                              label: t('admin.table.remaining', { defaultValue: 'Remaining' }),
                              value: (
                                <span className="tabular-nums font-semibold text-red-600">
                                  {mad(row.amountDue - row.amountPaid)}
                                </span>
                              ),
                            },
                          ]
                        : []),
                    ]}
                    actions={
                      <button
                        type="button"
                        className={adminTableBtnMobile}
                        onClick={() => navigate(srfRoutes.student(row.id))}
                      >
                        <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                        {t('admin.common.actions.viewDetails')}
                      </button>
                    }
                  />
                ))
              )}
            </div>

            <div className="hidden lg:block admin-module-table-wrap">
              <AdminTableScroll minWidth="880px">
                <table className="w-full text-sm text-start">
                  <thead>
                    <tr>
                      <th>{tableColumn('studentName')}</th>
                      <th>{tableColumn('class')}</th>
                      <th>{tableColumn('amountDue')}</th>
                      <th>{tableColumn('amountPaid')}</th>
                      {showRemaining ? (
                        <th>{t('admin.table.remaining', { defaultValue: 'Remaining' })}</th>
                      ) : null}
                      <th>{tableColumn('status')}</th>
                      <th className="text-end">{tableColumn('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isSearchEmpty ? (
                      <AdminTableEmptyState
                        colSpan={colSpan}
                        titleKey="admin.empty.srfSearchFilters"
                        descriptionKey="admin.empty.tryAdjusting"
                      />
                    ) : (
                      paginatedItems.map((row) => (
                        <tr key={row.id} className="border-b border-[var(--admin-border)]">
                          <td className="py-3 px-2 font-medium md:px-4">{row.studentName}</td>
                          <td className="py-3 px-2 md:px-4">{row.className}</td>
                          <td className="py-3 px-2 tabular-nums md:px-4">{mad(row.amountDue)}</td>
                          <td className="py-3 px-2 tabular-nums md:px-4">{mad(row.amountPaid)}</td>
                          {showRemaining ? (
                            <td className="py-3 px-2 tabular-nums font-semibold text-red-600 md:px-4">
                              {mad(row.amountDue - row.amountPaid)}
                            </td>
                          ) : null}
                          <td className="py-3 px-2 md:px-4">
                            <StatusBadge status={row.status} />
                          </td>
                          <td className="py-3 px-2 text-end md:px-4">
                            <button
                              type="button"
                              className={adminTableBtn}
                              onClick={() => navigate(srfRoutes.student(row.id))}
                            >
                              <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                              {t('admin.common.actions.viewDetails')}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </AdminTableScroll>
            </div>

            {showPagination ? (
              <AdminPagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setPage}
                itemLabel={t('admin.pagination.srfAccounts', { defaultValue: 'comptes' })}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default SrfSubpageTable;

