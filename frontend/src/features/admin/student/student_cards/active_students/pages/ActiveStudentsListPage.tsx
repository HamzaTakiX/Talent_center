import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell } from '../../../../ui';
import ActiveStudentsStatGrid from '../components/ActiveStudentsStatGrid';
import TotalStudentsTableSection from '../../total_students/components/TotalStudentsTableSection';
import { totalStudentsTableRows } from '../../total_students/data/totalStudentsTableRows';
import { AdminStatChartSection } from '../../../../ui';

const ActiveStudentsListPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [fieldFilter, setFieldFilter] = useState('all');

  const fieldOptions = useMemo(
    () => [...new Set(totalStudentsTableRows.map((r) => r.field))].sort(),
    []
  );

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return totalStudentsTableRows.filter((s) => {
      const matchField = fieldFilter === 'all' || s.field === fieldFilter;
      if (!q) return matchField;
      const matchQuery =
        s.name.toLowerCase().includes(q) ||
        s.classLevel.toLowerCase().includes(q) ||
        s.field.toLowerCase().includes(q) ||
        s.internshipStatus.toLowerCase().includes(q);
      return matchField && matchQuery;
    });
  }, [query, fieldFilter]);

  return (
    <AdminListPageShell
      onBack={() => navigate('/admin/students')}
      backTo="students"
    >
      <ActiveStudentsStatGrid />
      <AdminStatChartSection chartId="students-active-split" />
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

export default ActiveStudentsListPage;
