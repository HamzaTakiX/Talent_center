import { FunctionComponent } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import BackToApplicationLink from '../components/cv_analysis/BackToApplicationLink';
import CvAnalysisHeader from '../components/cv_analysis/CvAnalysisHeader';
import { InternshipOfferPageLoadingState } from '../components/loading/InternshipOfferPageSkeleton';
import OfferApplyButton from '../components/OfferApplyButton';
import { STUDENT_INTERNSHIP_OFFERS_PATH } from '../constants/routes';
import { INTERNSHIP_OFFERS_PAGE_ROOT } from '../constants/internshipOffersLayout';
import { useStudentOfferDetail } from '../hooks/useStudentStageOffers';

const CvAnalysisPage: FunctionComponent = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const { detail: offer, loading } = useStudentOfferDetail(offerId);

  if (loading) {
    return <InternshipOfferPageLoadingState variant="apply" loadingLabelKey="loadingCvAnalysis" />;
  }

  if (!offer) {
    return <Navigate to={STUDENT_INTERNSHIP_OFFERS_PATH} replace />;
  }

  return (
    <StudentLayout>
      <div id="student-cv-analysis-root" className={INTERNSHIP_OFFERS_PAGE_ROOT}>
        <BackToApplicationLink offerId={offer.id} />
        <CvAnalysisHeader offer={offer} />
        <div className="mt-6 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-6 py-8 text-center">
          <p className="m-0 text-sm text-[var(--admin-text-secondary)]">
            Lancez l&apos;analyse CV depuis l&apos;outil dédié ou postulez directement avec votre CV enregistré.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className="admin-btn-primary px-4 py-2 text-sm"
              onClick={() => navigate('/student/internship-offers/cv-analysis-tool')}
            >
              Ouvrir l&apos;outil d&apos;analyse
            </button>
            <OfferApplyButton
              offerId={offer.id}
              externalUrl={offer.externalUrl}
              applicationMethod={offer.applicationMethod}
              offerTitle={offer.title}
              className="admin-btn-secondary px-4 py-2 text-sm"
            >
              Postuler
            </OfferApplyButton>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default CvAnalysisPage;
