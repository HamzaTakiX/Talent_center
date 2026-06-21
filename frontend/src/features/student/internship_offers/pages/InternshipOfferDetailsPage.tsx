import { FunctionComponent } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import BackToOffersLink from '../components/BackToOffersLink';
import InternshipOfferDetailsHeader from '../components/details/InternshipOfferDetailsHeader';
import InternshipOfferDetailsMain from '../components/details/InternshipOfferDetailsMain';
import InternshipOfferDetailsSidebar from '../components/details/InternshipOfferDetailsSidebar';
import { InternshipOfferPageLoadingState } from '../components/loading/InternshipOfferPageSkeleton';
import { STUDENT_ALL_INTERNSHIP_OFFERS_PATH } from '../constants/routes';
import { INTERNSHIP_OFFERS_PAGE_ROOT } from '../constants/internshipOffersLayout';
import { useStudentOfferDetail } from '../hooks/useStudentStageOffers';
import StudentLayout from '../../components/StudentLayout';

const InternshipOfferDetailsPage: FunctionComponent = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const { detail: offer, loading, error } = useStudentOfferDetail(offerId);

  if (loading) {
    return <InternshipOfferPageLoadingState variant="details" loadingLabelKey="loadingOfferDetails" />;
  }

  if (error || !offer) {
    return <Navigate to={STUDENT_ALL_INTERNSHIP_OFFERS_PATH} replace />;
  }

  return (
    <StudentLayout>
      <div
        id="student-internship-offer-details-root"
        className={INTERNSHIP_OFFERS_PAGE_ROOT}
      >
        <BackToOffersLink />

        <InternshipOfferDetailsHeader offer={offer} />

        <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)] lg:gap-6">
          <InternshipOfferDetailsMain offer={offer} />
          <InternshipOfferDetailsSidebar offer={offer} />
        </div>
      </div>
    </StudentLayout>
  );
};

export default InternshipOfferDetailsPage;
