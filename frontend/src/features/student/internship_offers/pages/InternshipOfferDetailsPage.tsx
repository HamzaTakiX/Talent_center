import { FunctionComponent } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import InternshipOfferDetailsHeader from '../components/details/InternshipOfferDetailsHeader';
import InternshipOfferDetailsAbout from '../components/details/InternshipOfferDetailsAbout';
import InternshipOfferDetailsMain from '../components/details/InternshipOfferDetailsMain';
import InternshipOfferDetailsSidebar from '../components/details/InternshipOfferDetailsSidebar';
import OfferAiCoachPanel from '../components/details/OfferAiCoachPanel';
import { InternshipOfferPageLoadingState } from '../components/loading/InternshipOfferPageSkeleton';
import { STUDENT_INTERNSHIP_OFFERS_PATH } from '../constants/routes';
import { DETAILS_PAGE_ROOT } from '../constants/internshipOfferDetailsStyles';
import { useStudentOfferDetail } from '../hooks/useStudentStageOffers';
import StudentLayout from '../../components/StudentLayout';
import '../../../admin/offres-stage/styles/offer-detail-page.css';

const InternshipOfferDetailsPage: FunctionComponent = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const { t } = useTranslation();
  const { detail: offer, loading, error } = useStudentOfferDetail(offerId);

  if (loading) {
    return <InternshipOfferPageLoadingState variant="details" loadingLabelKey="loadingOfferDetails" />;
  }

  if (error || !offer || !offerId) {
    return <Navigate to={STUDENT_INTERNSHIP_OFFERS_PATH} replace />;
  }

  return (
    <StudentLayout>
      <div id="student-internship-offer-details-root" className={DETAILS_PAGE_ROOT}>
        <InternshipOfferDetailsHeader
          offer={offer}
          backTo={STUDENT_INTERNSHIP_OFFERS_PATH}
          backLabel={t('student.internshipOffers.backToOffers')}
        />

        <div className="grid min-w-0 grid-cols-1 items-stretch gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(420px,1.15fr)]">
          <InternshipOfferDetailsAbout offer={offer} className="min-h-0" />
          <InternshipOfferDetailsSidebar offer={offer} />
        </div>

        <InternshipOfferDetailsMain
          offer={offer}
          showAbout={false}
          showRequirements={false}
        />

        <OfferAiCoachPanel offer={offer} />
      </div>
    </StudentLayout>
  );
};

export default InternshipOfferDetailsPage;
