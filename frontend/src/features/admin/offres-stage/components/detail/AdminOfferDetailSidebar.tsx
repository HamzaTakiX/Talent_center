import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Fingerprint } from 'lucide-react';
import type { OfferDetailViewModel } from '../../utils/offerDetailViewModel';
import InternshipOfferDetailsKeyFacts from '../../../../student/internship_offers/components/details/InternshipOfferDetailsKeyFacts';
import DetailsSectionCard from '../../../../student/internship_offers/components/details/DetailsSectionCard';
import AdminOfferAnalyticsSection from './AdminOfferAnalyticsSection';
import { DETAILS_PAGE_SECTION_GAP, DETAILS_SECTION_TITLE } from '../../../../student/internship_offers/constants/internshipOfferDetailsStyles';
import type { InternshipOfferDetails } from '../../../../student/internship_offers/types';

const META_PREFIX = 'admin.modules.offers.viewDetail';

interface AdminOfferDetailSidebarProps {
  studentOffer: InternshipOfferDetails;
  viewModel: OfferDetailViewModel;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 border-b border-[var(--admin-border)] py-2.5 last:border-b-0">
      <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">{label}</span>
      <span className="break-all text-sm font-medium text-[var(--admin-text)]">{value}</span>
    </div>
  );
}

const AdminOfferDetailSidebar: FunctionComponent<AdminOfferDetailSidebarProps> = ({
  studentOffer,
  viewModel,
}) => {
  const { t } = useTranslation();

  return (
    <aside className={`${DETAILS_PAGE_SECTION_GAP} lg:sticky lg:top-5 lg:self-start`}>
      <AdminOfferAnalyticsSection viewModel={viewModel} />

      <InternshipOfferDetailsKeyFacts offer={studentOffer} />

      <DetailsSectionCard compact>
        <h2 className={`${DETAILS_SECTION_TITLE} m-0 mb-3 flex items-center gap-2`}>
          <Fingerprint className="h-4 w-4 shrink-0 text-[var(--admin-brand)]" strokeWidth={1.75} aria-hidden />
          {t('admin.modules.offers.detailPage.adminMeta')}
        </h2>
        <MetaRow label={t(`${META_PREFIX}.header.offerId`)} value={viewModel.id} />
        <MetaRow
          label={t(`${META_PREFIX}.header.source`)}
          value={t(`${META_PREFIX}.source.${viewModel.source}`, { defaultValue: viewModel.source })}
        />
        <MetaRow label={t(`${META_PREFIX}.header.created`)} value={viewModel.createdAt || '—'} />
        <MetaRow
          label={t(`${META_PREFIX}.fields.createdBy`)}
          value={viewModel.createdBy || t('admin.forms.createOfferStudio.review.publication.defaultAuthor')}
        />
        {viewModel.referenceCode ? (
          <MetaRow label={t(`${META_PREFIX}.fields.referenceCode`)} value={viewModel.referenceCode} />
        ) : null}
        {viewModel.department ? (
          <MetaRow label={t('admin.forms.createOfferStudio.fields.department')} value={viewModel.department} />
        ) : null}
      </DetailsSectionCard>
    </aside>
  );
};

export default AdminOfferDetailSidebar;
