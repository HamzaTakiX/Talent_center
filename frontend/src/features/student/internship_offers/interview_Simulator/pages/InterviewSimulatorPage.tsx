import { FunctionComponent } from 'react';
import StudentLayout from '../../../components/StudentLayout';
import InterviewSimulatorDashboard from '../components/dashboard/InterviewSimulatorDashboard';

const InterviewSimulatorPage: FunctionComponent = () => {
  return (
    <StudentLayout>
      <div id="student-interview-simulator-root" className="mx-auto w-full min-w-0 max-w-[1600px] pb-4">
        <InterviewSimulatorDashboard />
      </div>
    </StudentLayout>
  );
};

export default InterviewSimulatorPage;
