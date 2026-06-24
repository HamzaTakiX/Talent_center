import { FunctionComponent } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import BackToOffersLink from '../components/BackToOffersLink';
import InternshipOfferDetailsHeader from '../components/details/InternshipOfferDetailsHeader';
import InternshipOfferDetailsMain from '../components/details/InternshipOfferDetailsMain';
import InternshipOfferDetailsSidebar from '../components/details/InternshipOfferDetailsSidebar';
import OfferAiCoachPanel from '../components/details/OfferAiCoachPanel';
import { InternshipOfferPageLoadingState } from '../components/loading/InternshipOfferPageSkeleton';
import { STUDENT_INTERNSHIP_OFFERS_PATH } from '../constants/routes';
import { DETAILS_PAGE_SECTION_GAP } from '../constants/internshipOfferDetailsStyles';
import { INTERNSHIP_OFFERS_PAGE_ROOT } from '../constants/internshipOffersLayout';
import { useStudentOfferDetail } from '../hooks/useStudentStageOffers';
import StudentLayout from '../../components/StudentLayout';

const InternshipOfferDetailsPage: FunctionComponent = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const { detail: offer, loading, error } = useStudentOfferDetail(offerId);

  if (loading) {
    return <InternshipOfferPageLoadingState variant="details" loadingLabelKey="loadingOfferDetails" />;
  }

  if (error || !offer || !offerId) {
    return <Navigate to={STUDENT_INTERNSHIP_OFFERS_PATH} replace />;
  }

  return (
    <StudentLayout>
      <div
        id="student-internship-offer-details-root"
        className={`${INTERNSHIP_OFFERS_PAGE_ROOT} ${DETAILS_PAGE_SECTION_GAP}`}
      >
        <BackToOffersLink />
        <InternshipOfferDetailsHeader offer={offer} />
        <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(260px,1fr)] lg:gap-6">
          <InternshipOfferDetailsMain offer={offer} />
          <InternshipOfferDetailsSidebar offer={offer} />
        </div>
        <OfferAiCoachPanel offer={offer} />
      </div>
    </StudentLayout>
  );
};

export default InternshipOfferDetailsPage;
