import { FunctionComponent } from 'react';
import type { ApplicationStatus, OngoingApplicationRow } from '../data/ongoingApplicationsMockData';
import AdminMobileRowCard from '../../../../shared/AdminMobileRowCard';
import { AdminEmptyState, AdminTableScroll } from '../../../../ui';
import { ADMIN_TABLE_BADGE, adminBadgeClass } from '../../../../ui/adminStatusBadges';

interface OngoingApplicationsCardContentProps {
  rows: OngoingApplicationRow[];
}

const statusVariant = (status: ApplicationStatus) => (status === 'pending' ? 'warning' : 'success');

const OngoingApplicationsCardContent: FunctionComponent<OngoingApplicationsCardContentProps> = ({ rows }) => {
  if (rows.length === 0) {
    return (
      <div className="px-4 pb-6 sm:px-6">
        <AdminEmptyState title="No applications match your filters." />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 px-4 pb-3 pt-0 sm:px-6 lg:hidden">
        {rows.map((row, index) => (
          <AdminMobileRowCard
            key={`${row.student}-${row.offer}-${index}`}
            title={row.student}
            badges={
              <span className={`${adminBadgeClass(statusVariant(row.status), ADMIN_TABLE_BADGE)} capitalize`}>
                {row.status}
              </span>
            }
            fields={[
              { label: 'Offer', value: row.offer },
              { label: 'Score', value: <span className="tabular-nums">{row.score}</span> },
            ]}
          />
        ))}
      </div>

      <div className="admin-module-table-wrap hidden min-w-0 px-4 pb-6 pt-0 sm:px-6 lg:block">
        <AdminTableScroll minWidth="640px" className="admin-table-scroll--panel">
          <thead>
            <tr>
              <th>Student</th>
              <th>Offer</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.student}-${row.offer}-${index}`}>
                <td className="font-medium">{row.student}</td>
                <td>{row.offer}</td>
                <td className="tabular-nums">{row.score}</td>
                <td>
                  <span className={`${adminBadgeClass(statusVariant(row.status), ADMIN_TABLE_BADGE)} capitalize`}>
                    {row.status}
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

export default OngoingApplicationsCardContent;
