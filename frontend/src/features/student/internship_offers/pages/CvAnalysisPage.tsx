import { FunctionComponent } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import BackToApplicationLink from '../components/cv_analysis/BackToApplicationLink';
import CvAnalysisActionBar from '../components/cv_analysis/CvAnalysisActionBar';
import CvAnalysisAiBanner from '../components/cv_analysis/CvAnalysisAiBanner';
import CvAnalysisColumnsGrid from '../components/cv_analysis/CvAnalysisColumnsGrid';
import CvAnalysisHeader from '../components/cv_analysis/CvAnalysisHeader';
import CvAnalysisOverallAssessment from '../components/cv_analysis/CvAnalysisOverallAssessment';
import CvAnalysisSummaryBanner from '../components/cv_analysis/CvAnalysisSummaryBanner';
import { STUDENT_ALL_INTERNSHIP_OFFERS_PATH } from '../constants/routes';
import { INTERNSHIP_OFFERS_PAGE_ROOT } from '../constants/internshipOffersLayout';
import { getCvAnalysisByOfferId } from '../helpers/getCvAnalysisByOfferId';
import { getInternshipOfferById } from '../helpers/getInternshipOfferById';

const CvAnalysisPage: FunctionComponent = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const offer = getInternshipOfferById(offerId);
  const analysis = getCvAnalysisByOfferId(offerId);

  if (!offer || !analysis) {
    return <Navigate to={STUDENT_ALL_INTERNSHIP_OFFERS_PATH} replace />;
  }

  return (
    <StudentLayout>
      <div id="student-cv-analysis-root" className={INTERNSHIP_OFFERS_PAGE_ROOT}>
        <BackToApplicationLink offerId={offer.id} />
        <CvAnalysisHeader offer={offer} />
        <CvAnalysisSummaryBanner matchScore={analysis.matchScore} />
        <CvAnalysisAiBanner />
        <CvAnalysisColumnsGrid analysis={analysis} />
        <CvAnalysisOverallAssessment
          assessment={analysis.overallAssessment}
          interviewProbability={analysis.interviewProbability}
          potentialScore={analysis.potentialScore}
        />
        <CvAnalysisActionBar offerId={offer.id} />
      </div>
    </StudentLayout>
  );
};

export default CvAnalysisPage;
