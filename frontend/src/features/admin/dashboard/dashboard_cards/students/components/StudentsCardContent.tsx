import { FunctionComponent } from 'react';
import { Eye } from 'lucide-react';
import type { StudentRow } from '../data/studentsMockData';
import AdminMobileRowCard from '../../../../shared/AdminMobileRowCard';
import { AdminEmptyState, AdminTableScroll } from '../../../../ui';
import { ADMIN_TABLE_BADGE, adminBadgeClass } from '../../../../ui/adminStatusBadges';
import { adminTableBtn } from '../../../../ui/adminTableButtons';

interface StudentsCardContentProps {
  students: StudentRow[];
}

const StudentsCardContent: FunctionComponent<StudentsCardContentProps> = ({ students }) => {
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
        {students.map((student, index) => (
          <AdminMobileRowCard
            key={`${student.name}-${index}`}
            title={student.name}
            badges={
              <span className={adminBadgeClass('success', ADMIN_TABLE_BADGE)}>{student.status}</span>
            }
            fields={[
              { label: 'Class', value: student.classLevel },
              { label: 'Field', value: student.field },
            ]}
            actions={
              <button type="button" className={adminTableBtn}>
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
            {students.map((student, index) => (
              <tr key={`${student.name}-${index}`}>
                <td className="font-medium">{student.name}</td>
                <td>{student.classLevel}</td>
                <td>{student.field}</td>
                <td>
                  <span className={adminBadgeClass('success', ADMIN_TABLE_BADGE)}>{student.status}</span>
                </td>
                <td className="text-right">
                  <button type="button" className={adminTableBtn}>
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
