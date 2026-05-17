import { FunctionComponent } from 'react';
import type { SrfPaymentStatus, StudentUnpaidSrfRow } from '../data/studentsUnpaidSrfMockData';
import AdminMobileRowCard from '../../../../shared/AdminMobileRowCard';
import { AdminEmptyState, AdminTableScroll } from '../../../../ui';
import { ADMIN_TABLE_BADGE, adminBadgeClass } from '../../../../ui/adminStatusBadges';

interface StudentsUnpaidSrfCardContentProps {
  rows: StudentUnpaidSrfRow[];
}

const statusVariant = (status: SrfPaymentStatus): 'danger' | 'warning' =>
  status === 'unpaid' ? 'danger' : 'warning';

const statusLabel = (status: SrfPaymentStatus): string =>
  status === 'partially_paid' ? 'Partially paid' : 'Unpaid';

const StudentsUnpaidSrfCardContent: FunctionComponent<StudentsUnpaidSrfCardContentProps> = ({ rows }) => {
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
            badges={
              <span className={adminBadgeClass(statusVariant(row.status), ADMIN_TABLE_BADGE)}>
                {statusLabel(row.status)}
              </span>
            }
            fields={[
              { label: 'Class', value: row.classLevel },
              { label: 'Amount due', value: <span className="tabular-nums">{row.amountDue}</span> },
            ]}
          />
        ))}
      </div>

      <div className="admin-module-table-wrap hidden min-w-0 px-4 pb-6 pt-0 sm:px-6 lg:block">
        <AdminTableScroll minWidth="640px" className="admin-table-scroll--panel">
          <thead>
            <tr>
              <th>Name</th>
              <th>Class</th>
              <th>Amount Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.name}-${index}`}>
                <td className="font-medium">{row.name}</td>
                <td>{row.classLevel}</td>
                <td className="tabular-nums">{row.amountDue}</td>
                <td>
                  <span className={adminBadgeClass(statusVariant(row.status), ADMIN_TABLE_BADGE)}>
                    {statusLabel(row.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTableScroll>
      </div>
    </>
  );
};

export default StudentsUnpaidSrfCardContent;
