import { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import {
  CV_ASSISTANT_INPUT_WRAP,
  CV_ASSISTANT_SEND_BUTTON,
  CV_ASSISTANT_TEXTAREA,
} from '../../constants/cvAiAssistantStyles';
import { CV_AI_ASSISTANT_INPUT_PLACEHOLDER } from '../../data/cvAiAssistantMock';

const AiAssistantComposer: FunctionComponent = () => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');

  return (
    <div
      className={`${CV_ASSISTANT_INPUT_WRAP} max-[429px]:flex-col max-[429px]:gap-2.5 max-[429px]:p-3`}
    >
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={CV_AI_ASSISTANT_INPUT_PLACEHOLDER}
        rows={2}
        className={CV_ASSISTANT_TEXTAREA}
        aria-label={t('student.internshipOffers.cvTool.messageAria')}
      />
      <button
        type="button"
        className={CV_ASSISTANT_SEND_BUTTON}
        aria-label={t('student.internshipOffers.cvTool.sendAria')}
      >
        <Send className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        <span>{t('student.internshipOffers.cvTool.send')}</span>
      </button>
    </div>
  );
};

export default AiAssistantComposer;
