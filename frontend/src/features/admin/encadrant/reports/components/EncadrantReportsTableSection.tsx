import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminCopy, useAdminSearchPlaceholder } from '../../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../../i18n/useAdminTableValues';
import AdminRowActions from '../../../ui/AdminRowActions';
import AdminSelectField from '../../../ui/AdminSelectField';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  Search,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminSupervisionReportsApi } from '../../../api/supervisionReports';
import type { EncadrantReportRow, EncadrantReportStatus } from '../data/encadrantReportsMock';
import AdminMobileRowCard from '../../../shared/AdminMobileRowCard';
import {
  AdminMobileTableSkeleton,
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
  const { tableColumn, emptyState, filterLabel } = useAdminCopy();
  const { reportStatus } = useAdminTableValues();
  const searchPh = useAdminSearchPlaceholder('reports');

  const [rows, setRows] = useState(rowsProp);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EncadrantReportStatus>('all');
  const [reportTypeFilter, setReportTypeFilter] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
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

  const hasActiveFilters = statusFilter !== 'all' || reportTypeFilter !== 'all';

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

  const clearFilters = () => {
    setStatusFilter('all');
    setReportTypeFilter('all');
  };

  return (
    <>
      <EncadrantReportDetailModal
        open={viewRow != null}
        report={viewRow}
        onClose={() => setViewRow(null)}
      />

      <div className="box-border flex w-full min-h-[555px] min-w-0 flex-col admin-module-panel text-left text-base text-[var(--admin-text)] font-inter shadow-sm">
        <div className="box-border flex w-full shrink-0 flex-col gap-4 px-4 pb-1.5 pt-6 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:gap-5">
          <div className="flex min-h-0 min-w-0 flex-col items-start lg:max-w-[420px]">
            <div className="relative flex min-h-[20px] w-full shrink-0 items-center gap-2">
              <FileText className="relative h-5 w-5 shrink-0 text-[var(--admin-text)]" strokeWidth={1.75} aria-hidden />
              <span className="relative font-inter text-base font-medium leading-5 text-[var(--admin-text)]">
                {pageTitle ?? t('admin.modules.reports.title')}
              </span>
            </div>
            <div className="relative mt-1 w-full shrink-0 text-sm leading-6 text-[var(--admin-text-secondary)]">
              {pageSubtitle ?? t('admin.modules.reports.subtitle')}
            </div>
          </div>
          <div className="flex w-full min-w-0 shrink-0 flex-col gap-2 lg:w-auto lg:max-w-none">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <div className="relative h-9 min-w-0 flex-1 sm:max-w-[256px]">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-secondary)]"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPh}
                  className="box-border h-9 w-full rounded-num-8 border-0 admin-field border border-[var(--admin-border)] bg-[var(--admin-input-bg)] py-1 pl-9 pr-3 font-inter text-num-14 leading-5 text-[var(--admin-text)] placeholder:text-[var(--admin-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-brand-muted)]"
                />
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen((o) => !o)}
                className={`box-border flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-num-8 border px-3 py-0 font-inter text-num-14 transition-colors ${
                  filtersOpen || hasActiveFilters
                    ? 'border-[var(--admin-brand)] bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]'
                    : 'border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] text-[var(--admin-text)] hover:bg-[var(--admin-row-hover)]'
                }`}
                aria-expanded={filtersOpen}
                aria-label={filterLabel('filterReports')}
              >
                <Filter className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                <span className="hidden sm:inline">{t('admin.common.actions.filter', { defaultValue: 'Filtrer' })}</span>
                {hasActiveFilters ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--admin-brand)] px-1 text-[10px] font-semibold text-white">
                    !
                  </span>
                ) : null}
              </button>
            </div>
            {filtersOpen ? (
              <div className="flex flex-col gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-3 sm:flex-row sm:items-end">
                <AdminSelectField
                  aria-label={t('admin.tables.reports.filterByStatus', {
                    defaultValue: 'Filtrer par statut',
                  })}
                  value={statusFilter}
                  onChange={(v) => setStatusFilter(v as 'all' | EncadrantReportStatus)}
                  options={statusOptions}
                  wrapperClassName="min-w-0 flex-1"
                />
                <AdminSelectField
                  aria-label={t('admin.tables.reports.filterByType', {
                    defaultValue: 'Filtrer par type',
                  })}
                  value={reportTypeFilter}
                  onChange={setReportTypeFilter}
                  options={reportTypeOptions}
                  wrapperClassName="min-w-0 flex-1"
                />
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-lg border border-[var(--admin-border)] px-3 text-sm text-[var(--admin-text-secondary)] hover:bg-[var(--admin-row-hover)]"
                  >
                    <X className="h-4 w-4" aria-hidden />
                    {t('admin.historyUi.timeline.clearFilters')}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

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
