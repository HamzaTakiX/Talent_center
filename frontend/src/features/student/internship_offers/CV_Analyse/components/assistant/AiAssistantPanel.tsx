import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import AiAssistantHeader from './AiAssistantHeader';
import AiAssistantMessage from './AiAssistantMessage';
import SuggestedQuestions from './SuggestedQuestions';
import AiAssistantComposer from './AiAssistantComposer';
import AiAssistantActionBar from './AiAssistantActionBar';
import {
  CV_AI_ASSISTANT_MESSAGE,
  CV_AI_ASSISTANT_SUGGESTED_QUESTIONS,
} from '../../data/cvAiAssistantMock';
import { CV_ASSISTANT_MAIN_PANEL } from '../../constants/cvAiAssistantStyles';
import {
  CV_ASSISTANT_PANEL_FOOTER,
  CV_ASSISTANT_PANEL_SCROLL,
} from '../../constants/cvAiAssistantLayout';

const AiAssistantPanel: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <section className={CV_ASSISTANT_MAIN_PANEL} aria-label={t('student.internshipOffers.cvTool.chatAria')}>
      <AiAssistantHeader />

      <div
        className={CV_ASSISTANT_PANEL_SCROLL}
        role="log"
        aria-live="polite"
        aria-label={t('student.internshipOffers.cvTool.conversationAria')}
      >
        <AiAssistantMessage message={CV_AI_ASSISTANT_MESSAGE} />
      </div>

      <div className={CV_ASSISTANT_PANEL_FOOTER}>
        <SuggestedQuestions questions={CV_AI_ASSISTANT_SUGGESTED_QUESTIONS} />
        <AiAssistantComposer />
        <AiAssistantActionBar />
      </div>
    </section>
  );
};

export default AiAssistantPanel;
