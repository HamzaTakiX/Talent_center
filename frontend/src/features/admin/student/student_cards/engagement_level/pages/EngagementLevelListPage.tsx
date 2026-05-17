import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell, AdminStatChartSection } from '../../../../ui';
import EngagementLevelStatGrid from '../components/EngagementLevelStatGrid';
import EngagementMetricsSection from '../components/EngagementMetricsSection';
import EngagementLevelTableSection from '../components/EngagementLevelTableSection';
import { engagementLevelTableRows } from '../data/engagementLevelTableRows';

const EngagementLevelListPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [fieldFilter, setFieldFilter] = useState('all');

  const fieldOptions = useMemo(
    () => [...new Set(engagementLevelTableRows.map((r) => r.field))].sort(),
    []
  );

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return engagementLevelTableRows.filter((s) => {
      const matchField = fieldFilter === 'all' || s.field === fieldFilter;
      if (!q) return matchField;
      const matchQuery =
        s.name.toLowerCase().includes(q) ||
        s.classLevel.toLowerCase().includes(q) ||
        s.field.toLowerCase().includes(q) ||
        s.engagementLevel.toLowerCase().includes(q);
      return matchField && matchQuery;
    });
  }, [query, fieldFilter]);

  return (
    <AdminListPageShell
      onBack={() => navigate('/admin/students')}
      backTo="students"
    >
      <EngagementLevelStatGrid />
      <AdminStatChartSection chartId="students-engagement-distribution" />
      <EngagementMetricsSection />
      <EngagementLevelTableSection
        students={filteredStudents}
        query={query}
        onQueryChange={setQuery}
        fieldFilter={fieldFilter}
        onFieldFilterChange={setFieldFilter}
        fieldOptions={fieldOptions}
      />
    </AdminListPageShell>
  );
};

export default EngagementLevelListPage;
