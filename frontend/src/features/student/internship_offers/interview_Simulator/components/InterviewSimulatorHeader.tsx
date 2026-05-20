import { FunctionComponent } from 'react';
import { Users } from 'lucide-react';
import { IS_HEADER, IS_HEADER_ICON } from '../constants/interviewSimulatorStyles';

const InterviewSimulatorHeader: FunctionComponent = () => {
  return (
    <header className={IS_HEADER}>
      <span className={IS_HEADER_ICON} aria-hidden>
        <Users className="h-5 w-5 text-white sm:h-6 sm:w-6" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <h1 className="m-0 text-lg font-semibold leading-7 text-[var(--admin-text)] sm:text-xl">
          AI Interview Simulator
        </h1>
        <p className="m-0 mt-0.5 text-sm leading-5 text-[#6a7282]">Setup your interview context</p>
      </div>
    </header>
  );
};

export default InterviewSimulatorHeader;
