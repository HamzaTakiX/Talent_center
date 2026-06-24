import { FunctionComponent } from 'react';
import { useLocation } from 'react-router-dom';
import StudentLayout from '../../../components/StudentLayout';
import CareerCoachWorkspace from '../components/CareerCoachWorkspace';
import { AI_CAREER_COACH_PAGE_ROOT } from '../constants/careerCoachLayout';
import '../../../../admin/offres-stage/chat/styles/internship-support-inbox.css';

interface OfferContextState {
  offerContext?: {
    launchToken?: string;
    offerId?: string;
    title?: string;
    company?: string;
    companyLogoUrl?: string;
    internshipType?: string;
    deadline?: string;
    applicationStatus?: string;
    appliedDate?: string;
    interviewDate?: string;
  };
}

const AiCareerCoachPage: FunctionComponent = () => {
  const location = useLocation();
  const state = location.state as OfferContextState | null;
  const offerContext = state?.offerContext;

  return (
    <StudentLayout mainFillHeight contentFlush>
      <div id="student-ai-career-coach-root" className={AI_CAREER_COACH_PAGE_ROOT}>
        <CareerCoachWorkspace offerContext={offerContext} />
      </div>
    </StudentLayout>
  );
};

export default AiCareerCoachPage;
