import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo } from 'react';
import AdminModulePageShell from '../../../../ui/AdminModulePageShell';
import { AdminStatChartSection } from '../../../../ui';
import BackToDashboardButton from '../../shared/components/BackToDashboardButton';
import DashboardCardDetailPanel from '../../shared/components/DashboardCardDetailPanel';
import { useDashboardCardListFilter } from '../../shared/hooks/useDashboardCardListFilter';
import StudentsWithoutInternshipCardContent from '../components/StudentsWithoutInternshipCardContent';
import {
  STUDENTS_WITHOUT_INTERNSHIP_COUNT,
  studentsWithoutInternshipMockRows,
} from '../data/studentsWithoutInternshipMockData';

const StudentsWithoutInternshipPage: FunctionComponent = () => {
  const { pageTitle, filterSubtitle, searchPlaceholder } = useAdminCopy();
  const { query, setQuery, filter, setFilter, filtered } = useDashboardCardListFilter(
    studentsWithoutInternshipMockRows,
    (r) => [r.name, r.classLevel, r.field],
    (r, f) => r.field === f,
  );

  const fieldOptions = useMemo(
    () => [...new Set(studentsWithoutInternshipMockRows.map((r) => r.field))].map((f) => ({ value: f, label: f })),
    [],
  );

  return (
    <AdminModulePageShell width="default">
      <BackToDashboardButton />
      <AdminStatChartSection chartId="dashboard-without-internship" />
      <DashboardCardDetailPanel
        title={pageTitle('dashboard.withoutInternship.title', { count: STUDENTS_WITHOUT_INTERNSHIP_COUNT.toLocaleString('en-US') })}
        subtitle={pageTitle('dashboard.withoutInternship.subtitle')}
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
        <StudentsWithoutInternshipCardContent rows={filtered} />
      </DashboardCardDetailPanel>
    </AdminModulePageShell>
  );
};

export default StudentsWithoutInternshipPage;

