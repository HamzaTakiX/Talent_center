import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil } from 'lucide-react';
import {
  CV_ASSISTANT_CARD,
  CV_ASSISTANT_CONTEXT_PILL,
  CV_ASSISTANT_EDIT_BTN,
  CV_ASSISTANT_SECTION_TITLE,
} from '../../constants/cvAiAssistantStyles';

interface AssistantContextCardProps {
  contextLabel: string;
}

const AssistantContextCard: FunctionComponent<AssistantContextCardProps> = ({ contextLabel }) => {
  const { t } = useTranslation();

  return (
    <article className={CV_ASSISTANT_CARD}>
      <h2 className={CV_ASSISTANT_SECTION_TITLE}>{t('student.internshipOffers.cvTool.context')}</h2>
      <div className="mt-3.5 flex min-w-0 items-center justify-between gap-3 max-[429px]:mt-3">
        <span className={CV_ASSISTANT_CONTEXT_PILL}>{contextLabel}</span>
        <button
          type="button"
          aria-label={t('student.internshipOffers.cvTool.editContextAria')}
          className={CV_ASSISTANT_EDIT_BTN}
        >
          <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </article>
  );
};

export default AssistantContextCard;
