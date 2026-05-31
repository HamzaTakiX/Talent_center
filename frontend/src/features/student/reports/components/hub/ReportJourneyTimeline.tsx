import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { ReportJourneyStep } from '../../types';

interface ReportJourneyTimelineProps {
  steps: ReportJourneyStep[];
}

const ReportJourneyTimeline: FunctionComponent<ReportJourneyTimelineProps> = ({ steps }) => {
  const { t } = useTranslation();

  return (
    <section className="sr-hub-panel sr-hub-journey">
      <header className="sr-hub-journey__header">
        <h2 className="sr-hub-journey__title">{t('student.reports.hub.journeyTitle')}</h2>
        <p className="sr-hub-journey__subtitle">{t('student.reports.hub.journeySub')}</p>
      </header>
      <ol className="sr-hub-journey__list">
        {steps.map((step, i) => (
          <motion.li
            key={step.id}
            className={`sr-hub-journey__step sr-hub-journey__step--${step.state}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <div className="sr-hub-journey__marker">
              {step.state === 'done' ? (
                <Check className="sr-hub-journey__icon" aria-hidden />
              ) : (
                <Circle className="sr-hub-journey__icon" aria-hidden />
              )}
              {i < steps.length - 1 && <span className="sr-hub-journey__line" aria-hidden />}
            </div>
            <div className="sr-hub-journey__content">
              <span className="sr-hub-journey__label">{t(`student.reports.hub.${step.labelKey}`)}</span>
              {step.date && (
                <span className="sr-hub-journey__date">
                  {new Date(step.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                </span>
              )}
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
};

export default ReportJourneyTimeline;
