import { FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Brain, Lightbulb, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { fadeInUp, staggerContainer } from '../../../dashboard/ui/animations';
import type { AnnInsight } from '../AnnouncementsInsightsPanel';
import type { EngagementDashboardData } from '../../types/engagementDashboard';

interface Props {
  data: EngagementDashboardData;
  apiInsights: AnnInsight[];
}

const EngagementInsightsRow: FunctionComponent<Props> = ({ data, apiInsights }) => {
  const { t } = useTranslation();
  const P = 'admin.announcementsModule.engagement.insights';

  const cards = useMemo(() => {
    const built = [
      {
        key: 'internship',
        icon: Zap,
        tone: 'success' as const,
        title: t(`${P}.internshipLead`),
        confidence: 92,
      },
      {
        key: 'urgent',
        icon: TrendingUp,
        tone: 'info' as const,
        title: t(`${P}.urgentLead`),
        confidence: 78,
      },
      {
        key: 'lme',
        icon: TrendingDown,
        tone: 'warning' as const,
        title: t(`${P}.lmeDrop`),
        confidence: 71,
      },
      {
        key: 'reco',
        icon: Brain,
        tone: 'info' as const,
        title: t(`${P}.recoBoost`),
        confidence: Math.min(
          95,
          Math.round(
            data.recommendation.totalScores > 0
              ? (data.recommendation.recommendedCount / data.recommendation.totalScores) * 100
              : data.metrics.engagementRate,
          ),
        ),
      },
    ];

    if (apiInsights.length > 0) {
      return [
        ...built.slice(0, 2),
        {
          key: `api-${apiInsights[0].kind}`,
          icon: Lightbulb,
          tone: (apiInsights[0].severity === 'warning' ? 'warning' : 'info') as 'warning' | 'info',
          title: apiInsights[0].title,
          confidence: 65,
        },
        built[3],
      ];
    }
    return built;
  }, [apiInsights, data, t, P]);

  return (
    <motion.section {...fadeInUp} className="admin-eng-insights" aria-labelledby="eng-insights-title">
      <header className="admin-eng-insights__head">
        <Lightbulb className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
        <h3 id="eng-insights-title" className="admin-ann-panel-title">
          {t(`${P}.title`)}
        </h3>
      </header>
      <motion.ul
        className="admin-eng-insights__grid"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.li
              key={card.key}
              variants={fadeInUp}
              className={`admin-eng-insight-card admin-eng-insight-card--${card.tone}`}
              whileHover={{ y: -2 }}
            >
              <span className="admin-eng-insight-card__icon">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <p className="admin-eng-insight-card__text">{card.title}</p>
              <div className="admin-eng-insight-card__confidence">
                <span>{t(`${P}.confidence`)}</span>
                <motion.div className="admin-eng-confidence-bar">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${card.confidence}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.div>
                <strong>{card.confidence}%</strong>
              </div>
            </motion.li>
          );
        })}
      </motion.ul>
    </motion.section>
  );
};

export default EngagementInsightsRow;
