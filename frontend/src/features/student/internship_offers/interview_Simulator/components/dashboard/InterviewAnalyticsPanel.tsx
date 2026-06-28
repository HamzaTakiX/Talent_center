import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BarChart3, Target, TrendingDown, TrendingUp, Minus, Trophy } from 'lucide-react';
import type { AnalyticsMetric } from '../../types/interviewSimulatorDashboard';
import { AnimatedCounter, fadeUp, ScoreBar, TrendChart } from './InterviewPrimitives';

interface InterviewAnalyticsPanelProps {
  avgOverall: number;
  avgPreparation: number;
  completedCount?: number;
  metrics: AnalyticsMetric[];
  isLoading?: boolean;
}

interface SummaryStatCardProps {
  icon: typeof Trophy;
  label: string;
  value: number;
  suffix?: string;
  accent: 'brand' | 'violet';
  hint?: string;
}

function SummaryStatCard({ icon: Icon, label, value, suffix = '', accent, hint }: SummaryStatCardProps) {
  return (
    <article className={`sr-is-analytics__summary-card sr-is-analytics__summary-card--${accent}`}>
      <div className="sr-is-analytics__summary-card-top">
        <span className="sr-is-analytics__summary-card-icon" aria-hidden>
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div className="sr-is-analytics__summary-card-body">
          <span className="sr-is-analytics__summary-card-label">{label}</span>
          <span className="sr-is-analytics__summary-card-value">
            <AnimatedCounter value={value} suffix={suffix} />
          </span>
          {hint ? <span className="sr-is-analytics__summary-card-hint">{hint}</span> : null}
        </div>
      </div>
      <ScoreBar score={value} />
    </article>
  );
}

const InterviewAnalyticsPanel: FunctionComponent<InterviewAnalyticsPanelProps> = ({
  avgOverall,
  avgPreparation,
  completedCount = 0,
  metrics,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  const sessionsHint =
    completedCount > 0
      ? t('student.internshipOffers.interviewSim.analytics.sessionsHint', { count: completedCount })
      : t('student.internshipOffers.interviewSim.analytics.noSessionsHint');

  if (isLoading) {
    return (
      <motion.section className="sr-is-panel sr-is-analytics" {...fadeUp}>
        <p className="m-0 text-sm text-[var(--admin-text-secondary)]">
          {t('student.internshipOffers.interviewSim.analytics.loading')}
        </p>
      </motion.section>
    );
  }

  if (metrics.length === 0) {
    return (
      <motion.section className="sr-is-panel sr-is-analytics" {...fadeUp}>
        <p className="m-0 text-sm text-[var(--admin-text-secondary)]">
          {t('student.internshipOffers.interviewSim.analytics.empty')}
        </p>
      </motion.section>
    );
  }

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
      </div>

      <div className="sr-is-analytics__summary-grid">
        <SummaryStatCard
          icon={Trophy}
          label={t('student.internshipOffers.interviewSim.analytics.avgLabel')}
          value={avgOverall}
          accent="brand"
          hint={sessionsHint}
        />
        <SummaryStatCard
          icon={Target}
          label={t('student.internshipOffers.interviewSim.analytics.preparationLabel')}
          value={avgPreparation}
          suffix="%"
          accent="violet"
          hint={t('student.internshipOffers.interviewSim.analytics.preparationHint')}
        />
      </div>

      <div className="sr-is-analytics__grid">
        {metrics.map((metric, index) => {
          const current = metric.values[metric.values.length - 1] ?? 0;
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
