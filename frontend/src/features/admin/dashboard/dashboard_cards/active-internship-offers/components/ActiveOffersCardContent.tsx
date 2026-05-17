import { FunctionComponent } from 'react';
import type { ActiveOfferRow } from '../data/activeOffersMockData';
import AdminMobileRowCard from '../../../../shared/AdminMobileRowCard';
import { AdminEmptyState, AdminTableScroll } from '../../../../ui';
import { OfferStatusLabel } from '../../../../ui/adminTableLabels';
import { ADMIN_TABLE_BADGE, adminBadgeClass } from '../../../../ui/adminStatusBadges';

interface ActiveOffersCardContentProps {
  offers: ActiveOfferRow[];
}

const ActiveOffersCardContent: FunctionComponent<ActiveOffersCardContentProps> = ({ offers }) => {
  if (offers.length === 0) {
    return (
      <div className="px-4 pb-6 sm:px-6">
        <AdminEmptyState title="No offers match your filters." />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 px-4 pb-3 pt-0 sm:px-6 lg:hidden">
        {offers.map((offer, index) => (
          <AdminMobileRowCard
            key={`${offer.title}-${offer.company}-${index}`}
            title={offer.title}
            badges={<span className={adminBadgeClass('success', ADMIN_TABLE_BADGE)}>{<OfferStatusLabel status={offer.status} />}</span>}
            fields={[
              { label: 'Company', value: offer.company },
              { label: 'Applicants', value: <span className="tabular-nums">{offer.applicants}</span> },
            ]}
          />
        ))}
      </div>

      <div className="admin-module-table-wrap hidden min-w-0 px-4 pb-6 pt-0 sm:px-6 lg:block">
        <AdminTableScroll minWidth="640px" className="admin-table-scroll--panel">
          <thead>
            <tr>
              <th>Title</th>
              <th>Company</th>
              <th>Applicants</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer, index) => (
              <tr key={`${offer.title}-${offer.company}-${index}`}>
                <td className="font-medium">{offer.title}</td>
                <td>{offer.company}</td>
                <td className="tabular-nums">{offer.applicants}</td>
                <td>
                  <span className={adminBadgeClass('success', ADMIN_TABLE_BADGE)}>{<OfferStatusLabel status={offer.status} />}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTableScroll>
      </div>
    </>
  );
};

export default ActiveOffersCardContent;
