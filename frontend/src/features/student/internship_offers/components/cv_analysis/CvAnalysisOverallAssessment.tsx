import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Target, TrendingUp } from 'lucide-react';
import { STUDENT_CALLOUT_BRAND } from '../../../design-system/studentSemanticStyles';

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
  const { t } = useTranslation();

  return (
    <section className={`box-border w-full min-w-0 max-w-full ${STUDENT_CALLOUT_BRAND} px-4 py-5 sm:px-6 sm:py-6`}>
      <div className="mb-3 flex min-w-0 items-center gap-2">
        <Sparkles className="h-[18px] w-[18px] shrink-0 text-[var(--admin-brand)]" strokeWidth={1.75} aria-hidden />
        <h2 className="m-0 text-base font-semibold leading-6 text-[var(--admin-text)]">
          {t('student.internshipOffers.cvAnalysis.overall')}
        </h2>
      </div>
      <p className="m-0 text-sm leading-6 text-[var(--admin-text-secondary)] sm:text-[15px]">{assessment}</p>
      <div className="mt-5 flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:gap-8">
        <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-[var(--admin-text)]">
          <Target className="h-4 w-4 shrink-0 text-[var(--admin-brand)]" strokeWidth={2} aria-hidden />
          <span>{t('student.internshipOffers.cvAnalysis.interviewProbability', { value: interviewProbability })}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-[var(--admin-text)]">
          <TrendingUp className="h-4 w-4 shrink-0 text-[var(--admin-brand)]" strokeWidth={2} aria-hidden />
          <span>{t('student.internshipOffers.cvAnalysis.potentialScore', { value: potentialScore })}</span>
        </div>
      </div>
    </section>
  );
};

export default CvAnalysisOverallAssessment;
