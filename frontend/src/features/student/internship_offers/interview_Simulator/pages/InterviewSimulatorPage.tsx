import { FunctionComponent } from 'react';
import StudentLayout from '../../../components/StudentLayout';
import InterviewSimulatorMain from '../components/InterviewSimulatorMain';
import {
  INTERVIEW_SIMULATOR_PAGE_ROOT,
  INTERVIEW_SIMULATOR_VIEWPORT_SHELL,
} from '../constants/interviewSimulatorLayout';

const InterviewSimulatorPage: FunctionComponent = () => {
  return (
    <StudentLayout
      contentFlush
      headerTitle="Interview Simulator"
      headerSubtitle="Digital Talent Center"
    >
      <div
        id="student-interview-simulator-root"
        className={`${INTERVIEW_SIMULATOR_VIEWPORT_SHELL} ${INTERVIEW_SIMULATOR_PAGE_ROOT}`}
      >
        <InterviewSimulatorMain />
      </div>
    </StudentLayout>
  );
};

export default InterviewSimulatorPage;
