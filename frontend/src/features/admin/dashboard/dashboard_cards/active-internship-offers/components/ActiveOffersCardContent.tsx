import { FunctionComponent } from 'react';
import type { InternshipOffer } from '../../../../offres-stage/types';
import AdminMobileRowCard from '../../../../shared/AdminMobileRowCard';
import { AdminEmptyState, AdminTableScroll } from '../../../../ui';
import { OfferStatusLabel } from '../../../../ui/adminTableLabels';
import { ADMIN_TABLE_BADGE, adminBadgeClass } from '../../../../ui/adminStatusBadges';
import { ADMIN_TABLE_COL, SafeCompanyCell, SafeText, SafeTitleCell } from '../../../../../../design-system/safeContent';
import { useOffersListLabels } from '../../../../offres-stage/hooks/useOffersListLabels';

interface ActiveOffersCardContentProps {
  offers: InternshipOffer[];
}

const ActiveOffersCardContent: FunctionComponent<ActiveOffersCardContentProps> = ({ offers }) => {
  const { emptyOffersTitle, tableColumn } = useOffersListLabels();

  if (offers.length === 0) {
    return (
      <div className="px-4 pb-6 sm:px-6">
        <AdminEmptyState title={emptyOffersTitle} />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 px-4 pb-3 pt-0 sm:px-6 lg:hidden">
        {offers.map((offer) => (
          <AdminMobileRowCard
            key={offer.id}
            title={<SafeText as="span">{offer.title}</SafeText>}
            badges={<span className={adminBadgeClass('success', ADMIN_TABLE_BADGE)}>{<OfferStatusLabel status={offer.status} />}</span>}
            fields={[
              { label: tableColumn('company'), value: <SafeCompanyCell>{offer.company}</SafeCompanyCell> },
              { label: tableColumn('applicants'), value: <span className="tabular-nums">{offer.applicants}</span> },
            ]}
          />
        ))}
      </div>

      <div className="admin-module-table-wrap hidden min-w-0 px-4 pb-6 pt-0 sm:px-6 lg:block">
        <AdminTableScroll minWidth="640px" className="admin-table-scroll--panel">
          <thead>
            <tr>
              <th className={ADMIN_TABLE_COL.title}>{tableColumn('title')}</th>
              <th className={ADMIN_TABLE_COL.company}>{tableColumn('company')}</th>
              <th className={ADMIN_TABLE_COL.applicants}>{tableColumn('applicants')}</th>
              <th className={ADMIN_TABLE_COL.status}>{tableColumn('status')}</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id}>
                <td className="font-medium"><SafeTitleCell>{offer.title}</SafeTitleCell></td>
                <td><SafeCompanyCell>{offer.company}</SafeCompanyCell></td>
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
