import { FunctionComponent } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import BackToOfferDetailsLink from '../components/apply/BackToOfferDetailsLink';
import ApplyInternshipHeader from '../components/apply/ApplyInternshipHeader';
import CreateEditCvCard from '../components/apply/CreateEditCvCard';
import UseExistingCvCard from '../components/apply/UseExistingCvCard';
import { STUDENT_ALL_INTERNSHIP_OFFERS_PATH } from '../constants/routes';
import { INTERNSHIP_OFFERS_PAGE_ROOT } from '../constants/internshipOffersLayout';
import { defaultStudentCvFile, getCvEditorFeatures } from '../data/internshipApplyMock';
import { getInternshipOfferById } from '../helpers/getInternshipOfferById';

const ApplyToInternshipPage: FunctionComponent = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const offer = getInternshipOfferById(offerId);

  if (!offer) {
    return <Navigate to={STUDENT_ALL_INTERNSHIP_OFFERS_PATH} replace />;
  }

  const cvFeatures = getCvEditorFeatures(offer.title);

  return (
    <StudentLayout>
      <div
        id="student-apply-internship-root"
        className={INTERNSHIP_OFFERS_PAGE_ROOT}
      >
        <BackToOfferDetailsLink offerId={offer.id} />

        <ApplyInternshipHeader offer={offer} />

        <div className="grid min-w-0 grid-cols-1 items-stretch gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
          <UseExistingCvCard offerId={offer.id} cvFile={defaultStudentCvFile} />
          <CreateEditCvCard offerTitle={offer.title} features={cvFeatures} />
        </div>
      </div>
    </StudentLayout>
  );
};

export default ApplyToInternshipPage;
