import { FunctionComponent } from 'react';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AdminStudentRow } from '../../../../api/types';
import { useAdminTableValues } from '../../../../i18n/useAdminTableValues';
import AdminMobileRowCard from '../../../../shared/AdminMobileRowCard';
import { AdminEmptyState, AdminTableScroll } from '../../../../ui';
import { platformAccountStatusTableBadge } from '../../../../ui/adminStatusBadges';
import { adminTableBtn } from '../../../../ui/adminTableButtons';
import { programTableLabel } from '../../../../shared/utils/programDisplay';

interface StudentsCardContentProps {
  students: AdminStudentRow[];
  loading?: boolean;
}

const StudentsCardContent: FunctionComponent<StudentsCardContentProps> = ({
  students,
  loading = false,
}) => {
  const navigate = useNavigate();
  const { accountStatus } = useAdminTableValues();

  if (loading) {
    return (
      <div className="px-4 pb-6 sm:px-6">
        <p className="text-sm text-[var(--admin-text-secondary)]">Loading…</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="px-4 pb-6 sm:px-6">
        <AdminEmptyState title="No students match your filters." />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 px-4 pb-3 pt-0 sm:px-6 lg:hidden">
        {students.map((student) => (
          <AdminMobileRowCard
            key={student.id}
            title={student.full_name || student.email}
            badges={
              <span className={platformAccountStatusTableBadge(student.account_status)}>
                {accountStatus(student.account_status)}
              </span>
            }
            fields={[
              { label: 'Class', value: student.current_class || '—' },
              { label: 'Field', value: programTableLabel(student.filiere_code, student.program_major) },
            ]}
            actions={
              <button
                type="button"
                className={adminTableBtn}
                onClick={() => navigate(`/admin/students/${student.id}/edit`)}
              >
                <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                View
              </button>
            }
          />
        ))}
      </div>

      <div className="admin-module-table-wrap hidden min-w-0 px-4 pb-6 pt-0 sm:px-6 lg:block">
        <AdminTableScroll minWidth="640px" className="admin-table-scroll--panel">
          <thead>
            <tr>
              <th>Name</th>
              <th>Class</th>
              <th>Field</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td className="font-medium">{student.full_name || student.email}</td>
                <td>{student.current_class || '—'}</td>
                <td>{programTableLabel(student.filiere_code, student.program_major)}</td>
                <td>
                  <span className={platformAccountStatusTableBadge(student.account_status)}>
                    {accountStatus(student.account_status)}
                  </span>
                </td>
                <td className="text-right">
                  <button
                    type="button"
                    className={adminTableBtn}
                    onClick={() => navigate(`/admin/students/${student.id}/edit`)}
                  >
                    <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTableScroll>
      </div>
    </>
  );
};

export default StudentsCardContent;
