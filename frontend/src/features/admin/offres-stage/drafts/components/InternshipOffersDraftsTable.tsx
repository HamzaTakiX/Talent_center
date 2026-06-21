import { FunctionComponent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { useAdminCopy } from '../../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../../i18n/useAdminTableValues';
import DraftInternshipOfferActions from './DraftInternshipOfferActions';
import DraftOfferReadinessBadge from './DraftOfferReadinessBadge';
import InternshipOfferDetailModal from '../../components/InternshipOfferDetailModal';
import type { InternshipOffer } from '../../types';
import { adminCrudRoutes } from '../../../shared/navigation/adminCrudRoutes';
import InternshipOffersDraftsToolbar from './InternshipOffersDraftsToolbar';
import AdminMobileRowCard from '../../../shared/AdminMobileRowCard';
import AdminBadge from '../../../ui/AdminBadge';
import AdminModuleHeader from '../../../ui/AdminModuleHeader';
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
  const { tableColumn, emptyState, filterLabel } = useAdminCopy();
  const { offerStatus } = useAdminTableValues();
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [viewOffer, setViewOffer] = useState<InternshipOffer | null>(null);

  const { items: allOffers, loading, error, refresh } = useStageDraftOffersList(search);

  const companyOptions = useMemo(() => {
    const companies = [...new Set(allOffers.map((o) => o.company))].sort();
    return [
      { value: 'all', label: filterLabel('allCompanies') },
      ...companies.map((c) => ({ value: c, label: c })),
    ];
  }, [allOffers, filterLabel]);

  const filteredOffers = useMemo(() => {
    return allOffers.filter((offer) => companyFilter === 'all' || offer.company === companyFilter);
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
            title={t('admin.modules.offers.draftsPage.title')}
            subtitle={t('admin.modules.offers.draftsPage.subtitle')}
            layout="toolbar"
            actions={
              <InternshipOffersDraftsToolbar
                search={search}
                onSearchChange={setSearch}
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
                  <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end [&_button]:w-full sm:[&_button]:w-auto">
                    <DraftInternshipOfferActions offer={offer} onView={setViewOffer} onRefresh={refresh} />
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
                <th className={ADMIN_TABLE_COL.title}>{tableColumn('title')}</th>
                <th className={ADMIN_TABLE_COL.company}>{tableColumn('company')}</th>
                <th className={ADMIN_TABLE_COL.status}>{tableColumn('status')}</th>
                <th className="whitespace-nowrap">{t('admin.modules.offers.draftsPage.readiness.column')}</th>
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
                    <td className="text-right">
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
