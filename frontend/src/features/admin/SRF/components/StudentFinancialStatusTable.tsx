import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CircleCheck, Wallet } from 'lucide-react';
import { srfRoutes } from '../../api/srf';
import { useAdminCopy, useAdminSearchPlaceholder } from '../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import type {
  StudentFinancialRowStatus,
  StudentFinancialTableRow,
} from '../../api/srf';
import { useAdminPagination } from '../../shared/hooks/useAdminPagination';
import {
  AdminListToolbar,
  AdminModuleHeader,
  AdminPagination,
  AdminTableEmptyState,
  AdminTableScroll,
  AdminTableSkeletonRows,
} from '../../ui';
import AdminRowActionsMenu from '../../ui/AdminRowActionsMenu';
import { srfPaymentTableBadge } from '../../ui/adminStatusBadges';
import { SafeText, ADMIN_TABLE_COL } from '../../../../design-system/safeContent';
import { invalidateSrfData } from '../utils/srfDataSync';
import SrfStudentIdentityCell from './SrfStudentIdentityCell';

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

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      if (!q) return matchStatus;
      const matchQuery =
        r.studentName.toLowerCase().includes(q) ||
        (r.studentEmail ?? '').toLowerCase().includes(q) ||
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

  const handleOpenChat = (accountId: string) => {
    navigate(srfRoutes.chat({ account: accountId, opening: true }));
  };

  const handleValidate = (pendingProofId?: number | null) => {
    if (!pendingProofId) return;
    invalidateSrfData();
    navigate(srfRoutes.validation(pendingProofId));
  };

  const emptyTitle = isSearchEmpty
    ? t(searchEmptyTitleKey)
    : t(emptyTitleKey);
  const emptyDescription = isSearchEmpty ? undefined : t(emptyDescriptionKey);

  return (
    <div
      className="box-border flex w-full min-w-0 flex-col admin-module-panel font-inter shadow-sm"
      data-admin-search-id="srf-table"
    >
      <AdminModuleHeader
        layout="toolbar"
        icon={Wallet}
        title={t('admin.modules.srf.title')}
        subtitle={
          loading || rows.length === 0
            ? t('admin.modules.srf.subtitle')
            : `${t('admin.modules.srf.subtitle')} · ${t('admin.modules.srf.dashboard.liveStatus', {
                count: rows.length,
              })}`
        }
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

      <div className="admin-module-table-wrap px-4 pb-6 lg:px-6">
        <AdminTableScroll minWidth="880px" className="admin-table-scroll--panel">
          <thead>
            <tr>
              <th className={ADMIN_TABLE_COL.name}>{tableColumn('studentName')}</th>
              <th className={ADMIN_TABLE_COL.text}>{tableColumn('class')}</th>
              <th className={ADMIN_TABLE_COL.text}>{tableColumn('amountDue')}</th>
              <th className={ADMIN_TABLE_COL.text}>{tableColumn('amountPaid')}</th>
              <th className={ADMIN_TABLE_COL.status}>{tableColumn('status')}</th>
              <th className={`text-end ${ADMIN_TABLE_COL.actionsMenu}`}>{tableColumn('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <AdminTableSkeletonRows colSpan={6} rows={7} />
            ) : isEmpty || isSearchEmpty ? (
              <AdminTableEmptyState
                colSpan={6}
                title={emptyTitle}
                description={emptyDescription}
              />
            ) : (
              paginatedItems.map((row) => (
                <tr
                  key={row.id}
                  className="admin-table-row--interactive"
                  onClick={() => navigate(srfRoutes.student(row.id))}
                >
                  <td>
                    <SrfStudentIdentityCell row={row} />
                  </td>
                  <td>
                    <SafeText>{row.className}</SafeText>
                  </td>
                  <td>
                    <span className="admin-srf-amount-badge admin-srf-amount-badge--due tabular-nums">
                      {mad(row.amountDue)}
                    </span>
                  </td>
                  <td>
                    <span className="admin-srf-amount-badge admin-srf-amount-badge--paid tabular-nums">
                      {mad(row.amountPaid)}
                    </span>
                  </td>
                  <td>
                    <span className={srfPaymentTableBadge(row.status as StudentFinancialRowStatus)}>
                      {srfPaymentStatus(row.status)}
                    </span>
                  </td>
                  <td
                    className="admin-students-table__actions text-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <AdminRowActionsMenu
                      ariaLabel={t('admin.modules.students.actions.menuAria', {
                        name: row.studentName,
                        defaultValue: `Actions pour ${row.studentName}`,
                      })}
                      onView={() => navigate(srfRoutes.student(row.id))}
                      onSendMessage={() => handleOpenChat(row.id)}
                      extraItems={
                        row.status === 'Pending Validation' && row.pendingProofId
                          ? [
                              {
                                key: 'validate',
                                label: t('admin.common.actions.validate'),
                                icon: CircleCheck,
                                onClick: () => handleValidate(row.pendingProofId),
                              },
                            ]
                          : []
                      }
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTableScroll>

        {!loading && !isEmpty && !isSearchEmpty ? (
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
    </div>
  );
};

export default StudentFinancialStatusTable;
