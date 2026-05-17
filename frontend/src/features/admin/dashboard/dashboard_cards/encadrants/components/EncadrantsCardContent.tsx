import { FunctionComponent } from 'react';
import { Eye } from 'lucide-react';
import type { EncadrantRow } from '../data/encadrantsMockData';
import AdminMobileRowCard from '../../../../shared/AdminMobileRowCard';
import { AdminEmptyState, AdminTableScroll } from '../../../../ui';
import { adminTableBtn } from '../../../../ui/adminTableButtons';

interface EncadrantsCardContentProps {
  encadrants: EncadrantRow[];
}

const EncadrantsCardContent: FunctionComponent<EncadrantsCardContentProps> = ({ encadrants }) => {
  if (encadrants.length === 0) {
    return (
      <div className="px-4 pb-6 sm:px-6">
        <AdminEmptyState title="No encadrants match your filters." />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 px-4 pb-3 pt-0 sm:px-6 lg:hidden">
        {encadrants.map((encadrant, index) => (
          <AdminMobileRowCard
            key={`${encadrant.name}-${index}`}
            title={encadrant.name}
            fields={[
              { label: 'Department', value: encadrant.department },
              { label: 'Students assigned', value: <span className="tabular-nums">{encadrant.studentsAssigned}</span> },
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
        <AdminTableScroll minWidth="720px" className="admin-table-scroll--panel">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Students Assigned</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {encadrants.map((encadrant, index) => (
              <tr key={`${encadrant.name}-${index}`}>
                <td className="font-medium">{encadrant.name}</td>
                <td>{encadrant.department}</td>
                <td className="tabular-nums">{encadrant.studentsAssigned}</td>
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

export default EncadrantsCardContent;
