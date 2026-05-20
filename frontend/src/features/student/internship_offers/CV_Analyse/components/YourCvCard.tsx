import { FunctionComponent } from 'react';
import { CheckCircle2, FileText, Upload } from 'lucide-react';
import type { CvAnalysisToolCvFile } from '../types';
import {
  CV_TOOL_CV_ICON_BOX,
  CV_TOOL_CV_PREVIEW_CARD,
  CV_TOOL_SECTION_TITLE,
  CV_TOOL_UPLOAD_LINK,
  CV_TOOL_YOUR_CV_CARD,
} from '../constants/cvAnalysisToolStyles';

interface YourCvCardProps {
  cvFile: CvAnalysisToolCvFile;
  onUploadClick?: () => void;
}

const YourCvCard: FunctionComponent<YourCvCardProps> = ({ cvFile, onUploadClick }) => {
  return (
    <article className={CV_TOOL_YOUR_CV_CARD}>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <h2 className={CV_TOOL_SECTION_TITLE}>Your CV</h2>
        <button
          type="button"
          className={CV_TOOL_UPLOAD_LINK}
          onClick={onUploadClick}
          aria-label="Upload new CV"
        >
          <Upload className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" strokeWidth={2} aria-hidden />
          <span>Upload New CV</span>
        </button>
      </div>

      <div className={`${CV_TOOL_CV_PREVIEW_CARD} mt-3 max-[429px]:mt-2.5`}>
        <span className={CV_TOOL_CV_ICON_BOX}>
          <FileText className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-px">
          <p className="m-0 break-words text-sm font-semibold leading-4 text-[var(--admin-text)] sm:truncate">
            {cvFile.fileName}
          </p>
          <p className="m-0 text-[11px] font-normal leading-[14px] text-[#6a7282] sm:text-xs sm:leading-4">
            Last updated: {cvFile.lastUpdated}
          </p>
          <p className="m-0 text-[11px] font-normal leading-[14px] text-[#6a7282] sm:text-xs sm:leading-4">
            {cvFile.sizeLabel} • {cvFile.pageCount} pages
          </p>
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

export default YourCvCard;
