import { FunctionComponent } from 'react';
import InterviewSimulatorHeader from './InterviewSimulatorHeader';
import InterviewSimulatorWelcomeMessage from './InterviewSimulatorWelcomeMessage';
import InterviewSimulatorActions from './InterviewSimulatorActions';
import {
  INTERVIEW_SIMULATOR_ACTIONS,
  INTERVIEW_SIMULATOR_WELCOME_MESSAGE,
} from '../data/interviewSimulatorMock';
import { IS_BODY, IS_MAIN_PAGE } from '../constants/interviewSimulatorStyles';

const InterviewSimulatorMain: FunctionComponent = () => {
  return (
    <article className={IS_MAIN_PAGE}>
      <InterviewSimulatorHeader />
      <div className={IS_BODY}>
        <InterviewSimulatorWelcomeMessage paragraphs={INTERVIEW_SIMULATOR_WELCOME_MESSAGE.paragraphs} />
        <InterviewSimulatorActions actions={INTERVIEW_SIMULATOR_ACTIONS} />
      </div>
    </article>
  );
};

export default InterviewSimulatorMain;
