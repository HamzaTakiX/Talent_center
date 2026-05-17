import { FunctionComponent } from 'react';
import type { StudentWithoutInternshipRow } from '../data/studentsWithoutInternshipMockData';
import AdminMobileRowCard from '../../../../shared/AdminMobileRowCard';
import { AdminEmptyState, AdminTableScroll } from '../../../../ui';
import { adminTableBtnMobilePrimary, adminTableBtnPrimary } from '../../../../ui/adminTableButtons';

interface StudentsWithoutInternshipCardContentProps {
  rows: StudentWithoutInternshipRow[];
}

const StudentsWithoutInternshipCardContent: FunctionComponent<StudentsWithoutInternshipCardContentProps> = ({
  rows,
}) => {
  if (rows.length === 0) {
    return (
      <div className="px-4 pb-6 sm:px-6">
        <AdminEmptyState title="No students match your filters." />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 px-4 pb-3 pt-0 sm:px-6 lg:hidden">
        {rows.map((row, index) => (
          <AdminMobileRowCard
            key={`${row.name}-${index}`}
            title={row.name}
            fields={[
              { label: 'Class', value: row.classLevel },
              { label: 'Field', value: row.field },
            ]}
            actions={
              <button type="button" className={adminTableBtnMobilePrimary}>
                Assign Offer
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
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.name}-${index}`}>
                <td className="font-medium">{row.name}</td>
                <td>{row.classLevel}</td>
                <td>{row.field}</td>
                <td className="text-right">
                  <button type="button" className={adminTableBtnPrimary}>
                    Assign Offer
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

export default StudentsWithoutInternshipCardContent;
