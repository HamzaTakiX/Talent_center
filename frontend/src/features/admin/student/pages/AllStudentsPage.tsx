import { FunctionComponent, useMemo, useState } from 'react';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import StudentsStatGrid from '../components/StudentsStatGrid';
import StudentsDashboardTable from '../components/StudentsDashboardTable';
import { studentsDashboardRows } from '../data/studentsDashboardMock';

const AllStudentsPage: FunctionComponent = () => {
  const [query, setQuery] = useState('');

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return studentsDashboardRows;
    return studentsDashboardRows.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.classLevel.toLowerCase().includes(q) ||
        s.field.toLowerCase().includes(q) ||
        s.internshipStatus.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <AdminModulePageShell width="wide">
      <div data-admin-search-id="students-stats">
        <StudentsStatGrid />
      </div>
      <div data-admin-search-id="students-table">
        <StudentsDashboardTable students={filteredStudents} query={query} onQueryChange={setQuery} />
      </div>
    </AdminModulePageShell>
  );
};

export default AllStudentsPage;
