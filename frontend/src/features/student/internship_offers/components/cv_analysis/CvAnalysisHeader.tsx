import { FunctionComponent } from 'react';
import { Building2 } from 'lucide-react';
import type { InternshipOfferDetails } from '../../types';
import { CV_ANALYSIS_CARD } from '../../constants/cvAnalysisStyles';

interface CvAnalysisHeaderProps {
  offer: InternshipOfferDetails;
}

const CvAnalysisHeader: FunctionComponent<CvAnalysisHeaderProps> = ({ offer }) => {
  return (
    <header className={`${CV_ANALYSIS_CARD} box-border w-full min-w-0 max-w-full px-4 py-5 sm:px-6 sm:py-6`}>
      <h1 className="m-0 min-w-0 break-words text-2xl font-semibold leading-8 tracking-tight text-[var(--admin-text)] sm:text-[28px] sm:leading-9">
        CV Analysis
      </h1>
      <p className="m-0 mt-2 text-sm leading-6 text-[var(--admin-text-secondary)] sm:text-base">
        Your CV has been analyzed for compatibility with this position
      </p>
      <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-5 text-[var(--admin-text-secondary)]">
        <Building2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
        <span className="min-w-0 break-words">{offer.title}</span>
        <span className="shrink-0 text-[#99a1af]">•</span>
        <span className="min-w-0 break-words">{offer.company}</span>
      </div>
    </header>
  );
};

export default CvAnalysisHeader;
