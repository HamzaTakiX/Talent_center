import { FunctionComponent } from 'react';
import StudentLayout from '../../../components/StudentLayout';
import CareerCoachWorkspace from '../components/CareerCoachWorkspace';
import { AI_CAREER_COACH_PAGE_ROOT } from '../constants/careerCoachLayout';

const AiCareerCoachPage: FunctionComponent = () => {
  return (
    <StudentLayout mainFillHeight>
      <div id="student-ai-career-coach-root" className={AI_CAREER_COACH_PAGE_ROOT}>
        <CareerCoachWorkspace />
      </div>
    </StudentLayout>
  );
};

export default AiCareerCoachPage;
