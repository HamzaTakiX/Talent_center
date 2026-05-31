import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import {
  STUDENT_CALLOUT_SUCCESS,
  STUDENT_ICON_CHIP_SUCCESS,
} from '../../../design-system/studentSemanticStyles';

interface CvAnalysisSummaryBannerProps {
  matchScore: number;
}

const CvAnalysisSummaryBanner: FunctionComponent<CvAnalysisSummaryBannerProps> = ({ matchScore }) => {
  const { t } = useTranslation();

  return (
    <section className={`box-border w-full min-w-0 max-w-full ${STUDENT_CALLOUT_SUCCESS} px-4 py-4 sm:px-6 sm:py-5`}>
      <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className={`flex h-10 w-10 ${STUDENT_ICON_CHIP_SUCCESS}`}>
            <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="m-0 text-base font-semibold leading-6 text-[var(--admin-text)]">
              {t('student.internshipOffers.cvAnalysis.complete')}
            </p>
            <p className="m-0 mt-1 text-sm leading-5 text-[var(--admin-text-secondary)]">
              {t('student.internshipOffers.cvAnalysis.evaluatedAgainst')}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center self-center rounded-[12px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-6 py-4 shadow-[var(--admin-shadow-sm)] sm:self-auto">
          <span className="text-3xl font-bold tabular-nums leading-9 text-emerald-500 sm:text-4xl">
            {matchScore}%
          </span>
          <span className="mt-0.5 text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
            {t('student.internshipOffers.details.matchScore')}
          </span>
        </div>
      </div>
    </section>
  );
};

export default CvAnalysisSummaryBanner;
