import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, MessageSquare } from 'lucide-react';
import SrfValidateButton from './student-detail/SrfValidateButton';
import { srfRoutes } from '../../api/srf';
import { useAdminCopy, useAdminSearchPlaceholder } from '../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import type {
  StudentFinancialRowStatus,
  StudentFinancialTableRow,
} from '../../api/srf';
import AdminMobileRowCard from '../../shared/AdminMobileRowCard';
import { useAdminPagination } from '../../shared/hooks/useAdminPagination';
import { AdminListToolbar, AdminPagination } from '../../ui';
import { AdminMobileTableSkeleton, AdminTableSkeletonRows } from '../../ui/AdminTableSkeleton';
import { SrfEmptyState, SrfSearchEmptyState, SrfTableEmptyState } from './SrfModuleStates';
import SrfSectionHeader from './SrfSectionHeader';
import SrfToolbarSkeleton from './SrfToolbarSkeleton';
import { SafeText, ADMIN_TABLE_COL } from '../../../../design-system/safeContent';
import { adminTableBtn, adminTableBtnMobile } from '../../ui/adminTableButtons';
import { easePremium } from '../../dashboard/ui/animations';

const STATUS_BADGE_CLASS: Record<StudentFinancialRowStatus, string> = {
  Paid: 'admin-srf-status-badge admin-srf-status-badge--paid',
  Unpaid: 'admin-srf-status-badge admin-srf-status-badge--unpaid',
  'Partially Paid': 'admin-srf-status-badge admin-srf-status-badge--partial',
  'Pending Validation': 'admin-srf-status-badge admin-srf-status-badge--pending',
  Late: 'admin-srf-status-badge admin-srf-status-badge--late',
};

const mad = (n: number) => `${n.toLocaleString()} MAD`;

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
    [filterLabel, srfPaymentStatus],
  );

  const StatusBadge: FunctionComponent<{ status: StudentFinancialRowStatus }> = ({ status }) => (
    <span className={STATUS_BADGE_CLASS[status]}>{srfPaymentStatus(status)}</span>
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

  const toolbar = loading ? (
    <SrfToolbarSkeleton />
  ) : (
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
  );

  const handleOpenChat = (accountId: string) => {
    navigate(srfRoutes.chat({ account: accountId, opening: true }));
  };

  return (
    <section className="admin-srf-table-section" data-admin-search-id="srf-table">
      <SrfSectionHeader
        title={t('admin.modules.srf.title')}
        subtitle={t('admin.modules.srf.subtitle')}
        liveCount={loading ? undefined : rows.length}
        loading={loading}
        actions={toolbar}
      />

      <div className="admin-srf-table-section__body">
        <div className="admin-srf-table-section__mobile lg:hidden">
          {loading ? (
            <AdminMobileTableSkeleton count={6} />
          ) : isEmpty ? (
            <SrfEmptyState titleKey={emptyTitleKey} descriptionKey={emptyDescriptionKey} />
          ) : isSearchEmpty ? (
            <SrfSearchEmptyState variant="panel" titleKey={searchEmptyTitleKey} />
          ) : (
            <motion.div
              className="space-y-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.04, ease: easePremium } },
              }}
            >
              {paginatedItems.map((row, index) => (
                <motion.div
                  key={row.id}
                  variants={{
                    hidden: { opacity: 0, y: 6 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: easePremium } },
                  }}
                >
                  <AdminMobileRowCard
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
                    ]}
                    actions={
                      <>
                        <button
                          type="button"
                          className={adminTableBtnMobile}
                          onClick={() => handleOpenChat(row.id)}
                        >
                          <MessageSquare className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                          {t('admin.common.detailModal.student.sendMessage')}
                        </button>
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
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        <div className="admin-srf-table-section__desktop hidden lg:block">
          <div className="admin-module-table-wrap">
            <div className="admin-table-scroll admin-table-scroll--panel admin-srf-table-scroll">
              <table className="admin-table admin-table--safe" style={{ minWidth: '880px' }}>
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
                    <AdminTableSkeletonRows colSpan={6} rows={7} />
                  ) : isEmpty ? (
                    <SrfTableEmptyState
                      colSpan={6}
                      titleKey={emptyTitleKey}
                      descriptionKey={emptyDescriptionKey}
                    />
                  ) : isSearchEmpty ? (
                    <SrfSearchEmptyState colSpan={6} titleKey={searchEmptyTitleKey} />
                  ) : (
                    paginatedItems.map((row, index) => (
                      <motion.tr
                        key={row.id}
                        className="admin-srf-data-row"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.03, ease: easePremium }}
                      >
                        <td className="font-medium text-[var(--admin-text)]">
                          <SafeText>{row.studentName}</SafeText>
                        </td>
                        <td>
                          <SafeText>{row.className}</SafeText>
                        </td>
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
                              onClick={() => handleOpenChat(row.id)}
                            >
                              <MessageSquare className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                              {t('admin.common.detailModal.student.sendMessage')}
                            </button>
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
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
      </div>
    </section>
  );
};

export default StudentFinancialStatusTable;
