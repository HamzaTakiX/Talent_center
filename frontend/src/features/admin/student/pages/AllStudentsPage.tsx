import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import StudentsStatGrid from '../components/StudentsStatGrid';
import StudentsDashboardTable from '../components/StudentsDashboardTable';
import StudentDetailModal from '../components/StudentDetailModal';
import { adminStudentsApi } from '../../api/students';
import type { AdminStudentRow, StudentDashboardStats } from '../../api/types';
import { DEFAULT_SERVER_PAGE_SIZE } from '../../shared/hooks/useAdminPagination';
import { AdminModulePageSkeleton } from '../../ui';

const AllStudentsPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [students, setStudents] = useState<AdminStudentRow[]>([]);
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [viewStudent, setViewStudent] = useState<AdminStudentRow | null>(null);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await adminStudentsApi.stats();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminStudentsApi.list({
        search: query.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        page,
        page_size: DEFAULT_SERVER_PAGE_SIZE,
      });
      setStudents(data.items);
      setTotalItems(data.total);
      setTotalPages(data.total_pages);
    } catch {
      setStudents([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [query, statusFilter, page]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    const t = setTimeout(() => {
      void loadStudents();
    }, 300);
    return () => clearTimeout(t);
  }, [loadStudents]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([loadStats(), loadStudents()]);
  }, [loadStats, loadStudents]);

  const openCreate = () => navigate('/admin/students/create');
  const openEdit = (student: AdminStudentRow) =>
    navigate(`/admin/students/${student.id}/edit`);

  if (loading && statsLoading && students.length === 0 && !stats) {
    return (
      <AdminModulePageShell width="wide">
        <AdminModulePageSkeleton />
      </AdminModulePageShell>
    );
  }

  return (
    <AdminModulePageShell width="wide">
      <StudentDetailModal
        open={viewStudent != null}
        student={viewStudent}
        onClose={() => setViewStudent(null)}
        onEdit={(id) => {
          setViewStudent(null);
          navigate(`/admin/students/${id}/edit`);
        }}
      />
      <div data-admin-search-id="students-stats">
        <StudentsStatGrid stats={statsLoading ? null : stats} />
      </div>
      <div className="mt-6" data-admin-search-id="students-table">
        <StudentsDashboardTable
          students={students}
          query={query}
          onQueryChange={setQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          loading={loading}
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={DEFAULT_SERVER_PAGE_SIZE}
          onPageChange={setPage}
          onCreate={openCreate}
          onView={setViewStudent}
          onEdit={openEdit}
          onRefresh={handleRefresh}
        />
      </div>
    </AdminModulePageShell>
  );
};

export default AllStudentsPage;
