import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

const CareerCoachSummarySkeleton: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div
      className="sr-acc-summary-skeleton"
      aria-busy="true"
      aria-label={t('student.internshipOffers.careerCoach.summary.loading')}
    >
      <div className="sr-acc-summary-skeleton__status" role="status">
        <span className="sr-acc-summary-skeleton__spinner" aria-hidden />
        <span>{t('student.internshipOffers.careerCoach.summary.loading')}</span>
      </div>

      <div className="sr-acc-summary-skeleton__card">
        <div className="sr-acc-summary-skeleton__card-head">
          <span className="sr-acc-summary-skeleton__line sr-acc-summary-skeleton__line--intro" />
          <div className="sr-acc-summary-skeleton__tags">
            <span className="sr-acc-summary-skeleton__tag" />
            <span className="sr-acc-summary-skeleton__tag" />
          </div>
        </div>

        <div className="sr-acc-summary-skeleton__section">
          <div className="sr-acc-summary-skeleton__meta">
            <span className="sr-acc-summary-skeleton__badge" />
            <span className="sr-acc-summary-skeleton__line sr-acc-summary-skeleton__line--xs" />
          </div>
          <span className="sr-acc-summary-skeleton__line sr-acc-summary-skeleton__line--md" />
          <span className="sr-acc-summary-skeleton__line sr-acc-summary-skeleton__line--lg" />
          <span className="sr-acc-summary-skeleton__line sr-acc-summary-skeleton__line--sm" />
        </div>

        <div className="sr-acc-summary-skeleton__section">
          <div className="sr-acc-summary-skeleton__meta">
            <span className="sr-acc-summary-skeleton__badge" />
            <span className="sr-acc-summary-skeleton__line sr-acc-summary-skeleton__line--xs" />
          </div>
          <span className="sr-acc-summary-skeleton__line sr-acc-summary-skeleton__line--md" />
          <span className="sr-acc-summary-skeleton__line sr-acc-summary-skeleton__line--lg" />
        </div>
      </div>
    </div>
  );
};

export default CareerCoachSummarySkeleton;
