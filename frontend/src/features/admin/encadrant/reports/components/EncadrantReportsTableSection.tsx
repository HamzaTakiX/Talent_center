import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminCopy, useAdminSearchPlaceholder } from '../../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../../i18n/useAdminTableValues';
import AdminRowActions from '../../../ui/AdminRowActions';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminSupervisionReportsApi } from '../../../api/supervisionReports';
import type { EncadrantReportRow, EncadrantReportStatus } from '../data/encadrantReportsMock';
import AdminMobileRowCard from '../../../shared/AdminMobileRowCard';
import {
  AdminListToolbar,
  AdminMobileTableSkeleton,
  AdminModuleHeader,
  AdminSearchEmptyState,
  AdminTableEmptyState,
  AdminTableSkeletonRows,
} from '../../../ui';
import { reportStatusTableBadge } from '../../../ui/adminStatusBadges';
import EncadrantReportDetailModal from './EncadrantReportDetailModal';

const StatusIcon: FunctionComponent<{ status: EncadrantReportStatus }> = ({ status }) => {
  const cls = 'h-3 w-3 shrink-0';
  switch (status) {
    case 'Submitted':
      return <Clock className={cls} strokeWidth={2} aria-hidden />;
    case 'Pending':
      return <AlertCircle className={cls} strokeWidth={2} aria-hidden />;
    case 'Approved':
      return <CheckCircle className={cls} strokeWidth={2} aria-hidden />;
    case 'Overdue':
      return <AlertTriangle className={cls} strokeWidth={2} aria-hidden />;
    default:
      return null;
  }
};

interface EncadrantReportsTableSectionProps {
  rows?: EncadrantReportRow[];
  loading?: boolean;
  pageTitle?: string;
  pageSubtitle?: string;
  emptyTitleKey?: string;
  emptyDescKey?: string;
  showPriority?: boolean;
  onActionComplete?: () => void;
}

