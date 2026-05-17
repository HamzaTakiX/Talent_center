import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell } from '../../../../ui';
import WithoutInternshipStatGrid from '../components/WithoutInternshipStatGrid';
import WithoutInternshipTableSection from '../components/WithoutInternshipTableSection';
import { withoutInternshipTableRows } from '../data/withoutInternshipTableRows';
import { AdminStatChartSection } from '../../../../ui';

const WithoutInternshipListPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [fieldFilter, setFieldFilter] = useState('all');

  const fieldOptions = useMemo(
    () => [...new Set(withoutInternshipTableRows.map((r) => r.field))].sort(),
    []
  );

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return withoutInternshipTableRows.filter((s) => {
      const matchField = fieldFilter === 'all' || s.field === fieldFilter;
      if (!q) return matchField;
      const matchQuery =
        s.name.toLowerCase().includes(q) ||
        s.classLevel.toLowerCase().includes(q) ||
        s.field.toLowerCase().includes(q) ||
        s.statusLabel.toLowerCase().includes(q);
      return matchField && matchQuery;
    });
  }, [query, fieldFilter]);

  return (
    <AdminListPageShell
      onBack={() => navigate('/admin/students')}
      backTo="students"
    >
      <WithoutInternshipStatGrid />
      <AdminStatChartSection chartId="students-without-internship" />
      <WithoutInternshipTableSection
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

export default WithoutInternshipListPage;
