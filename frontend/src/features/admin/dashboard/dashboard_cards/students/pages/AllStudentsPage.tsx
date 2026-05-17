import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo } from 'react';
import AdminModulePageShell from '../../../../ui/AdminModulePageShell';
import { AdminStatChartSection } from '../../../../ui';
import BackToDashboardButton from '../../shared/components/BackToDashboardButton';
import DashboardCardDetailPanel from '../../shared/components/DashboardCardDetailPanel';
import { useDashboardCardListFilter } from '../../shared/hooks/useDashboardCardListFilter';
import StudentsCardContent from '../components/StudentsCardContent';
import { TOTAL_STUDENTS_COUNT, studentsMockRows } from '../data/studentsMockData';

const AllStudentsPage: FunctionComponent = () => {
  const { pageTitle, filterSubtitle, searchPlaceholder } = useAdminCopy();
  const { query, setQuery, filter, setFilter, filtered } = useDashboardCardListFilter(
    studentsMockRows,
    (s) => [s.name, s.classLevel, s.field, s.status],
    (s, f) => s.field === f,
  );

  const fieldOptions = useMemo(
    () => [...new Set(studentsMockRows.map((s) => s.field))].map((f) => ({ value: f, label: f })),
    [],
  );

  return (
    <AdminModulePageShell width="default">
      <BackToDashboardButton />
      <AdminStatChartSection chartId="dashboard-students-fields" />
      <DashboardCardDetailPanel
        title={pageTitle('dashboard.allStudents.title', { count: TOTAL_STUDENTS_COUNT.toLocaleString('en-US') })}
        subtitle={pageTitle('dashboard.allStudents.subtitle')}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={searchPlaceholder('students')}
        toolbarAriaLabel="Filter students"
        filter1={{
          value: filter,
          onChange: setFilter,
          options: [{ value: 'all', label: 'All fields' }, ...fieldOptions],
          ariaLabel: 'Filter by field',
        }}
      >
        <StudentsCardContent students={filtered} />
      </DashboardCardDetailPanel>
    </AdminModulePageShell>
  );
};

export default AllStudentsPage;

