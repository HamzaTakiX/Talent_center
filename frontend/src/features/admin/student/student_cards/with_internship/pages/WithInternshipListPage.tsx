import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell } from '../../../../ui';
import WithInternshipStatGrid from '../components/WithInternshipStatGrid';
import TotalStudentsTableSection from '../../total_students/components/TotalStudentsTableSection';
import { totalStudentsTableRows } from '../../total_students/data/totalStudentsTableRows';
import { AdminStatChartSection } from '../../../../ui';

const WithInternshipListPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [fieldFilter, setFieldFilter] = useState('all');

  const baseRows = useMemo(
    () => totalStudentsTableRows.filter((r) => r.internshipStatus === 'Assigned'),
    []
  );

  const fieldOptions = useMemo(
    () => [...new Set(baseRows.map((r) => r.field))].sort(),
    [baseRows]
  );

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return baseRows.filter((s) => {
      const matchField = fieldFilter === 'all' || s.field === fieldFilter;
      if (!q) return matchField;
      const matchQuery =
        s.name.toLowerCase().includes(q) ||
        s.classLevel.toLowerCase().includes(q) ||
        s.field.toLowerCase().includes(q) ||
        s.internshipStatus.toLowerCase().includes(q);
      return matchField && matchQuery;
    });
  }, [query, fieldFilter, baseRows]);

  return (
    <AdminListPageShell
      onBack={() => navigate('/admin/students')}
      backTo="students"
    >
      <WithInternshipStatGrid />
      <AdminStatChartSection chartId="students-with-internship" />
      <TotalStudentsTableSection
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

export default WithInternshipListPage;
