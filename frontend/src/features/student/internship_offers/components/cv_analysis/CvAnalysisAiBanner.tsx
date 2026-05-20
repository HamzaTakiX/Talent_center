import { FunctionComponent } from 'react';
import { Sparkles } from 'lucide-react';

const CvAnalysisAiBanner: FunctionComponent = () => {
  return (
    <section className="box-border w-full min-w-0 max-w-full rounded-[12px] border border-solid border-[#e9d5ff] bg-[#faf5ff] px-4 py-4 sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-start gap-2.5">
        <Sparkles className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#7c3aed]" strokeWidth={1.75} aria-hidden />
        <div className="min-w-0">
          <p className="m-0 text-sm font-semibold leading-5 text-[#6b21a8] sm:text-base">
            AI-Powered Analysis
          </p>
          <p className="m-0 mt-1 text-sm leading-5 text-[#7c3aed]">
            Based on your profile, experience, and the internship requirements
          </p>
        </div>
      </div>
    </section>
  );
};

export default CvAnalysisAiBanner;
