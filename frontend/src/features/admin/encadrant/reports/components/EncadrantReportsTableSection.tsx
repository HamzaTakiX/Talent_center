import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminCopy, useAdminSearchPlaceholder } from '../../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../../i18n/useAdminTableValues';
import AdminRowActions from '../../../ui/AdminRowActions';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  Search
} from 'lucide-react';
import type { EncadrantReportRow, EncadrantReportStatus } from '../data/encadrantReportsMock';
import { encadrantReportsRows } from '../data/encadrantReportsMock';
import AdminMobileRowCard from '../../../shared/AdminMobileRowCard';
import { AdminSearchEmptyState, AdminTableEmptyState } from '../../../ui';

import { reportStatusTableBadge } from '../../../ui/adminStatusBadges';

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
}

const EncadrantReportsTableSection: FunctionComponent<EncadrantReportsTableSectionProps> = ({
  rows = encadrantReportsRows
}) => {
  const { t } = useTranslation();
  const { tableColumn, emptyState, filterLabel } = useAdminCopy();
  const { reportStatus } = useAdminTableValues();
  const searchPh = useAdminSearchPlaceholder('reports');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.encadrant.toLowerCase().includes(q) ||
        r.student.toLowerCase().includes(q) ||
        r.reportType.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
  }, [rows, query]);

  return (
    <div className="box-border flex w-full min-h-[555px] min-w-0 flex-col admin-module-panel text-left text-base text-[var(--admin-text)] font-inter shadow-sm">
      <div className="box-border flex w-full shrink-0 flex-col gap-4 px-4 pb-1.5 pt-6 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:gap-5">
        <div className="flex min-h-0 min-w-0 flex-col items-start lg:max-w-[420px]">
          <div className="relative flex min-h-[20px] w-full shrink-0 items-center gap-2">
            <FileText className="relative h-5 w-5 shrink-0 text-[var(--admin-text)]" strokeWidth={1.75} aria-hidden />
            <span className="relative font-inter text-base font-medium leading-5 text-[var(--admin-text)]">
              {t('admin.modules.reports.title')}
            </span>
          </div>
          <div className="relative mt-1 w-full shrink-0 text-sm leading-6 text-[var(--admin-text-secondary)]">
            {t('admin.modules.reports.subtitle')}
          </div>
        </div>
        <div className="flex w-full min-w-0 shrink-0 flex-col gap-2 lg:w-auto lg:max-w-none lg:flex-row lg:items-center lg:justify-end">
          <div className="relative h-9 min-w-0 flex-1 lg:max-w-[256px]">
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
            className="box-border flex h-9 w-9 shrink-0 items-center justify-center admin-btn-surface rounded-num-8 border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-[9px] py-0 text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-row-hover)]"
            aria-label={filterLabel('filterReports')}
          >
            <Filter className="relative h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      <div className="box-border flex w-full min-w-0 flex-1 flex-col px-4 pb-6 pt-0 text-num-14 sm:px-6">
        <div className="space-y-3 lg:hidden">
          {filtered.length === 0 ? (
            <AdminSearchEmptyState title={emptyState('reportsSearch')} />
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
                    <span className={row.status === 'Overdue' ? 'font-medium text-[#e7000b]' : ''}>{row.dueDate}</span>
                  )
                }
              ]}
              actions={
                <AdminRowActions
                  variant="mobile"
                  onView={() => {}}
                  onDownload={() => {}}
                  onApprove={row.status === 'Submitted' ? () => {} : undefined}
                />
              }
            />
            ))
          )}
        </div>

        <div className="relative hidden min-h-[280px] w-full min-w-0 overflow-x-auto lg:block">
          <table className="w-full min-w-[1100px] border-collapse font-inter">
            <thead>
              <tr className="h-10 border-b border-solid border-[var(--admin-border)]">
                <th className="box-border py-2 pl-2 pr-2 text-start text-sm font-semibold text-[var(--admin-text-muted)]">{tableColumn('encadrant')}</th>
                <th className="box-border py-2 pl-2 pr-2 text-start text-sm font-semibold text-[var(--admin-text-muted)]">{tableColumn('student')}</th>
                <th className="box-border py-2 pl-2 pr-2 text-start text-sm font-semibold text-[var(--admin-text-muted)]">{tableColumn('reportType')}</th>
                <th className="box-border py-2 pl-2 pr-2 text-start text-sm font-semibold text-[var(--admin-text-muted)]">{tableColumn('status')}</th>
                <th className="box-border py-2 pl-2 pr-2 text-start text-sm font-semibold text-[var(--admin-text-muted)]">{tableColumn('submittedDate')}</th>
                <th className="box-border py-2 pl-2 pr-2 text-start text-sm font-semibold text-[var(--admin-text-muted)]">{tableColumn('dueDate')}</th>
                <th className="box-border py-2 pl-2 pr-2 text-end text-sm font-semibold text-[var(--admin-text-muted)]">{tableColumn('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <AdminTableEmptyState colSpan={7} title={emptyState('reportsSearch')} />
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
                      onView={() => {}}
                      onDownload={() => {}}
                      onApprove={row.status === 'Submitted' ? () => {} : undefined}
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
  );
};

export default EncadrantReportsTableSection;
