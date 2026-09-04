import { FunctionComponent, useCallback, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/AdminLayout';
import { useAdminOfferDetailPage } from '../hooks/useAdminOfferDetailPage';
import {
  ADMIN_OFFER_PAGE_SECTIONS,
  InternshipOfferDetailSections,
  OFFER_PUBLICATION_BADGE,
} from '../components/detail/InternshipOfferDetailSections';
import { OFFER_STATUS_BADGE } from '../../ui/adminStatusBadges';
import InternshipOfferEmailPreview from '../components/detail/InternshipOfferEmailPreview';
import OfferApplicantsTableSection from '../components/detail/OfferApplicantsTableSection';
import AdminOfferDetailSidebar from '../components/detail/AdminOfferDetailSidebar';
import type { OfferDetailNavSection } from '../utils/offerDetailViewModel';
import InternshipOfferDetailsHeader from '../../../student/internship_offers/components/details/InternshipOfferDetailsHeader';
import InternshipOfferDetailsMain from '../../../student/internship_offers/components/details/InternshipOfferDetailsMain';
import { DETAILS_PAGE_SECTION_GAP } from '../../../student/internship_offers/constants/internshipOfferDetailsStyles';
import { INTERNSHIP_OFFERS_PAGE_ROOT } from '../../../student/internship_offers/constants/internshipOffersLayout';
import { adminCrudRoutes } from '../../shared/navigation/adminCrudRoutes';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import InternshipOfferPageSkeleton from '../../../student/internship_offers/components/loading/InternshipOfferPageSkeleton';
import '../../../admin/announcements-stage/styles/admin-announcements.css';
import '../styles/offer-detail-modal.css';
import '../styles/offer-detail-page.css';

const ViewInternshipOfferPage: FunctionComponent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { offerStatus } = useAdminTableValues();
  const { loading, error, viewModel, studentOffer, applications } = useAdminOfferDetailPage(id);
  const [activeSection, setActiveSection] = useState<OfferDetailNavSection>('targeting');

  const scrollToSection = useCallback((section: OfferDetailNavSection) => {
    setActiveSection(section);
    const el = document.getElementById(`offer-detail-${section}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  if (!id) {
    return <Navigate to="/admin/internship-offers" replace />;
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className={INTERNSHIP_OFFERS_PAGE_ROOT}>
          <InternshipOfferPageSkeleton variant="details" loadingLabelKey="loadingOfferDetails" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !viewModel || !studentOffer) {
    return <Navigate to="/admin/internship-offers" replace />;
  }

  const publicationBadge = OFFER_PUBLICATION_BADGE[viewModel.publicationStatus] ?? 'neutral';
  const uiStatusBadge = OFFER_STATUS_BADGE[viewModel.uiStatus] ?? 'neutral';

  return (
    <AdminLayout>
      <div
        id="admin-internship-offer-details-root"
        className={`${INTERNSHIP_OFFERS_PAGE_ROOT} ${DETAILS_PAGE_SECTION_GAP}`}
      >
        <InternshipOfferDetailsHeader
          offer={studentOffer}
          mode="admin"
          adminPublicationStatus={t(`admin.modules.offers.viewDetail.status.${viewModel.publicationStatus}`)}
          adminStatusBadgeVariant={publicationBadge}
          adminUiStatusLabel={offerStatus(viewModel.uiStatus)}
          adminUiStatusBadgeVariant={uiStatusBadge}
          onEdit={() => navigate(adminCrudRoutes.internshipOfferEdit(viewModel.id))}
          backTo="/admin/internship-offers"
          backLabel={t('admin.modules.offers.detailPage.backToOffers')}
        />

        <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(260px,1fr)] lg:gap-6">
          <div className={DETAILS_PAGE_SECTION_GAP}>
            <InternshipOfferDetailsMain offer={studentOffer} />

            <InternshipOfferDetailSections
              viewModel={viewModel}
              activeSection={activeSection}
              onSectionChange={scrollToSection}
              includedSections={ADMIN_OFFER_PAGE_SECTIONS}
              presentation="page"
            />

            <InternshipOfferEmailPreview viewModel={viewModel} />
          </div>

          <AdminOfferDetailSidebar studentOffer={studentOffer} viewModel={viewModel} />
        </div>

        <OfferApplicantsTableSection applications={applications} />
      </div>
    </AdminLayout>
  );
};

export default ViewInternshipOfferPage;
