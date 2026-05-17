import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell, AdminStatDetailPanel, AdminStatChartSection } from '../../../../ui';
import EncadrantListTableContent from '../../shared/components/EncadrantListTableContent';
import { encadrantsMockRows, encadrantsSummaryStats } from '../../../data/encadrantsMockData';

const departmentOptions = [...new Set(encadrantsMockRows.map((r) => r.department))].sort();

const ReportsInProgressListPage: FunctionComponent = () => {
  const { pageTitle, filterSubtitle, searchPlaceholder } = useAdminCopy();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return encadrantsMockRows.filter((row) => {
      const matchDept = departmentFilter === 'all' || row.department === departmentFilter;
      if (!q) return matchDept;
      const matchQuery =
        row.name.toLowerCase().includes(q) ||
        row.department.toLowerCase().includes(q) ||
        String(row.studentsAssigned).includes(q) ||
        String(row.reportsInProgress).includes(q);
      return matchDept && matchQuery;
    });
  }, [query, departmentFilter]);

  const totalFormatted = encadrantsSummaryStats[2].value.toLocaleString('en-US');
  const departmentSelectOptions = useMemo(
    () => [{ value: 'all', label: 'All departments' }, ...departmentOptions.map((d) => ({ value: d, label: d }))],
    [],
  );

  return (
    <AdminListPageShell
      onBack={() => navigate('/admin/encadrants')}
      backTo="encadrants"
    >
      <AdminStatChartSection chartId="encadrants-reports-split" />
      <AdminStatDetailPanel
        title={pageTitle('encadrants.reports.title', { count: totalFormatted })}
        subtitle={filterSubtitle('encadrantsDetail')}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={searchPlaceholder('encadrants')}
        toolbarAriaLabel="Filter encadrants"
        filter1={{
          value: departmentFilter,
          onChange: setDepartmentFilter,
          options: departmentSelectOptions,
          ariaLabel: 'Filter by department',
        }}
      >
        <EncadrantListTableContent rows={filteredRows} />
      </AdminStatDetailPanel>
    </AdminListPageShell>
  );
};

export default ReportsInProgressListPage;
