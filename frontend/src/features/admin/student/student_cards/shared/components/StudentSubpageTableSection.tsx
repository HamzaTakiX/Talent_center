import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAdminSearchPlaceholder } from '../../../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../../../i18n/useAdminTableValues';
import type { AdminStudentRow } from '../../../../api/types';
import {
  AdminPagination,
  AdminSelectField,
  AdminTableEmptyState,
  AdminTableSkeletonRows,
} from '../../../../ui';
import { studentFieldLabel } from '../../../../dashboard/dashboard_cards/shared/utils/dashboardCardFilters';
import {
  engagementBandTableBadge,
  internshipStatusTableBadge,
  platformAccountStatusTableBadge,
} from '../../../../ui/adminStatusBadges';
import { SafeText, ADMIN_TABLE_COL } from '../../../../../../design-system/safeContent';
import StudentActions from '../../../components/StudentActions';
import StudentTableIdentityCell from '../../../components/StudentTableIdentityCell';
import { InternshipStatusLabel } from '../../../../ui/adminTableLabels';
import { engagementBand, studentInternshipDisplayStatus } from '../utils/studentListFilters';

interface StudentSubpageTableSectionProps {
  students: AdminStudentRow[];
  query: string;
  onQueryChange: (v: string) => void;
  fieldFilter: string;
  onFieldFilterChange: (v: string) => void;
  fieldOptions: string[];
  showEngagement?: boolean;
  loading?: boolean;
  onView?: (student: AdminStudentRow) => void;
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const StudentSubpageTableSection: FunctionComponent<StudentSubpageTableSectionProps> = ({
  students,
  query,
  onQueryChange,
  fieldFilter,
  onFieldFilterChange,
  fieldOptions,
  showEngagement = false,
  loading = false,
  onView,
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const searchPh = useAdminSearchPlaceholder('students');
  const { accountStatus } = useAdminTableValues();

  const fieldSelectOptions = useMemo(
    () => [
      { value: 'all', label: 'All fields' },
      ...fieldOptions.map((f) => ({ value: f, label: f })),
    ],
    [fieldOptions],
  );

  const colSpan = showEngagement ? 7 : 6;

  return (
    <div className="box-border flex w-full min-w-0 flex-col admin-module-panel font-inter shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[var(--admin-border)] px-4 py-4 sm:flex-row sm:items-center sm:px-6">
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
          <table className="admin-table admin-table--safe w-full min-w-[1180px] border-collapse">
            <thead>
              <tr className="h-10 border-b border-solid border-[var(--admin-border)]">
                <th className={`box-border py-[8.75px] pl-2 pr-4 text-left font-medium leading-num-20 ${ADMIN_TABLE_COL.name}`}>Name</th>
                <th className={`box-border px-4 py-[8.75px] text-left font-medium leading-num-20 ${ADMIN_TABLE_COL.text}`}>Class</th>
                <th className={`box-border px-4 py-[8.75px] text-left font-medium leading-num-20 ${ADMIN_TABLE_COL.text}`}>Field</th>
                <th className={`box-border px-4 py-[8.75px] text-left font-medium leading-num-20 ${ADMIN_TABLE_COL.status}`}>Internship Status</th>
                {showEngagement ? (
                  <th className={`box-border px-4 py-[8.75px] text-left font-medium leading-num-20 ${ADMIN_TABLE_COL.text}`}>Engagement</th>
                ) : null}
                <th className={`box-border px-4 py-[8.75px] text-left font-medium leading-num-20 ${ADMIN_TABLE_COL.status}`}>Status</th>
                <th className={`box-border py-[8.75px] pl-4 pr-2 text-right font-medium leading-num-20 ${ADMIN_TABLE_COL.actionsMenu}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <AdminTableSkeletonRows colSpan={colSpan} rows={6} />
              ) : students.length === 0 ? (
                <AdminTableEmptyState colSpan={colSpan} title="No students match your filters." />
              ) : (
                students.map((student) => {
                  const internshipStatus = studentInternshipDisplayStatus(student);
                  const field = studentFieldLabel(student);
                  const band = engagementBand(student);
                  return (
                    <tr
                      key={student.id}
                      className="min-h-[49px] border-b border-solid border-[var(--admin-border)] last:border-b-0"
                    >
                      <td className="box-border min-h-[49px] py-[13.5px] pl-2 pr-4 align-middle leading-num-20">
                        <StudentTableIdentityCell student={student} />
                      </td>
                      <td className="box-border min-h-[49px] px-4 py-[13.5px] align-middle leading-num-20">
                        <SafeText>{student.current_class || '—'}</SafeText>
                      </td>
                      <td className="box-border min-h-[49px] px-4 py-[13.5px] align-middle leading-num-20">
                        <SafeText>{field}</SafeText>
                      </td>
                      <td className="box-border min-h-[49px] px-4 py-[13.5px] align-middle">
                        <span className={internshipStatusTableBadge(internshipStatus)}>
                          <InternshipStatusLabel status={internshipStatus} />
                        </span>
                      </td>
                      {showEngagement ? (
                        <td className="box-border min-h-[49px] px-4 py-[13.5px] align-middle">
                          <span className={engagementBandTableBadge(band)}>
                            {band} ({student.onboarding_percent}%)
                          </span>
                        </td>
                      ) : null}
                      <td className="box-border min-h-[49px] px-4 py-[13.5px] align-middle">
                        <span className={platformAccountStatusTableBadge(student.account_status)}>
                          {accountStatus(student.account_status)}
                        </span>
                      </td>
                      <td className="box-border min-h-[49px] py-[8.5px] pl-4 pr-2 text-right align-middle admin-students-table__actions">
                        <StudentActions
                          student={student}
                          onView={() =>
                            onView ? onView(student) : navigate(`/admin/students/${student.id}/edit`)
                          }
                          onEdit={() => navigate(`/admin/students/${student.id}/edit`)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
          itemLabel={t('admin.pagination.students', { defaultValue: 'étudiants' })}
        />
      </div>
    </div>
  );
};

export default StudentSubpageTableSection;
