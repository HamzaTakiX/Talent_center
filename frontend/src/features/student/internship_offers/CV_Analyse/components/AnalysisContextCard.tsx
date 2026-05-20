import { FunctionComponent } from 'react';
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
  return (
    <article className={CV_TOOL_CONTEXT_CARD}>
      <h2 className={CV_TOOL_SECTION_TITLE}>Analysis Context</h2>
      <p className={CV_TOOL_SECTION_DESC}>Add context to get more relevant analysis results</p>

      <div className="mt-3 flex min-w-0 flex-col gap-2.5 max-[429px]:mt-2.5 sm:mt-4 sm:gap-3">
        <ContextSelectableRow
          label="Select Internship Offer"
          icon={Briefcase}
          highlighted
          onClick={onSelectOffer}
        />
        <input
          type="text"
          readOnly
          value={offerPlaceholder}
          placeholder=""
          aria-label="Selected internship offer"
          className={CV_TOOL_CONTEXT_INPUT}
        />
        <ContextSelectableRow
          label="Attach Additional Document"
          icon={FilePlus}
          onClick={onAttachDocument}
        />
      </div>
    </article>
  );
};

export default AnalysisContextCard;
