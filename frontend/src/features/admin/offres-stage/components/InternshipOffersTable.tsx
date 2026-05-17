import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { useAdminCopy, useAdminSearchPlaceholder } from '../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import { internshipOffersMockData } from '../data/internshipOffersMockData';
import InternshipOfferActions from './InternshipOfferActions';
import InternshipOffersToolbar, { type InternshipOfferStatusFilter } from './InternshipOffersToolbar';
import AdminMobileRowCard from '../../shared/AdminMobileRowCard';
import AdminBadge from '../../ui/AdminBadge';
import AdminModuleHeader from '../../ui/AdminModuleHeader';
import AdminModulePanel from '../../ui/AdminModulePanel';
import { AdminSearchEmptyState, AdminTableEmptyState, AdminTableScroll } from '../../ui';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  Active: 'success',
  Draft: 'warning',
  Expired: 'danger',
  Closed: 'neutral',
};

const InternshipOffersTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const { tableColumn, emptyState, filterLabel } = useAdminCopy();
  const { offerStatus } = useAdminTableValues();
  const searchPh = useAdminSearchPlaceholder('offers');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InternshipOfferStatusFilter>('all');
  const [companyFilter, setCompanyFilter] = useState('all');

  const companyOptions = useMemo(() => {
    const companies = [...new Set(internshipOffersMockData.map((o) => o.company))].sort();
    return [
      { value: 'all', label: filterLabel('allCompanies') },
      ...companies.map((c) => ({ value: c, label: c })),
    ];
  }, [filterLabel]);

  const filteredOffers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return internshipOffersMockData.filter((offer) => {
      const matchStatus = statusFilter === 'all' || offer.status === statusFilter;
      const matchCompany = companyFilter === 'all' || offer.company === companyFilter;
      if (!q) return matchStatus && matchCompany;
      const matchQuery =
        offer.title.toLowerCase().includes(q) ||
        offer.company.toLowerCase().includes(q) ||
        offer.status.toLowerCase().includes(q);
      return matchStatus && matchCompany && matchQuery;
    });
  }, [search, statusFilter, companyFilter]);

  return (
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
      <div className="space-y-3 px-4 pb-6 sm:px-6 lg:hidden">
        {filteredOffers.length === 0 ? (
          <AdminSearchEmptyState title={emptyState('offersFilters')} />
        ) : (
          filteredOffers.map((offer) => (
            <AdminMobileRowCard
              key={offer.id}
              title={offer.title}
              badges={
                <AdminBadge variant={statusVariant[offer.status] ?? 'neutral'}>{offerStatus(offer.status)}</AdminBadge>
              }
              fields={[
                { label: tableColumn('company'), value: offer.company },
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
                  <InternshipOfferActions offer={offer} />
                </div>
              }
            />
          ))
        )}
      </div>

      <div className="admin-module-table-wrap hidden px-4 pb-6 lg:block lg:px-6">
        <AdminTableScroll minWidth="800px" className="admin-table-scroll--panel">
          <thead>
            <tr>
              <th>{tableColumn('title')}</th>
              <th>{tableColumn('company')}</th>
              <th>{tableColumn('status')}</th>
              <th>{tableColumn('applicants')}</th>
              <th>{tableColumn('deadline')}</th>
              <th className="text-end">{tableColumn('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredOffers.length === 0 ? (
              <AdminTableEmptyState colSpan={6} title={emptyState('offersFilters')} />
            ) : (
              filteredOffers.map((offer) => (
                <tr key={offer.id}>
                  <td className="admin-offers-table__title font-medium">{offer.title}</td>
                  <td>{offer.company}</td>
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
                    <InternshipOfferActions offer={offer} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTableScroll>
      </div>
    </AdminModulePanel>
  );
};

export default InternshipOffersTable;
