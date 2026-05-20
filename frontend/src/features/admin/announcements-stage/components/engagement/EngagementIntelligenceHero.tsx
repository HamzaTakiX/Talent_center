import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  LineChart,
  Megaphone,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { fadeInUp } from '../../../dashboard/ui/animations';
import type { EngagementDashboardData } from '../../types/engagementDashboard';

interface Props {
  data: EngagementDashboardData;
  loading?: boolean;
}

const EngagementIntelligenceHero: FunctionComponent<Props> = ({ data, loading }) => {
  const { t } = useTranslation();
  const P = 'admin.announcementsModule.engagement';
  const { metrics, summary, health, recommendation } = data;
  const recoAccuracy =
    recommendation.totalScores > 0
      ? Math.round((recommendation.recommendedCount / recommendation.totalScores) * 100)
      : Math.round(recommendation.averageScore);

  const TrendIcon = health.trend === 'down' ? TrendingDown : TrendingUp;

  return (
    <motion.header {...fadeInUp} className="admin-eng-hero" aria-labelledby="eng-intel-title">
      <div className="admin-eng-hero__glow" aria-hidden />
      <motion.div className="admin-eng-hero__content" {...fadeInUp}>
        <motion.div className="admin-ann-hero__badge" {...fadeInUp}>
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          <span>{t(`${P}.badge`)}</span>
        </motion.div>
        <h1 id="eng-intel-title" className="admin-ann-hero__title">
          {t(`${P}.title`)}
        </h1>
        <p className="admin-ann-hero__subtitle">{t(`${P}.subtitle`)}</p>

        <motion.div className="admin-eng-hero__metrics" {...fadeInUp}>
          <motion.div className="admin-eng-hero__metric admin-eng-hero__metric--primary" whileHover={{ y: -2 }}>
            <Megaphone className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
            <div className="admin-eng-hero__metric-body">
              <span className="admin-ann-hero__metric-label">{t(`${P}.hero.activeCampaigns`)}</span>
              <span className="admin-ann-hero__metric-value">
                {loading ? '—' : summary.activeCount}
              </span>
            </div>
          </motion.div>

          <motion.div className="admin-eng-hero__metric" whileHover={{ y: -2 }}>
            <Activity className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
            <div className="admin-eng-hero__metric-body">
              <span className="admin-ann-hero__metric-label">{t(`${P}.hero.healthScore`)}</span>
              <span className="admin-eng-hero__score">
                {loading ? '—' : `${health.score}`}
                <small>/100</small>
              </span>
            </div>
            {!loading ? (
              <span
                className={`admin-eng-trend admin-eng-trend--${health.trend}`}
                title={t(`${P}.trend.${health.trend}`)}
              >
                <TrendIcon className="h-3 w-3" aria-hidden />
                {health.delta}%
              </span>
            ) : null}
          </motion.div>

          <motion.div className="admin-eng-hero__metric" whileHover={{ y: -2 }}>
            <Target className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
            <div className="admin-eng-hero__metric-body">
              <span className="admin-ann-hero__metric-label">{t(`${P}.hero.reach`)}</span>
              <span className="admin-ann-hero__metric-value">
                {loading ? '—' : metrics.views.toLocaleString()}
              </span>
            </div>
          </motion.div>

          <motion.div className="admin-eng-hero__metric" whileHover={{ y: -2 }}>
            <LineChart className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
            <div className="admin-eng-hero__metric-body">
              <span className="admin-ann-hero__metric-label">{t(`${P}.hero.recoAccuracy`)}</span>
              <span className="admin-ann-hero__metric-value">
                {loading ? '—' : `${recoAccuracy}%`}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.header>
  );
};

export default EngagementIntelligenceHero;
