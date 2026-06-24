import { FunctionComponent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Briefcase,
  Building2,
  Calendar,
  CircleDot,
  ClipboardCheck,
  MoreHorizontal,
  Users,
} from 'lucide-react';
import { useAdminCopy } from '../../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../../i18n/useAdminTableValues';
import DraftInternshipOfferActions from './DraftInternshipOfferActions';
import DraftOfferReadinessBadge from './DraftOfferReadinessBadge';
import InternshipOfferDetailModal from '../../components/InternshipOfferDetailModal';
import type { InternshipOffer } from '../../types';
import { adminCrudRoutes } from '../../../shared/navigation/adminCrudRoutes';
import InternshipOffersDraftsToolbar from './InternshipOffersDraftsToolbar';
import { filterDraftOffers, type DraftOfferFilter } from '../utils/filterDraftOffers';
import { applyOfferListFilters } from '../../utils/filterOfferList';
import type { OfferApplicantsFilter, OfferDeadlineFilter } from '../../hooks/useOfferListFilterLabels';
import InternshipOffersTableHeadCell from '../../components/InternshipOffersTableHeadCell';
import AdminMobileRowCard from '../../../shared/AdminMobileRowCard';
import AdminBadge from '../../../ui/AdminBadge';
import InternshipOffersSectionHeader from '../../components/InternshipOffersSectionHeader';
import AdminModulePanel from '../../../ui/AdminModulePanel';
import {
  AdminMobileTableSkeleton,
  AdminSearchEmptyState,
  AdminTableEmptyState,
  AdminTableScroll,
  AdminTableSkeletonRows,
} from '../../../ui';
import { useStageDraftOffersList } from '../../hooks/useStageOffers';
import { SafeTitleCell, SafeCompanyCell, SafeText, ADMIN_TABLE_COL } from '../../../../../design-system/safeContent';

const InternshipOffersDraftsTable: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { tableColumn, emptyState } = useAdminCopy();
  const { offerStatus } = useAdminTableValues();
  const [search, setSearch] = useState('');
  const [draftFilter, setDraftFilter] = useState<DraftOfferFilter>('all');
  const [deadlineFilter, setDeadlineFilter] = useState<OfferDeadlineFilter>('all');
  const [applicantsFilter, setApplicantsFilter] = useState<OfferApplicantsFilter>('all');
  const [viewOffer, setViewOffer] = useState<InternshipOffer | null>(null);

  const { items: allDraftOffers, loading, error, refresh } = useStageDraftOffersList(search);

  const offers = useMemo(() => {
    const byDraft = filterDraftOffers(allDraftOffers, draftFilter);
    return applyOfferListFilters(byDraft, { deadline: deadlineFilter, applicants: applicantsFilter });
  }, [allDraftOffers, draftFilter, deadlineFilter, applicantsFilter]);

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
        className="admin-offers-module-panel admin-offers-module-panel--drafts"
        header={
          <InternshipOffersSectionHeader
            variant="drafts"
            title={t('admin.modules.offers.draftsPage.title')}
            subtitle={t('admin.modules.offers.draftsPage.subtitle')}
            itemCount={offers.length}
            loading={loading}
            actions={
              <InternshipOffersDraftsToolbar
                search={search}
                onSearchChange={setSearch}
                draftFilter={draftFilter}
                onDraftFilterChange={setDraftFilter}
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
                title={<SafeText as="span">{offer.title}</SafeText>}
                badges={
                  <>
                    <AdminBadge variant="warning">{offerStatus(offer.status)}</AdminBadge>
                    <DraftOfferReadinessBadge
                      score={offer.publishReadinessScore}
                      ready={offer.publishReady}
                    />
                  </>
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
                  <DraftInternshipOfferActions offer={offer} onView={setViewOffer} onRefresh={refresh} />
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
                  icon={ClipboardCheck}
                  label={t('admin.modules.offers.draftsPage.readiness.column')}
                  className="whitespace-nowrap"
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
                  className={`text-end ${ADMIN_TABLE_COL.actionsDraft}`}
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
                    <td className="admin-offers-table__title font-medium">
                      <SafeTitleCell>{offer.title}</SafeTitleCell>
                    </td>
                    <td><SafeCompanyCell>{offer.company}</SafeCompanyCell></td>
                    <td>
                      <AdminBadge variant="warning">{offerStatus(offer.status)}</AdminBadge>
                    </td>
                    <td>
                      <DraftOfferReadinessBadge
                        score={offer.publishReadinessScore}
                        ready={offer.publishReady}
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 shrink-0 text-[var(--admin-text-muted)]" strokeWidth={1.75} />
                        <span>{offer.applicants}</span>
                      </div>
                    </td>
                    <td>{offer.deadline}</td>
                    <td className="admin-offers-table__actions">
                      <DraftInternshipOfferActions offer={offer} onView={setViewOffer} onRefresh={refresh} />
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

export default InternshipOffersDraftsTable;
