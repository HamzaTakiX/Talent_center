import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, FilePlus } from 'lucide-react';
import ContextSelectableRow from './ContextSelectableRow';
import {
  CV_TOOL_CONTEXT_CARD,
  CV_TOOL_CONTEXT_INPUT,
  CV_TOOL_SECTION_DESC,
  CV_TOOL_SECTION_TITLE,
} from '../constants/cvAnalysisToolStyles';

interface AnalysisContextCardProps {
  offerPlaceholder?: string;
  onSelectOffer?: () => void;
  onAttachDocument?: () => void;
}

const AnalysisContextCard: FunctionComponent<AnalysisContextCardProps> = ({
  offerPlaceholder = '',
  onSelectOffer,
  onAttachDocument,
}) => {
  const { t } = useTranslation();

  return (
    <article className={CV_TOOL_CONTEXT_CARD}>
      <h2 className={CV_TOOL_SECTION_TITLE}>{t('student.internshipOffers.cvTool.context')}</h2>
      <p className={CV_TOOL_SECTION_DESC}>{t('student.internshipOffers.cvTool.contextDesc')}</p>

      <div className="mt-3 flex min-w-0 flex-col gap-2.5 max-[429px]:mt-2.5 sm:mt-4 sm:gap-3">
        <ContextSelectableRow
          label={t('student.internshipOffers.cvTool.selectOffer')}
          icon={Briefcase}
          highlighted
          onClick={onSelectOffer}
        />
        <input
          type="text"
          readOnly
          value={offerPlaceholder}
          placeholder=""
          aria-label={t('student.internshipOffers.cvTool.selectedOfferAria')}
          className={CV_TOOL_CONTEXT_INPUT}
        />
        <ContextSelectableRow
          label={t('student.internshipOffers.cvTool.attachDoc')}
          icon={FilePlus}
          onClick={onAttachDocument}
        />
      </div>
    </article>
  );
};

export default AnalysisContextCard;
