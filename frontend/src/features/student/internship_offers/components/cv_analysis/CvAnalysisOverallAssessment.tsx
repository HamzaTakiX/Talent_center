import { FunctionComponent } from 'react';
import { Sparkles, Target, TrendingUp } from 'lucide-react';

interface CvAnalysisOverallAssessmentProps {
  assessment: string;
  interviewProbability: number;
  potentialScore: number;
}

const CvAnalysisOverallAssessment: FunctionComponent<CvAnalysisOverallAssessmentProps> = ({
  assessment,
  interviewProbability,
  potentialScore,
}) => {
  return (
    <section className="box-border w-full min-w-0 max-w-full rounded-[12px] border border-solid border-[#e9d5ff] bg-[#faf5ff] px-4 py-5 sm:px-6 sm:py-6">
      <div className="mb-3 flex min-w-0 items-center gap-2">
        <Sparkles className="h-[18px] w-[18px] shrink-0 text-[#7c3aed]" strokeWidth={1.75} aria-hidden />
        <h2 className="m-0 text-base font-semibold leading-6 text-[#6b21a8]">Overall Assessment</h2>
      </div>
      <p className="m-0 text-sm leading-6 text-[#5b21b6] sm:text-[15px]">{assessment}</p>
      <div className="mt-5 flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:gap-8">
        <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-[#6b21a8]">
          <Target className="h-4 w-4 shrink-0 text-[#9333ea]" strokeWidth={2} aria-hidden />
          <span>Interview Probability: {interviewProbability}%</span>
        </div>
        <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-[#6b21a8]">
          <TrendingUp className="h-4 w-4 shrink-0 text-[#9333ea]" strokeWidth={2} aria-hidden />
          <span>Potential Score: {potentialScore}%</span>
        </div>
      </div>
    </section>
  );
};

export default CvAnalysisOverallAssessment;
