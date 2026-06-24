import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Briefcase,
  Building2,
  Calendar,
  CircleDot,
  Image as ImageIcon,
  MoreHorizontal,
  Users,
} from 'lucide-react';
import { useAdminCopy } from '../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import InternshipOfferActions from './InternshipOfferActions';
import OfferCompanyLogo from './OfferCompanyLogo';
import InternshipOffersToolbar, { type InternshipOfferStatusFilter } from './InternshipOffersToolbar';
import InternshipOffersTableHeadCell from './InternshipOffersTableHeadCell';
import AdminMobileRowCard from '../../shared/AdminMobileRowCard';
import AdminBadge from '../../ui/AdminBadge';
import InternshipOffersSectionHeader from './InternshipOffersSectionHeader';
import AdminModulePanel from '../../ui/AdminModulePanel';
import {
  AdminMobileTableSkeleton,
  AdminSearchEmptyState,
  AdminTableEmptyState,
  AdminTableScroll,
  AdminTableSkeletonRows,
} from '../../ui';
import { useStageOffersByStatus } from '../hooks/useStageOffers';
import { applyOfferListFilters } from '../utils/filterOfferList';
import type { OfferApplicantsFilter, OfferDeadlineFilter } from '../hooks/useOfferListFilterLabels';
import { SafeTitleCell, SafeCompanyCell, SafeText, ADMIN_TABLE_COL } from '../../../../design-system/safeContent';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  Active: 'success',
  Draft: 'warning',
  Expired: 'danger',
  Closed: 'neutral',
  Archived: 'neutral',
};

const InternshipOffersTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const { tableColumn, emptyState } = useAdminCopy();
  const { offerStatus } = useAdminTableValues();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InternshipOfferStatusFilter>('all');
  const [deadlineFilter, setDeadlineFilter] = useState<OfferDeadlineFilter>('all');
  const [applicantsFilter, setApplicantsFilter] = useState<OfferApplicantsFilter>('all');

  const { items: rawOffers, loading, error, refresh } = useStageOffersByStatus(statusFilter, search);

  const offers = useMemo(
    () => applyOfferListFilters(rawOffers, { deadline: deadlineFilter, applicants: applicantsFilter }),
    [rawOffers, deadlineFilter, applicantsFilter],
  );

  return (
    <AdminModulePanel
      className="admin-offers-module-panel admin-offers-module-panel--offers"
      header={
        <InternshipOffersSectionHeader
          variant="offers"
          title={t('admin.modules.offers.title')}
          subtitle={t('admin.modules.offers.subtitle')}
          itemCount={offers.length}
          loading={loading}
          actions={
            <InternshipOffersToolbar
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              deadlineFilter={deadlineFilter}
              onDeadlineFilterChange={setDeadlineFilter}
              applicantsFilter={applicantsFilter}
              onApplicantsFilterChange={setApplicantsFilter}
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
        ) : offers.length === 0 ? (
          <AdminSearchEmptyState title={emptyState('offersFilters')} />
        ) : (
          offers.map((offer) => (
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
                <div className="flex justify-end">
                  <InternshipOfferActions offer={offer} />
                </div>
              }
            />
          ))
        )}
      </div>

      <div className="admin-module-table-wrap admin-offers-table-wrap hidden px-4 pb-6 lg:block lg:px-6">
        <AdminTableScroll className="admin-table-scroll--panel admin-table-scroll--fit">
          <thead className="admin-offers-table__head">
            <tr>
              <InternshipOffersTableHeadCell
                icon={ImageIcon}
                label={tableColumn('image')}
                className={ADMIN_TABLE_COL.image}
              />
              <InternshipOffersTableHeadCell
                icon={Briefcase}
                label={tableColumn('title')}
                className={ADMIN_TABLE_COL.title}
              />
              <InternshipOffersTableHeadCell
                icon={Building2}
                label={tableColumn('company')}
                className={ADMIN_TABLE_COL.company}
              />
              <InternshipOffersTableHeadCell
                icon={CircleDot}
                label={tableColumn('status')}
                className={ADMIN_TABLE_COL.status}
              />
              <InternshipOffersTableHeadCell
                icon={Users}
                label={tableColumn('applicants')}
                className={ADMIN_TABLE_COL.applicants}
              />
              <InternshipOffersTableHeadCell
                icon={Calendar}
                label={tableColumn('deadline')}
                className={ADMIN_TABLE_COL.deadline}
              />
              <InternshipOffersTableHeadCell
                icon={MoreHorizontal}
                label={tableColumn('actions')}
                className={`text-end ${ADMIN_TABLE_COL.actionsMenu}`}
              />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <AdminTableSkeletonRows colSpan={7} rows={8} />
            ) : offers.length === 0 ? (
              <AdminTableEmptyState colSpan={7} title={emptyState('offersFilters')} />
            ) : (
              offers.map((offer) => (
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
                  <td className="admin-offers-table__actions">
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
