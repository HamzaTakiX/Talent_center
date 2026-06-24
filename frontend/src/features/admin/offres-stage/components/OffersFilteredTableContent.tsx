import { FunctionComponent } from 'react';
import { Users } from 'lucide-react';
import type { InternshipOffer } from '../types';
import AdminMobileRowCard from '../../shared/AdminMobileRowCard';
import { AdminSearchEmptyState, AdminTableEmptyState, AdminTableScroll } from '../../ui';
import { OfferStatusLabel } from '../../ui/adminTableLabels';
import { offerStatusTableBadge } from '../../ui/adminStatusBadges';
import { SafeTitleCell, SafeCompanyCell, SafeText, ADMIN_TABLE_COL } from '../../../../design-system/safeContent';
import InternshipOfferActions from './InternshipOfferActions';
import { useOffersListLabels } from '../hooks/useOffersListLabels';

interface OffersFilteredTableContentProps {
  offers: InternshipOffer[];
  onRefresh?: () => void | Promise<void>;
}

const OffersFilteredTableContent: FunctionComponent<OffersFilteredTableContentProps> = ({
  offers,
  onRefresh,
}) => {
  const { emptyOffersTitle, tableColumn } = useOffersListLabels();

  return (
    <>
      <div className="space-y-3 px-4 pb-3 pt-0 sm:px-6 lg:hidden">
        {offers.length === 0 ? (
          <AdminSearchEmptyState title={emptyOffersTitle} />
        ) : (
          offers.map((offer) => (
            <AdminMobileRowCard
              key={offer.id}
              title={<SafeText as="span">{offer.title}</SafeText>}
              badges={
                <span className={offerStatusTableBadge(offer.status)}>
                  {<OfferStatusLabel status={offer.status} />}
                </span>
              }
              fields={[
                { label: tableColumn('company'), value: <SafeCompanyCell>{offer.company}</SafeCompanyCell> },
                {
                  label: tableColumn('applicants'),
                  value: (
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4 shrink-0 text-[var(--admin-text-secondary)]" strokeWidth={1.75} aria-hidden />
                      {offer.applicants}
                    </span>
                  ),
                },
                { label: tableColumn('deadline'), value: offer.deadline },
              ]}
              actions={<InternshipOfferActions offer={offer} />}
            />
          ))
        )}
      </div>

      <div className="admin-module-table-wrap admin-offers-table-wrap hidden lg:block">
        <AdminTableScroll minWidth="800px" className="admin-table-scroll--panel">
          <thead>
            <tr className="border-b border-[var(--admin-border)]">
              <th className={`py-2.5 pl-2 pr-4 text-left text-sm font-medium leading-5 text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.title}`}>
                {tableColumn('title')}
              </th>
              <th className={`py-2.5 px-4 text-left text-sm font-medium leading-5 text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.company}`}>
                {tableColumn('company')}
              </th>
              <th className={`py-2.5 px-4 text-left text-sm font-medium leading-5 text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.status}`}>
                {tableColumn('status')}
              </th>
              <th className={`py-2.5 px-4 text-left text-sm font-medium leading-5 text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.applicants}`}>
                {tableColumn('applicants')}
              </th>
              <th className={`py-2.5 px-4 text-left text-sm font-medium leading-5 text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.deadline}`}>
                {tableColumn('deadline')}
              </th>
              <th className={`py-2.5 px-4 text-right text-sm font-medium leading-5 text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.actions}`}>
                {tableColumn('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {offers.length === 0 ? (
              <AdminTableEmptyState colSpan={6} title={emptyOffersTitle} />
            ) : (
              offers.map((offer) => (
                <tr key={offer.id} className="border-b border-[var(--admin-border)] last:border-b-0">
                  <td className="py-3 pl-2 pr-4 align-middle text-sm font-medium leading-5 text-[var(--admin-text)]">
                    <SafeTitleCell>{offer.title}</SafeTitleCell>
                  </td>
                  <td className="py-3 px-4 align-middle text-sm leading-5">
                    <SafeCompanyCell>{offer.company}</SafeCompanyCell>
                  </td>
                  <td className="py-3 px-4 align-middle">
                    <span className={offerStatusTableBadge(offer.status)}>
                      {<OfferStatusLabel status={offer.status} />}
                    </span>
                  </td>
                  <td className="py-3 px-4 align-middle">
                    <div className="flex items-center gap-1.5 text-sm leading-5">
                      <Users className="h-4 w-4 shrink-0 text-[var(--admin-text-secondary)]" strokeWidth={1.75} aria-hidden />
                      <span>{offer.applicants}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 align-middle text-sm leading-5">{offer.deadline}</td>
                  <td className="py-3 px-4 align-middle">
                    <InternshipOfferActions offer={offer} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTableScroll>
      </div>
    </>
  );
};

export default OffersFilteredTableContent;
