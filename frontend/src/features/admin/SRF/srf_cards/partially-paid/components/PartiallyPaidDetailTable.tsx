import { useAdminSearchPlaceholder } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo, useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { AdminSelectField, AdminSearchEmptyState, AdminTableEmptyState } from '../../../../ui';
import type { PartiallyPaidStudentRow } from '../data/partiallyPaidDetailMock';
import { partiallyPaidDetailRows } from '../data/partiallyPaidDetailMock';
import AdminMobileRowCard from '../../../../shared/AdminMobileRowCard';

import { adminTableBtn, adminTableBtnMobile } from '../../../../ui/adminTableButtons';
import { srfPaymentTableBadge } from '../../../../ui/adminStatusBadges';

const mad = (n: number) => `${n} MAD`;

const borderRow = 'border-b border-solid border-[var(--admin-border)]';


const remainingClass =
  'h-[49px] px-2 align-middle text-sm font-bold leading-5 tabular-nums text-[#D93025] md:px-4';

const PartiallyPaidDetailTable: FunctionComponent = () => {
  const searchPh = useAdminSearchPlaceholder('students');
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');

  const classOptions = useMemo(() => {
    const uniq = [...new Set(partiallyPaidDetailRows.map((r) => r.className))].sort();
    return uniq;
  }, []);

  const classSelectOptions = useMemo(
    () => [
      { value: 'all', label: 'All classes' },
      ...classOptions.map((c) => ({ value: c, label: c })),
    ],
    [classOptions]
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return partiallyPaidDetailRows.filter((r) => {
      if (classFilter !== 'all' && r.className !== classFilter) return false;
      if (!q) return true;
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.className.toLowerCase().includes(q)
      );
    });
  }, [query, classFilter]);

  const headings = [
    'Student Name',
    'Class',
    'Amount Due',
    'Amount Paid',
    'Remaining',
    'Status',
    'Actions',
  ] as const;

  const statusBadge = <span className={srfPaymentTableBadge('Partially Paid')}>Partially Paid</span>;

  return (
    <div className="flex w-full flex-col overflow-hidden admin-module-panel font-inter">
      <div className="box-border flex w-full flex-col gap-6 px-4 pb-6 pt-6 text-left font-inter text-num-14 text-[var(--admin-text-secondary)] sm:px-6">
        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
          <div className="relative min-h-0 min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-[12px] top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-secondary)]"
              strokeWidth={1.75}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPh}
              className="box-border h-9 w-full rounded-lg border-0 admin-field border border-[var(--admin-border)] bg-[var(--admin-input-bg)] py-1 pl-9 pr-3 font-inter text-sm font-normal leading-5 text-[var(--admin-text)] placeholder:text-[var(--admin-text-secondary)] outline-none focus:ring-2 focus:ring-[var(--admin-brand-muted)] focus:ring-offset-0"
            />
          </div>
          <AdminSelectField
            aria-label="Filter by class"
            value={classFilter}
            onChange={setClassFilter}
            options={classSelectOptions}
            wrapperClassName="h-9 w-full shrink-0 lg:w-[180px]"
          />
        </div>

        <div className="space-y-3 lg:hidden">
          {rows.length === 0 ? (
            <AdminSearchEmptyState title="No students match your search." />
          ) : (
          rows.map((row: PartiallyPaidStudentRow) => (
            <AdminMobileRowCard
              key={row.id}
              title={row.studentName}
              badges={statusBadge}
              fields={[
                { label: 'Class', value: row.className },
                { label: 'Amount due', value: <span className="tabular-nums">{mad(row.amountDue)}</span> },
                { label: 'Amount paid', value: <span className="tabular-nums">{mad(row.amountPaid)}</span> },
                {
                  label: 'Remaining',
                  value: (
                    <span className="tabular-nums font-bold text-[#D93025]">{mad(row.remaining)}</span>
                  )
                }
              ]}
              actions={
                <button type="button" className={adminTableBtnMobile}>
                  <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  View Details
                </button>
              }
            />
          ))
          )}
        </div>

        <div className="hidden w-full min-w-0 overflow-x-auto lg:block">
          <table className="w-full min-w-[860px] border-collapse text-[var(--admin-text)]">
            <thead>
              <tr className={`h-10 ${borderRow}`}>
                {headings.map((h) => (
                  <th
                    key={h}
                    className={`align-middle px-2 py-2 pb-2 font-inter text-sm font-medium leading-5 text-[var(--admin-text-secondary)] first:pl-0 last:pr-2 ${
                      h === 'Actions' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <AdminTableEmptyState colSpan={7} title="No students match your search." />
              ) : (
              rows.map((row: PartiallyPaidStudentRow) => (
                <tr key={row.id} className={borderRow}>
                  <td className="h-[49px] align-middle pl-0 pr-4 text-sm font-bold leading-5">
                    {row.studentName}
                  </td>
                  <td className="h-[49px] px-2 align-middle text-sm font-normal leading-5 md:px-4">
                    {row.className}
                  </td>
                  <td className="h-[49px] px-2 align-middle text-sm font-normal leading-5 tabular-nums md:px-4">
                    {mad(row.amountDue)}
                  </td>
                  <td className="h-[49px] px-2 align-middle text-sm font-normal leading-5 tabular-nums md:px-4">
                    {mad(row.amountPaid)}
                  </td>
                  <td className={remainingClass}>{mad(row.remaining)}</td>
                  <td className="h-[49px] px-2 align-middle md:px-4">{statusBadge}</td>
                  <td className="h-[49px] pl-2 pr-0 align-middle text-right md:pl-4">
                    <div className="flex justify-end">
                      <button type="button" className={adminTableBtn}>
                        <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                        View Details
                      </button>
                    </div>
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

export default PartiallyPaidDetailTable;

