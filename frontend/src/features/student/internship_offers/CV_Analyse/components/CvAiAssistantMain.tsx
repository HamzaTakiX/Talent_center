import { FunctionComponent } from 'react';
import AssistantSidebar from './assistant/AssistantSidebar';
import AiAssistantPanel from './assistant/AiAssistantPanel';
import { CV_ASSISTANT_CHAT_COLUMN, CV_ASSISTANT_GRID } from '../constants/cvAiAssistantLayout';

const CvAiAssistantMain: FunctionComponent = () => {
  return (
    <div className={CV_ASSISTANT_GRID}>
      <AssistantSidebar />
      <div className={CV_ASSISTANT_CHAT_COLUMN}>
        <AiAssistantPanel />
      </div>
    </div>
  );
};

export default CvAiAssistantMain;
