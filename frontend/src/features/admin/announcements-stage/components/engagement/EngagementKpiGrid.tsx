import { type CSSProperties, FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Bookmark,
  Eye,
  Layers,
  MousePointerClick,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { staggerContainer } from '../../../dashboard/ui/animations';
import type { EngagementDashboardData } from '../../types/engagementDashboard';

interface Props {
  data: EngagementDashboardData;
  loading?: boolean;
}

function MiniSparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const w = 56;
  const h = 22;
  const pts = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * w;
      const y = h - (v / max) * h;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={w} height={h} className="admin-eng-spark" aria-hidden>
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const EngagementKpiGrid: FunctionComponent<Props> = ({ data, loading }) => {
  const { t } = useTranslation();
  const P = 'admin.announcementsModule.engagement.kpi';
  const { metrics, recommendation, trends, topCategory } = data;

  const saveRate = metrics.views ? Math.round((metrics.saves / metrics.views) * 1000) / 10 : 0;
  const recoPct =
    recommendation.totalScores > 0
      ? Math.round((recommendation.recommendedCount / recommendation.totalScores) * 100)
      : Math.round(recommendation.averageScore);
  const avgRead = Math.max(1.2, Math.min(8.5, metrics.views / Math.max(metrics.clicks, 1) / 12));

  const cards = useMemo(
    () => [
      {
        key: 'views',
        label: t(`${P}.totalViews`),
        value: metrics.views.toLocaleString(),
        delta: '+12%',
        icon: Eye,
        spark: trends.views,
        accent: '#2563eb',
      },
      {
        key: 'ctr',
        label: t(`${P}.ctr`),
        value: `${metrics.clickThroughRate}%`,
        delta: metrics.clickThroughRate >= 5 ? '+4%' : '—',
        icon: MousePointerClick,
        spark: trends.clicks,
        accent: '#0891b2',
      },
      {
        key: 'save',
        label: t(`${P}.saveRate`),
        value: `${saveRate}%`,
        delta: saveRate > 0 ? '+6%' : '—',
        icon: Bookmark,
        spark: trends.saves,
        accent: '#16a34a',
      },
      {
        key: 'score',
        label: t(`${P}.engagementScore`),
        value: `${metrics.engagementRate}%`,
        delta: `${data.health.delta}%`,
        icon: TrendingUp,
        spark: trends.views.map((v, i) => v + (trends.clicks[i] ?? 0)),
        accent: '#4f46e5',
      },
      {
        key: 'reco',
        label: t(`${P}.recoAccuracy`),
        value: `${recoPct}%`,
        delta: recommendation.averageScore > 0 ? `μ ${recommendation.averageScore.toFixed(1)}` : '—',
        icon: Sparkles,
        spark: trends.saves,
        accent: '#7c3aed',
      },
      {
        key: 'reach',
        label: t(`${P}.audienceReach`),
        value: recommendation.recommendedCount.toLocaleString(),
        delta: '—',
        icon: Target,
        spark: trends.views,
        accent: '#0d9488',
      },
      {
        key: 'read',
        label: t(`${P}.avgReadTime`),
        value: `${avgRead.toFixed(1)} ${t('admin.announcementsModule.engagement.readTimeSuffix')}`,
        delta: '—',
        icon: Timer,
        spark: trends.clicks,
        accent: '#ea580c',
      },
      {
        key: 'category',
        label: t(`${P}.topCategory`),
        value: topCategory?.name ?? '—',
        delta: topCategory ? String(topCategory.count) : '—',
        icon: Layers,
        spark: trends.views,
        accent: '#1d4ed8',
      },
    ],
    [metrics, recommendation, trends, topCategory, data.health.delta, t, P, saveRate, recoPct, avgRead],
  );

  return (
    <motion.div
      className="admin-eng-kpi-grid"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.article
            key={card.key}
            className="admin-eng-kpi-card"
            style={{ '--eng-accent': card.accent } as CSSProperties}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            custom={index}
          >
            <div className="admin-eng-kpi-card__top">
              <span className="admin-eng-kpi-card__icon">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <MiniSparkline values={card.spark.slice(-8)} />
            </div>
            <p className="admin-eng-kpi-card__label">{card.label}</p>
            <p className="admin-eng-kpi-card__value">{loading ? '—' : card.value}</p>
            <span className="admin-eng-kpi-card__delta">{loading ? '' : card.delta}</span>
          </motion.article>
        );
      })}
    </motion.div>
  );
};

export default EngagementKpiGrid;
