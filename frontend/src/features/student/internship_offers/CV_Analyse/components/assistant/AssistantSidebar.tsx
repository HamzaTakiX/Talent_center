import { FunctionComponent } from 'react';
import AssistantYourCvCard from './AssistantYourCvCard';
import AssistantContextCard from './AssistantContextCard';
import AssistantScoresCard from './AssistantScoresCard';
import {
  CV_AI_ASSISTANT_CONTEXT_LABEL,
  CV_AI_ASSISTANT_CV_SUMMARY,
  CV_AI_ASSISTANT_SCORE_PERCENT,
} from '../../data/cvAiAssistantMock';
import { CV_ASSISTANT_SIDEBAR } from '../../constants/cvAiAssistantLayout';

const AssistantSidebar: FunctionComponent = () => {
  return (
    <aside className={CV_ASSISTANT_SIDEBAR} aria-label="CV analysis summary">
      <AssistantYourCvCard cv={CV_AI_ASSISTANT_CV_SUMMARY} />
      <AssistantContextCard contextLabel={CV_AI_ASSISTANT_CONTEXT_LABEL} />
      <AssistantScoresCard scorePercent={CV_AI_ASSISTANT_SCORE_PERCENT} />
    </aside>
  );
};

export default AssistantSidebar;
