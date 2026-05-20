import { FunctionComponent } from 'react';
import { CheckCircle2, FileText } from 'lucide-react';
import type { CvAiAssistantCvSummary } from '../../types/cvAiAssistant';
import {
  CV_ASSISTANT_CV_PREVIEW,
  CV_ASSISTANT_YOUR_CV_CARD,
  CV_ASSISTANT_ICON_BOX,
  CV_ASSISTANT_SECTION_TITLE,
} from '../../constants/cvAiAssistantStyles';

interface AssistantYourCvCardProps {
  cv: CvAiAssistantCvSummary;
}

const AssistantYourCvCard: FunctionComponent<AssistantYourCvCardProps> = ({ cv }) => {
  return (
    <article className={CV_ASSISTANT_YOUR_CV_CARD}>
      <h2 className={CV_ASSISTANT_SECTION_TITLE}>Your CV</h2>
      <div className={`${CV_ASSISTANT_CV_PREVIEW} mt-3 max-[429px]:mt-2.5`}>
        <span className={CV_ASSISTANT_ICON_BOX}>
          <FileText className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1 pr-1 sm:pr-1.5">
          <p className="m-0 break-words text-sm font-semibold leading-4 text-[var(--admin-text)] sm:truncate">
            {cv.fileName}
          </p>
          <p className="m-0 mt-0.5 text-xs leading-4 text-[#6a7282]">{cv.updatedLabel}</p>
        </div>
        <CheckCircle2
          className="h-[18px] w-[18px] shrink-0 text-[#22c55e] sm:h-5 sm:w-5"
          fill="currentColor"
          stroke="white"
          strokeWidth={2}
          aria-hidden
        />
      </div>
    </article>
  );
};

export default AssistantYourCvCard;
