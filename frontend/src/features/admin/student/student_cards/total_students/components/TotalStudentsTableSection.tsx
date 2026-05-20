import { useAdminSearchPlaceholder } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo } from 'react';
import { Eye, Pencil, Search, UserX } from 'lucide-react';
import { AdminSelectField, AdminTableEmptyState } from '../../../../ui';
import type { StudentDashboardRow } from '../../../data/studentsDashboardMock';

import { AccountStatusLabel } from '../../../../ui/adminTableLabels';
import { internshipStatusTableBadge, studentAccountTableBadge } from '../../../../ui/adminStatusBadges';
import { adminTableBtn } from '../../../../ui/adminTableButtons';

/** Boutons actions : arrondi num-8, bordure grise Figma (rgba 0,0,0,0.1). */
interface TotalStudentsTableSectionProps {
  students: StudentDashboardRow[];
  query: string;
  onQueryChange: (v: string) => void;
  fieldFilter: string;
  onFieldFilterChange: (v: string) => void;
  fieldOptions: string[];
}

const TotalStudentsTableSection: FunctionComponent<TotalStudentsTableSectionProps> = ({
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
        <table className="admin-table w-full min-w-[1180px] border-collapse">
          <thead>
            <tr className="h-10 border-b border-solid border-[var(--admin-border)]">
              <th className="box-border py-[8.75px] pl-2 pr-4 text-left font-medium leading-num-20">Name</th>
              <th className="box-border px-4 py-[8.75px] text-left font-medium leading-num-20">Class</th>
              <th className="box-border px-4 py-[8.75px] text-left font-medium leading-num-20">Field</th>
              <th className="box-border px-4 py-[8.75px] text-left font-medium leading-num-20">Internship Status</th>
              <th className="box-border px-4 py-[8.75px] text-left font-medium leading-num-20">Status</th>
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
                  <td className="box-border min-h-[49px] px-4 py-[13.5px] align-middle">
                    <span className={internshipStatusTableBadge(student.internshipStatus)}>
                      {student.internshipStatus}
                    </span>
                  </td>
                  <td className="box-border min-h-[49px] px-4 py-[13.5px] align-middle">
                    <span className={studentAccountTableBadge(student.statusLabel)}>{<AccountStatusLabel status={student.statusLabel} />}</span>
                  </td>
                  <td className="box-border min-h-[49px] py-[8.5px] pl-4 pr-2 text-right align-middle">
                    <div className="flex flex-wrap items-start justify-end gap-2 text-center">
                      <button type="button" className={`${adminTableBtn} min-w-[123.5px]`}>
                        <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                        View Profile
                      </button>
                      <button type="button" className={`${adminTableBtn} min-w-[72.4px]`}>
                        <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                        Edit
                      </button>
                      <button type="button" className={`${adminTableBtn} min-w-[114.7px]`}>
                        <UserX className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                        Deactivate
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

export default TotalStudentsTableSection;


