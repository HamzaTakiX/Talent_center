import { useAdminSearchPlaceholder } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo } from 'react';
import { Eye, Search } from 'lucide-react';
import { AdminSelectField, AdminTableEmptyState } from '../../../../ui';
import type { EngagementLevelTableRow } from '../data/engagementLevelTableRows';

import { engagementBandTableBadge } from '../../../../ui/adminStatusBadges';
import { adminTableBtn } from '../../../../ui/adminTableButtons';


interface EngagementLevelTableSectionProps {
  students: EngagementLevelTableRow[];
  query: string;
  onQueryChange: (v: string) => void;
  fieldFilter: string;
  onFieldFilterChange: (v: string) => void;
  fieldOptions: string[];
}

const EngagementLevelTableSection: FunctionComponent<EngagementLevelTableSectionProps> = ({
  students,
  query,
  onQueryChange,
  fieldFilter,
  onFieldFilterChange,
  fieldOptions
}) => {
  const searchPh = useAdminSearchPlaceholder('students');
  const fieldSelectOptions = useMemo(
    () => [
      { value: 'all', label: 'All fields' },
      ...fieldOptions.map((f) => ({ value: f, label: f })),
    ],
    [fieldOptions]
  );

  return (
  <div className="box-border flex w-full min-w-0 flex-col admin-module-panel font-inter shadow-sm">
    <div className="border-b border-[var(--admin-border)] px-6 pb-4 pt-6">
      <h2 className="text-base font-medium leading-5 text-[var(--admin-text)]">Students by Engagement Level</h2>
      <p className="mt-1 text-sm leading-6 text-[var(--admin-text-secondary)]">
        Sorted by activity and participation metrics.
      </p>
    </div>
    <div className="flex flex-col gap-3 border-b border-[var(--admin-border)] px-4 py-4 sm:px-6 sm:flex-row sm:items-center">
      <div className="relative min-h-0 min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-secondary)]"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={searchPh}
          className="box-border h-10 w-full rounded-lg border-0 admin-field border border-[var(--admin-border)] bg-[var(--admin-input-bg)] py-2 pl-10 pr-4 text-num-14 leading-num-20 text-[var(--admin-text)] placeholder:text-[var(--admin-text-secondary)] outline-none ring-1 ring-inset ring-transparent focus:ring-[var(--admin-brand-muted)]"
        />
      </div>
      <AdminSelectField
        aria-label="Filter by field of study"
        value={fieldFilter}
        onChange={onFieldFilterChange}
        options={fieldSelectOptions}
        wrapperClassName="min-w-[11rem] shrink-0"
      />
    </div>

    <div className="overflow-x-auto px-4 pb-6 pt-2 sm:px-6">
      <div className="text-left text-num-14 font-inter text-[var(--admin-text)]">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="h-10 border-b border-solid border-[var(--admin-border)]">
              <th className="box-border py-[8.75px] pl-2 pr-4 text-left font-medium leading-num-20">Name</th>
              <th className="box-border px-4 py-[8.75px] text-left font-medium leading-num-20">Class</th>
              <th className="box-border px-4 py-[8.75px] text-left font-medium leading-num-20">Field</th>
              <th className="box-border px-4 py-[8.75px] text-left font-medium leading-num-20">Activity Score</th>
              <th className="box-border px-4 py-[8.75px] text-left font-medium leading-num-20">Engagement Level</th>
              <th className="box-border py-[8.75px] pl-4 pr-2 text-right font-medium leading-num-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <AdminTableEmptyState colSpan={6} title="No students match your filters." />
            ) : (
              students.map((student) => (
                <tr
                  key={student.id}
                  className="min-h-[49px] border-b border-solid border-[var(--admin-border)] last:border-b-0"
                >
                  <td className="box-border min-h-[49px] py-[13.5px] pl-2 pr-4 align-middle font-medium leading-num-20">
                    {student.name}
                  </td>
                  <td className="box-border min-h-[49px] px-4 py-[13.5px] align-middle leading-num-20">{student.classLevel}</td>
                  <td className="box-border min-h-[49px] px-4 py-[13.5px] align-middle leading-num-20">{student.field}</td>
                  <td className="box-border min-h-[49px] px-4 py-[13.5px] align-middle tabular-nums leading-num-20">
                    {student.activityScore.toFixed(1)}/10
                  </td>
                  <td className="box-border min-h-[49px] px-4 py-[13.5px] align-middle">
                    <span className={engagementBandTableBadge(student.engagementLevel)}>
                      {student.engagementLevel}
                    </span>
                  </td>
                  <td className="box-border min-h-[49px] py-[8.5px] pl-4 pr-2 text-right align-middle">
                    <button type="button" className={adminTableBtn}>
                      <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                      View Details
                    </button>
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

export default EngagementLevelTableSection;


