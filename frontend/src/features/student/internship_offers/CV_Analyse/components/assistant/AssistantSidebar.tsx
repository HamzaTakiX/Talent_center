import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  return (
    <aside className={CV_ASSISTANT_SIDEBAR} aria-label={t('student.internshipOffers.cvTool.summaryAria')}>
      <AssistantYourCvCard cv={CV_AI_ASSISTANT_CV_SUMMARY} />
      <AssistantContextCard contextLabel={CV_AI_ASSISTANT_CONTEXT_LABEL} />
      <AssistantScoresCard scorePercent={CV_AI_ASSISTANT_SCORE_PERCENT} />
    </aside>
  );
};

export default AssistantSidebar;
