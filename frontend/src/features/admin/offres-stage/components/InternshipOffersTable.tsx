import { FunctionComponent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { useAdminCopy } from '../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import InternshipOfferActions from './InternshipOfferActions';
import InternshipOfferDetailModal from './InternshipOfferDetailModal';
import OfferCompanyLogo from './OfferCompanyLogo';
import type { InternshipOffer } from '../types';
import { adminCrudRoutes } from '../../shared/navigation/adminCrudRoutes';
import InternshipOffersToolbar, { type InternshipOfferStatusFilter } from './InternshipOffersToolbar';
import AdminMobileRowCard from '../../shared/AdminMobileRowCard';
import AdminBadge from '../../ui/AdminBadge';
import AdminModuleHeader from '../../ui/AdminModuleHeader';
import AdminModulePanel from '../../ui/AdminModulePanel';
import {
  AdminMobileTableSkeleton,
  AdminSearchEmptyState,
  AdminTableEmptyState,
  AdminTableScroll,
  AdminTableSkeletonRows,
} from '../../ui';
import { useStageOffersByStatus } from '../hooks/useStageOffers';
import { SafeTitleCell, SafeCompanyCell, SafeText, ADMIN_TABLE_COL } from '../../../../design-system/safeContent';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  Active: 'success',
  Draft: 'warning',
  Expired: 'danger',
  Closed: 'neutral',
};

const InternshipOffersTable: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { tableColumn, emptyState, filterLabel } = useAdminCopy();
  const { offerStatus } = useAdminTableValues();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InternshipOfferStatusFilter>('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [viewOffer, setViewOffer] = useState<InternshipOffer | null>(null);

  const { items: allOffers, loading, error, refresh } = useStageOffersByStatus(statusFilter, search);

  const companyOptions = useMemo(() => {
    const companies = [...new Set(allOffers.map((o) => o.company))].sort();
    return [
      { value: 'all', label: filterLabel('allCompanies') },
      ...companies.map((c) => ({ value: c, label: c })),
    ];
  }, [allOffers, filterLabel]);

  const filteredOffers = useMemo(() => {
    return allOffers.filter((offer) => {
      const matchCompany = companyFilter === 'all' || offer.company === companyFilter;
      return matchCompany;
    });
  }, [allOffers, companyFilter]);

  return (
    <>
      <InternshipOfferDetailModal
        open={viewOffer != null}
        offer={viewOffer}
        onClose={() => setViewOffer(null)}
        onEdit={(id) => {
          setViewOffer(null);
          navigate(adminCrudRoutes.internshipOfferEdit(id));
        }}
      />
    <AdminModulePanel
      header={
        <AdminModuleHeader
          title={t('admin.modules.offers.title')}
          subtitle={t('admin.modules.offers.subtitle')}
          layout="toolbar"
          actions={
            <InternshipOffersToolbar
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              companyFilter={companyFilter}
              onCompanyFilterChange={setCompanyFilter}
              companyOptions={companyOptions}
            />
          }
        />
      }
    >
      {error && (
        <p className="px-4 py-2 text-sm text-[var(--admin-danger)]" role="alert">
          {error}
        </p>
      )}
      <div className="space-y-3 px-4 pb-6 sm:px-6 lg:hidden">
        {loading ? (
          <AdminMobileTableSkeleton count={4} />
        ) : filteredOffers.length === 0 ? (
          <AdminSearchEmptyState title={emptyState('offersFilters')} />
        ) : (
          filteredOffers.map((offer) => (
            <AdminMobileRowCard
              key={offer.id}
              title={
                <span className="flex items-center gap-3">
                  <OfferCompanyLogo url={offer.companyLogoUrl} companyName={offer.company} size="card" />
                  <SafeText as="span">{offer.title}</SafeText>
                </span>
              }
              badges={
                <AdminBadge variant={statusVariant[offer.status] ?? 'neutral'}>{offerStatus(offer.status)}</AdminBadge>
              }
              fields={[
                { label: tableColumn('company'), value: <SafeCompanyCell>{offer.company}</SafeCompanyCell> },
                {
                  label: tableColumn('applicants'),
                  value: (
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4 shrink-0 text-[var(--admin-text-muted)]" strokeWidth={1.75} aria-hidden />
                      {offer.applicants}
                    </span>
                  ),
                },
                { label: tableColumn('deadline'), value: offer.deadline },
              ]}
              actions={
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end [&_button]:w-full sm:[&_button]:w-auto">
                  <InternshipOfferActions offer={offer} onView={setViewOffer} onRefresh={refresh} />
                </div>
              }
            />
          ))
        )}
      </div>

      <div className="admin-module-table-wrap admin-offers-table-wrap hidden px-4 pb-6 lg:block lg:px-6">
        <AdminTableScroll minWidth="800px" className="admin-table-scroll--panel">
          <thead>
            <tr>
              <th className={ADMIN_TABLE_COL.image}>{tableColumn('image')}</th>
              <th className={ADMIN_TABLE_COL.title}>{tableColumn('title')}</th>
              <th className={ADMIN_TABLE_COL.company}>{tableColumn('company')}</th>
              <th className={ADMIN_TABLE_COL.status}>{tableColumn('status')}</th>
              <th className={ADMIN_TABLE_COL.applicants}>{tableColumn('applicants')}</th>
              <th className={ADMIN_TABLE_COL.deadline}>{tableColumn('deadline')}</th>
              <th className={`text-end ${ADMIN_TABLE_COL.actions}`}>{tableColumn('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <AdminTableSkeletonRows colSpan={7} rows={8} />
            ) : filteredOffers.length === 0 ? (
              <AdminTableEmptyState colSpan={7} title={emptyState('offersFilters')} />
            ) : (
              filteredOffers.map((offer) => (
                <tr key={offer.id}>
                  <td>
                    <OfferCompanyLogo url={offer.companyLogoUrl} companyName={offer.company} />
                  </td>
                  <td className="admin-offers-table__title font-medium">
                    <SafeTitleCell>{offer.title}</SafeTitleCell>
                  </td>
                  <td><SafeCompanyCell>{offer.company}</SafeCompanyCell></td>
                  <td>
                    <AdminBadge variant={statusVariant[offer.status] ?? 'neutral'}>{offerStatus(offer.status)}</AdminBadge>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 shrink-0 text-[var(--admin-text-muted)]" strokeWidth={1.75} />
                      <span>{offer.applicants}</span>
                    </div>
                  </td>
                  <td>{offer.deadline}</td>
                  <td className="text-right">
                    <InternshipOfferActions offer={offer} onView={setViewOffer} onRefresh={refresh} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTableScroll>
      </div>
    </AdminModulePanel>
    </>
  );
};

export default InternshipOffersTable;
