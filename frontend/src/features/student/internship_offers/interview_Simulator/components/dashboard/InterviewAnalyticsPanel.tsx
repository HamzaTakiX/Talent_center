import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BarChart3, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { ANALYTICS_METRICS } from '../../data/interviewSimulatorDashboardMock';
import { AnimatedCounter, fadeUp, TrendChart } from './InterviewPrimitives';

const InterviewAnalyticsPanel: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <motion.section className="sr-is-panel sr-is-analytics" {...fadeUp}>
      <div className="sr-is-analytics__header">
        <div>
          <h2 className="sr-is-analytics__title">
            <BarChart3 className="h-4 w-4" aria-hidden />
            {t('student.internshipOffers.interviewSim.analytics.title')}
          </h2>
          <p className="sr-is-analytics__subtitle">{t('student.internshipOffers.interviewSim.analytics.subtitle')}</p>
        </div>
        <div className="sr-is-analytics__summary">
          <span className="sr-is-analytics__summary-label">{t('student.internshipOffers.interviewSim.analytics.avgLabel')}</span>
          <span className="sr-is-analytics__summary-value">
            <AnimatedCounter value={84} />
          </span>
        </div>
      </div>

      <div className="sr-is-analytics__grid">
        {ANALYTICS_METRICS.map((metric, index) => {
          const current = metric.values[metric.values.length - 1];
          const previous = metric.values[metric.values.length - 2] ?? current;
          const delta = current - previous;
          const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;

          return (
            <motion.article
              key={metric.id}
              className="sr-is-analytics__card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.4 }}
            >
              <div className="sr-is-analytics__card-head">
                <h3 className="sr-is-analytics__card-title">{t(metric.labelKey)}</h3>
                <span className={`sr-is-analytics__delta sr-is-analytics__delta--${delta >= 0 ? 'up' : 'down'}`}>
                  <TrendIcon className="h-3 w-3" aria-hidden />
                  {delta >= 0 ? '+' : ''}
                  {delta}
                  {metric.unit ?? ''}
                </span>
              </div>
              <div className="sr-is-analytics__card-value">
                <AnimatedCounter value={current} suffix={metric.unit ?? ''} />
              </div>
              <TrendChart values={metric.values} className="sr-is-analytics__chart" height={128} />
            </motion.article>
          );
        })}
      </div>
    </motion.section>
  );
};

export default InterviewAnalyticsPanel;
