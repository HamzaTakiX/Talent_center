import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminCrudRoutes } from '../../../../shared/navigation/adminCrudRoutes';
import { Eye, Edit, Users } from 'lucide-react';
import type { AllOfferRow } from '../data/allOffersMockData';
import AdminMobileRowCard from '../../../../shared/AdminMobileRowCard';
import { AdminSearchEmptyState, AdminTableEmptyState, AdminTableScroll } from '../../../../ui';
import { OfferStatusLabel } from '../../../../ui/adminTableLabels';
import { offerStatusTableBadge } from '../../../../ui/adminStatusBadges';

import { adminTableBtn, adminTableBtnDanger, adminTableBtnMobile, adminTableBtnMobileDanger, adminTableBtnMobileSuccess, adminTableBtnSuccess } from '../../../../ui/adminTableButtons';

interface AllOffersTableContentProps {
  offers: AllOfferRow[];
}

const AllOffersTableContent: FunctionComponent<AllOffersTableContentProps> = ({ offers }) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="space-y-3 px-4 pb-3 pt-0 sm:px-6 lg:hidden">
        {offers.length === 0 ? (
          <AdminSearchEmptyState title="No offers match your filters." />
        ) : (
          offers.map((offer) => (
            <AdminMobileRowCard
              key={offer.id}
              title={offer.title}
              badges={
                <span
                  className={offerStatusTableBadge(offer.status)}
                >
                  {<OfferStatusLabel status={offer.status} />}
                </span>
              }
              fields={[
                { label: 'Company', value: offer.company },
                {
                  label: 'Applicants',
                  value: (
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4 shrink-0 text-[var(--admin-text-secondary)]" strokeWidth={1.75} aria-hidden />
                      {offer.applicants}
                    </span>
                  )
                },
                { label: 'Deadline', value: offer.deadline }
              ]}
              actions={
                <>
                  <button
                    type="button"
                    className={adminTableBtnMobile}
                    onClick={() => navigate(`/admin/internship-offers/${offer.id}`)}
                  >
                    <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    <span>View</span>
                  </button>
                  <button type="button" className={adminTableBtnMobile} onClick={() => navigate(adminCrudRoutes.internshipOfferEdit(offer.id))}>
                    <Edit className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    <span>Edit</span>
                  </button>
                </>
              }
            />
          ))
        )}
      </div>

      <div className="admin-module-table-wrap hidden lg:block">
        <AdminTableScroll minWidth="800px" className="admin-table-scroll--panel">
          <thead>
            <tr className="border-b border-[var(--admin-border)]">
              <th className="py-2.5 pl-2 pr-4 text-left text-sm font-medium leading-5 text-[var(--admin-text-secondary)]">Title</th>
              <th className="py-2.5 px-4 text-left text-sm font-medium leading-5 text-[var(--admin-text-secondary)]">Company</th>
              <th className="py-2.5 px-4 text-left text-sm font-medium leading-5 text-[var(--admin-text-secondary)]">Status</th>
              <th className="py-2.5 px-4 text-left text-sm font-medium leading-5 text-[var(--admin-text-secondary)]">Applicants</th>
              <th className="py-2.5 px-4 text-left text-sm font-medium leading-5 text-[var(--admin-text-secondary)]">Deadline</th>
              <th className="py-2.5 px-4 text-right text-sm font-medium leading-5 text-[var(--admin-text-secondary)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.length === 0 ? (
              <AdminTableEmptyState colSpan={6} title="No offers match your filters." />
            ) : (
              offers.map((offer) => (
                <tr key={offer.id} className="border-b border-[var(--admin-border)] last:border-b-0">
                  <td className="py-3 pl-2 pr-4 align-middle text-sm font-medium leading-5 text-[var(--admin-text)]">{offer.title}</td>
                  <td className="py-3 px-4 align-middle text-sm leading-5">{offer.company}</td>
                  <td className="py-3 px-4 align-middle">
                    <span
                      className={offerStatusTableBadge(offer.status)}
                    >
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
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button type="button" className={adminTableBtn} onClick={() => navigate(`/admin/internship-offers/${offer.id}`)}>
                        <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                        <span>View</span>
                      </button>
                      <button type="button" className={adminTableBtn} onClick={() => navigate(adminCrudRoutes.internshipOfferEdit(offer.id))}>
                        <Edit className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                        <span>Edit</span>
                      </button>
                    </div>
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

export default AllOffersTableContent;

