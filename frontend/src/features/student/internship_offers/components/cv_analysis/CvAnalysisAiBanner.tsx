import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { STUDENT_AI_BANNER } from '../../../design-system/studentSemanticStyles';

const CvAnalysisAiBanner: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <section className={`box-border w-full min-w-0 max-w-full ${STUDENT_AI_BANNER}`}>
      <div className="flex min-w-0 items-start gap-2.5">
        <Sparkles className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[var(--admin-brand)]" strokeWidth={1.75} aria-hidden />
        <div className="min-w-0">
          <p className="student-ai-banner__title m-0">{t('student.internshipOffers.cvAnalysis.aiPowered')}</p>
          <p className="student-ai-banner__desc m-0 mt-1">{t('student.internshipOffers.cvAnalysis.aiDesc')}</p>
        </div>
      </div>
    </section>
  );
};

export default CvAnalysisAiBanner;
