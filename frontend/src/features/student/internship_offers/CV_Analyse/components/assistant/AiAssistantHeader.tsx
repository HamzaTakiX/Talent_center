import { FunctionComponent } from 'react';
import { Sparkles } from 'lucide-react';
import {
  CV_ASSISTANT_BETA_BADGE,
  CV_ASSISTANT_HEADER_ICON,
} from '../../constants/cvAiAssistantStyles';
import { CV_ASSISTANT_PANEL_HEADER } from '../../constants/cvAiAssistantLayout';

const AiAssistantHeader: FunctionComponent = () => {
  return (
    <header className={CV_ASSISTANT_PANEL_HEADER}>
      <div className="flex min-w-0 items-center gap-3">
        <span className={CV_ASSISTANT_HEADER_ICON}>
          <Sparkles className="h-5 w-5 text-white sm:h-6 sm:w-6" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="m-0 text-base font-semibold leading-6 text-[var(--admin-text)] sm:text-lg">
            AI CV Assistant
          </h2>
          <p className="m-0 mt-0.5 text-xs leading-4 text-[#6a7282] sm:text-sm sm:leading-5">
            Powered by AI • Business school specialized
          </p>
        </div>
      </div>
      <span className={CV_ASSISTANT_BETA_BADGE}>
        <Sparkles className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
        Beta
      </span>
    </header>
  );
};

export default AiAssistantHeader;
