import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DEFAULT_SERVER_PAGE_SIZE,
  useAdminPagination,
} from '../../../../shared/hooks/useAdminPagination';
import {
  AdminKpiStripSkeleton,
  AdminListPageShell,
  AdminStatChartSection,
  type StatPageChartId,
} from '../../../../ui';
import StudentCardStatGrid from '../../../components/StudentCardStatGrid';
import StudentDetailModal from '../../../components/StudentDetailModal';
import type { AdminStudentRow } from '../../../../api/types';
import { studentFieldLabel } from '../../../../dashboard/dashboard_cards/shared/utils/dashboardCardFilters';
import { useStudentListPageData } from '../hooks/useStudentListPageData';
import type { StudentListSliceFilter } from '../types/studentListSlice';
import StudentSubpageTableSection from './StudentSubpageTableSection';
import StudentsSubpageDonutChart from './charts/StudentsSubpageDonutChart';

interface StudentFilteredListLayoutProps {
  filter: StudentListSliceFilter;
  chartId: StatPageChartId;
  showEngagementTable?: boolean;
  showOnboardingChart?: boolean;
}

function filterTableRows(
  rows: AdminStudentRow[],
  query: string,
  fieldFilter: string,
): AdminStudentRow[] {
  const q = query.trim().toLowerCase();
  return rows.filter((row) => {
    const field = studentFieldLabel(row);
    const matchField = fieldFilter === 'all' || field === fieldFilter;
    if (!q) return matchField;
    const matchQuery =
      (row.full_name || '').toLowerCase().includes(q) ||
      row.email.toLowerCase().includes(q) ||
      (row.current_class || '').toLowerCase().includes(q) ||
      field.toLowerCase().includes(q) ||
      row.account_status.toLowerCase().includes(q);
    return matchField && matchQuery;
  });
}

const StudentFilteredListLayout: FunctionComponent<StudentFilteredListLayoutProps> = ({
  filter,
  chartId,
  showEngagementTable = false,
  showOnboardingChart = false,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [fieldFilter, setFieldFilter] = useState('all');
  const [viewStudent, setViewStudent] = useState<AdminStudentRow | null>(null);

  const { loading, allRows, sliceRows, globalStats, kpiStats, fieldOptions } =
    useStudentListPageData(filter);

  const tableRows = useMemo(
    () => filterTableRows(sliceRows, query, fieldFilter),
    [sliceRows, query, fieldFilter],
  );

  const {
    page,
    setPage,
    paginatedItems,
    totalItems,
    totalPages,
    pageSize,
    resetPage,
  } = useAdminPagination(tableRows, DEFAULT_SERVER_PAGE_SIZE);

  useEffect(() => {
    resetPage();
  }, [query, fieldFilter, filter, resetPage]);

  return (
    <AdminListPageShell onBack={() => navigate('/admin/students')} backTo="students">
      <StudentDetailModal
        open={viewStudent != null}
        student={viewStudent}
        onClose={() => setViewStudent(null)}
        onEdit={(id) => {
          setViewStudent(null);
          navigate(`/admin/students/${id}/edit`);
        }}
      />

      {loading ? (
        <AdminKpiStripSkeleton count={kpiStats.length || 3} />
      ) : (
        <StudentCardStatGrid stats={kpiStats} columns={3} />
      )}

      <AdminStatChartSection chartId={chartId} loading={loading}>
        <StudentsSubpageDonutChart
          filter={filter}
          globalStats={globalStats}
          allRows={allRows}
          loading={loading}
        />
      </AdminStatChartSection>

      {showOnboardingChart ? (
        <div className="box-border flex w-full min-w-0 flex-col gap-6 admin-module-panel px-6 pb-6 pt-6 font-inter text-base text-[var(--admin-text)] shadow-sm">
          <div className="flex min-h-[70px] flex-col gap-1">
            <h2 className="text-base font-medium leading-4">Profile completion</h2>
            <p className="text-base leading-6 text-[var(--admin-text-secondary)]">
              Distribution of onboarding progress (identity + profile steps).
            </p>
          </div>
          <StudentsSubpageDonutChart
            filter={filter}
            globalStats={globalStats}
            allRows={allRows}
            variant="onboarding"
            loading={loading}
          />
        </div>
      ) : null}

      <StudentSubpageTableSection
        students={paginatedItems}
        query={query}
        onQueryChange={setQuery}
        fieldFilter={fieldFilter}
        onFieldFilterChange={setFieldFilter}
        fieldOptions={fieldOptions}
        showEngagement={showEngagementTable}
        loading={loading}
        onView={setViewStudent}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </AdminListPageShell>
  );
};

export default StudentFilteredListLayout;
