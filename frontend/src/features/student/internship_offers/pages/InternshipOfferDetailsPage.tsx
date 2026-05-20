import { FunctionComponent } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import BackToOffersLink from '../components/BackToOffersLink';
import InternshipOfferDetailsHeader from '../components/details/InternshipOfferDetailsHeader';
import InternshipOfferDetailsMain from '../components/details/InternshipOfferDetailsMain';
import InternshipOfferDetailsSidebar from '../components/details/InternshipOfferDetailsSidebar';
import { STUDENT_ALL_INTERNSHIP_OFFERS_PATH } from '../constants/routes';
import { INTERNSHIP_OFFERS_PAGE_ROOT } from '../constants/internshipOffersLayout';
import { getInternshipOfferById } from '../helpers/getInternshipOfferById';

const InternshipOfferDetailsPage: FunctionComponent = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const offer = getInternshipOfferById(offerId);

  if (!offer) {
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