const EncadrantReportsTableSection: FunctionComponent<EncadrantReportsTableSectionProps> = ({
  rows: rowsProp = [],
  loading = false,
  pageTitle,
  pageSubtitle,
  emptyTitleKey,
  emptyDescKey,
  showPriority = false,
  onActionComplete,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { tableColumn, emptyState } = useAdminCopy();
  const { reportStatus } = useAdminTableValues();
  const searchPh = useAdminSearchPlaceholder('reports');

  const [rows, setRows] = useState(rowsProp);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EncadrantReportStatus>('all');
  const [reportTypeFilter, setReportTypeFilter] = useState('all');
  const [viewRow, setViewRow] = useState<EncadrantReportRow | null>(null);

  useEffect(() => {
    setRows(rowsProp);
    setStatusFilter('all');
    setReportTypeFilter('all');
    setQuery('');
  }, [rowsProp]);

  const reportTypeOptions = useMemo(() => {
    const types = [...new Set(rowsProp.map((r) => r.reportType))].sort();
    return [
      {
        value: 'all',
        label: t('admin.tables.filter.allTypes'),
      },
      ...types.map((type) => ({ value: type, label: type })),
    ];
  }, [rowsProp, t]);

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: t('admin.tables.filter.allStatuses') },
      { value: 'Submitted', label: reportStatus('Submitted') },
      { value: 'Pending', label: reportStatus('Pending') },
      { value: 'Approved', label: reportStatus('Approved') },
      { value: 'Overdue', label: reportStatus('Overdue') },
    ],
    [reportStatus, t],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchType = reportTypeFilter === 'all' || r.reportType === reportTypeFilter;
      if (!matchStatus || !matchType) return false;
      if (!q) return true;
      return (
        r.encadrant.toLowerCase().includes(q) ||
        r.student.toLowerCase().includes(q) ||
        r.reportType.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
      );
    });
  }, [rows, query, statusFilter, reportTypeFilter]);

  const handleApprove = (id: string) => {
    void adminSupervisionReportsApi.approve(id).then(() => {
      onActionComplete?.();
    });
  };

  const openDetail = (id: string) => {
    navigate(`/admin/encadrant/reports/${id}`);
  };

  return (
    <>
      <EncadrantReportDetailModal
        open={viewRow != null}
        report={viewRow}
        onClose={() => setViewRow(null)}
      />

      <div className="box-border flex w-full min-h-[555px] min-w-0 flex-col admin-module-panel text-left text-base text-[var(--admin-text)] font-inter shadow-sm">
        <AdminModuleHeader
          layout="toolbar"
          title={pageTitle ?? t('admin.modules.reports.title')}
          subtitle={pageSubtitle ?? t('admin.modules.reports.subtitle')}
          actions={
            <AdminListToolbar
              searchValue={query}
              onSearchChange={setQuery}
              searchPlaceholder={searchPh}
              toolbarAriaLabel={t('admin.tables.reports.filterByStatus', {
                defaultValue: 'Filtrer par statut',
              })}
              filter1={{
                value: statusFilter,
                onChange: (value) => setStatusFilter(value as 'all' | EncadrantReportStatus),
                options: statusOptions,
                ariaLabel: t('admin.tables.reports.filterByStatus', {
                  defaultValue: 'Filtrer par statut',
                }),
              }}
              filter2={{
                value: reportTypeFilter,
                onChange: setReportTypeFilter,
                options: reportTypeOptions,
                ariaLabel: t('admin.tables.reports.filterByType', {
                  defaultValue: 'Filtrer par type',
                }),
              }}
            />
          }
        />

        <div className="box-border flex w-full min-w-0 flex-1 flex-col px-4 pb-6 pt-0 text-num-14 sm:px-6">
          <div className="space-y-3 lg:hidden">
            {loading ? (
              <AdminMobileTableSkeleton count={4} />
            ) : filtered.length === 0 ? (
              <AdminSearchEmptyState
                titleKey={emptyTitleKey}
                descriptionKey={emptyDescKey}
                title={emptyTitleKey ? undefined : emptyState('reportsSearch')}
              />
            ) : (
              filtered.map((row) => (
                <AdminMobileRowCard
                  key={row.id}
                  title={`${row.reportType}`}
                  meta={`${row.encadrant} → ${row.student}`}
                  badges={
                    <span
                      className={`${reportStatusTableBadge(row.status)} inline-flex items-center gap-1.5`}
                    >
                      <StatusIcon status={row.status} />
                      {reportStatus(row.status)}
                    </span>
                  }
                  fields={[
                    { label: tableColumn('submitted'), value: row.submittedDate },
                    {
                      label: tableColumn('dueDate'),
                      value: (
                        <span className={row.status === 'Overdue' ? 'font-medium text-[#e7000b]' : ''}>
                          {row.dueDate}
                        </span>
                      ),
                    },
                  ]}
                  actions={
                    <AdminRowActions
                      variant="mobile"
                      onView={() => openDetail(row.id)}
                      onApprove={row.status === 'Submitted' ? () => handleApprove(row.id) : undefined}
                    />
                  }
                />
              ))
            )}
          </div>

          <div className="relative hidden min-h-[280px] w-full min-w-0 overflow-x-auto lg:block">
            <table className="admin-table w-full min-w-[1100px] border-collapse font-inter">
              <thead>
                <tr className="h-10 border-b border-solid border-[var(--admin-border)]">
                  <th className="box-border py-2 pl-2 pr-2 text-start text-sm font-semibold text-[var(--admin-text-muted)]">
                    {tableColumn('encadrant')}
                  </th>
                  <th className="box-border py-2 pl-2 pr-2 text-start text-sm font-semibold text-[var(--admin-text-muted)]">
                    {tableColumn('student')}
                  </th>
                  {showPriority ? (
                    <th className="box-border py-2 pl-2 pr-2 text-start text-sm font-semibold text-[var(--admin-text-muted)]">
                      {t('admin.tables.reports.priority', { defaultValue: 'Priorité' })}
                    </th>
                  ) : null}
                  <th className="box-border py-2 pl-2 pr-2 text-start text-sm font-semibold text-[var(--admin-text-muted)]">
                    {tableColumn('reportType')}
                  </th>
                  <th className="box-border py-2 pl-2 pr-2 text-start text-sm font-semibold text-[var(--admin-text-muted)]">
                    {tableColumn('status')}
                  </th>
                  <th className="box-border py-2 pl-2 pr-2 text-start text-sm font-semibold text-[var(--admin-text-muted)]">
                    {tableColumn('submittedDate')}
                  </th>
                  <th className="box-border py-2 pl-2 pr-2 text-start text-sm font-semibold text-[var(--admin-text-muted)]">
                    {tableColumn('dueDate')}
                  </th>
                  <th className="box-border py-2 pl-2 pr-2 text-end text-sm font-semibold text-[var(--admin-text-muted)]">
                    {tableColumn('actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <AdminTableSkeletonRows colSpan={showPriority ? 8 : 7} rows={6} />
                ) : filtered.length === 0 ? (
                  <AdminTableEmptyState
                    colSpan={showPriority ? 8 : 7}
                    titleKey={emptyTitleKey}
                    descriptionKey={emptyDescKey}
                    title={emptyTitleKey ? undefined : emptyState('reportsSearch')}
                  />
                ) : (
                  filtered.map((row) => (
                    <tr
                      key={row.id}
                      className="h-[49px] border-b border-solid border-[var(--admin-border)] last:border-b-0"
                    >
                      <td className="box-border max-w-[172px] py-[13.5px] pl-2 pr-2 align-middle text-num-14 font-medium leading-5 text-[var(--admin-text)]">
                        {row.encadrant}
                      </td>
                      <td className="box-border py-[13.5px] pl-2 pr-2 align-middle text-num-14 leading-5 text-[var(--admin-text)]">
                        {row.student}
                      </td>
                      {showPriority ? (
                        <td className="box-border py-[13.5px] pl-2 pr-2 align-middle text-num-14 font-semibold tabular-nums text-[var(--admin-brand)]">
                          {row.priorityScore ?? '—'}
                        </td>
                      ) : null}
                      <td className="box-border py-[13.5px] pl-2 pr-2 align-middle text-num-14 leading-5 text-[var(--admin-text)]">
                        {row.reportType}
                      </td>
                      <td className="box-border py-[13.5px] pl-2 pr-2 align-middle">
                        <span
                          className={`${reportStatusTableBadge(row.status)} inline-flex items-center gap-1.5`}
                        >
                          <StatusIcon status={row.status} />
                          {reportStatus(row.status)}
                        </span>
                      </td>
                      <td className="box-border py-[13.5px] pl-2 pr-2 align-middle text-num-14 leading-5 text-[var(--admin-text)]">
                        {row.submittedDate}
                      </td>
                      <td
                        className={`box-border py-[13.5px] pl-2 pr-2 align-middle text-num-14 leading-5 ${
                          row.status === 'Overdue' ? 'font-medium text-[#e7000b]' : 'text-[var(--admin-text)]'
                        }`}
                      >
                        {row.dueDate}
                      </td>
                      <td className="box-border py-2 pl-2 pr-2 text-end align-middle">
                        <AdminRowActions
                          onView={() => openDetail(row.id)}
                          onApprove={row.status === 'Submitted' ? () => handleApprove(row.id) : undefined}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default EncadrantReportsTableSection;
