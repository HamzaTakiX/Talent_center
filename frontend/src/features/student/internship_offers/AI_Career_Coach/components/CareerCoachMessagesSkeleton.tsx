import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

const CareerCoachMessagesSkeleton: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div
      className="sr-acc-messages-skeleton"
      aria-busy="true"
      aria-label={t('student.internshipOffers.careerCoach.conversation.loadingMessages')}
    >
      <div className="sr-acc-messages-skeleton__status" role="status">
        <span className="sr-acc-messages-skeleton__spinner" aria-hidden />
        <span>{t('student.internshipOffers.careerCoach.conversation.loadingMessages')}</span>
      </div>

      <div className="sr-acc-msg sr-acc-msg--ai sr-acc-messages-skeleton__msg">
        <span className="sr-acc-messages-skeleton__avatar sr-acc-messages-skeleton__avatar--ai" aria-hidden />
        <div className="sr-acc-msg__body">
          <div className="sr-acc-messages-skeleton__bubble sr-acc-messages-skeleton__bubble--ai">
            <span className="sr-acc-messages-skeleton__line sr-acc-messages-skeleton__line--lg" />
            <span className="sr-acc-messages-skeleton__line sr-acc-messages-skeleton__line--md" />
            <span className="sr-acc-messages-skeleton__line sr-acc-messages-skeleton__line--sm" />
          </div>
        </div>
      </div>

      <div className="sr-acc-msg sr-acc-msg--user sr-acc-messages-skeleton__msg">
        <span className="sr-acc-messages-skeleton__avatar sr-acc-messages-skeleton__avatar--user" aria-hidden />
        <div className="sr-acc-msg__body">
          <div className="sr-acc-messages-skeleton__bubble sr-acc-messages-skeleton__bubble--user">
            <span className="sr-acc-messages-skeleton__line sr-acc-messages-skeleton__line--xs" />
          </div>
        </div>
      </div>

      <div className="sr-acc-msg sr-acc-msg--ai sr-acc-messages-skeleton__msg">
        <span className="sr-acc-messages-skeleton__avatar sr-acc-messages-skeleton__avatar--ai" aria-hidden />
        <div className="sr-acc-msg__body">
          <div className="sr-acc-messages-skeleton__bubble sr-acc-messages-skeleton__bubble--ai">
            <span className="sr-acc-messages-skeleton__line sr-acc-messages-skeleton__line--md" />
            <span className="sr-acc-messages-skeleton__line sr-acc-messages-skeleton__line--sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerCoachMessagesSkeleton;
