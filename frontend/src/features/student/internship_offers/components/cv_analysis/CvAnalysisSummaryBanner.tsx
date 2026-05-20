import { FunctionComponent } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface CvAnalysisSummaryBannerProps {
  matchScore: number;
}

const CvAnalysisSummaryBanner: FunctionComponent<CvAnalysisSummaryBannerProps> = ({ matchScore }) => {
  return (
    <section className="box-border w-full min-w-0 max-w-full rounded-[12px] border border-solid border-[#bbf7d0] bg-[#f0fdf4] px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#22c55e] text-white">
            <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="m-0 text-base font-semibold leading-6 text-[#166534]">Analysis Complete</p>
            <p className="m-0 mt-1 text-sm leading-5 text-[#15803d]">
              Your CV has been evaluated against the internship requirements
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center self-center rounded-[12px] border border-solid border-[#e5e7eb] bg-[var(--admin-bg-elevated)] px-6 py-4 shadow-[0_4px_16px_rgba(16,24,40,0.08)] sm:self-auto">
          <span className="text-3xl font-bold tabular-nums leading-9 text-[#22c55e] sm:text-4xl">
            {matchScore}%
          </span>
          <span className="mt-0.5 text-xs font-medium uppercase tracking-wide text-[#6a7282]">
            Match Score
          </span>
        </div>
      </div>
    </section>
  );
};

export default CvAnalysisSummaryBanner;
