import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo } from 'react';
import { adminStudentsApi } from '../../../../api/students';
import type { AdminStudentRow } from '../../../../api/types';
import AdminModulePageShell from '../../../../ui/AdminModulePageShell';
import { AdminStatChartSection } from '../../../../ui';
import BackToDashboardButton from '../../shared/components/BackToDashboardButton';
import DashboardCardDetailPanel from '../../shared/components/DashboardCardDetailPanel';
import { useDashboardCardListFilter } from '../../shared/hooks/useDashboardCardListFilter';
import { useDashboardCardEntities } from '../../shared/hooks/useDashboardCardEntities';
import { studentFieldLabel } from '../../shared/utils/dashboardCardFilters';
import StudentsCardContent from '../components/StudentsCardContent';

const AllStudentsPage: FunctionComponent = () => {
  const { pageTitle, searchPlaceholder } = useAdminCopy();
  const { items, total, loading } = useDashboardCardEntities<AdminStudentRow>(adminStudentsApi.list);

  const { query, setQuery, filter, setFilter, filtered } = useDashboardCardListFilter(
    items,
    (s) => [s.full_name, s.email, s.current_class, studentFieldLabel(s)],
    (s, f) => studentFieldLabel(s) === f,
  );

  const fieldOptions = useMemo(() => {
    const fields = [...new Set(items.map((s) => studentFieldLabel(s)).filter((f) => f !== '—'))];
    return fields.sort().map((f) => ({ value: f, label: f }));
  }, [items]);

  return (
    <AdminModulePageShell width="default">
      <BackToDashboardButton />
      <AdminStatChartSection chartId="dashboard-students-fields" />
      <DashboardCardDetailPanel
        title={pageTitle('dashboard.allStudents.title', {
          count: total.toLocaleString('en-US'),
        })}
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
        <StudentsCardContent students={filtered} loading={loading} />
      </DashboardCardDetailPanel>
    </AdminModulePageShell>
  );
};

export default AllStudentsPage;
