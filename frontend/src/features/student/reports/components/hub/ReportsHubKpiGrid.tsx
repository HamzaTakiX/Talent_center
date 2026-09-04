import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import {
  BookMarked,
  FileText,
  MessageSquareWarning,
  Target,
  Timer,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { REPORTS_HUB_KPI_SKELETON_COUNT } from '../../constants/limits';
import type { HubKpiMetrics } from '../../types';
import ReportsHubSkeletonBlock from './ReportsHubSkeletonBlock';

interface ReportsHubKpiGridProps {
  metrics: HubKpiMetrics;
  loading?: boolean;
}

const ReportsHubKpiGrid: FunctionComponent<ReportsHubKpiGridProps> = ({
  metrics,
  loading = false,
}) => {
  const { t } = useTranslation();
  const loadingLabel = t('student.reports.hub.loading', { defaultValue: 'Chargement…' });

  if (loading) {
    return (
      <div
        className="sr-hub-kpi-grid"
        role="status"
        aria-busy="true"
        aria-label={loadingLabel}
      >
        <span className="sr-only">{loadingLabel}</span>
        {Array.from({ length: REPORTS_HUB_KPI_SKELETON_COUNT }, (_, i) => (
          <div key={i} className="sr-hub-kpi">
            <ReportsHubSkeletonBlock className="h-8 w-8 shrink-0 rounded-lg" />
            <div className="sr-hub-kpi__body min-w-0 flex-1">
              <ReportsHubSkeletonBlock className="h-2.5 w-16" />
              <ReportsHubSkeletonBlock className="mt-2 h-6 w-14" />
              <ReportsHubSkeletonBlock className="mt-1.5 h-2.5 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      id: 'words',
      icon: FileText,
      label: t('student.reports.hub.kpiWords'),
      value: metrics.wordCount.toLocaleString(),
      sub: t('student.reports.hub.kpiWordsSub', { target: metrics.targetWords.toLocaleString() }),
      accent: 'blue',
    },
    {
      id: 'completion',
      icon: Target,
      label: t('student.reports.hub.kpiCompletion'),
      value: `${metrics.completion}%`,
      sub: t('student.reports.hub.kpiCompletionSub'),
      accent: 'violet',
    },
    {
      id: 'sections',
      icon: BookMarked,
      label: t('student.reports.hub.kpiSections'),
      value: `${metrics.sectionsComplete}/${metrics.totalSections}`,
      sub: t('student.reports.hub.kpiSectionsSub'),
      accent: 'emerald',
    },
    {
      id: 'reading',
      icon: Timer,
      label: t('student.reports.hub.kpiReading'),
      value: `${metrics.readingMinutes} min`,
      sub: t('student.reports.hub.kpiReadingSub'),
      accent: 'amber',
    },
    {
      id: 'feedback',
      icon: MessageSquareWarning,
      label: t('student.reports.hub.kpiFeedback'),
      value: String(metrics.pendingFeedback),
      sub: t('student.reports.hub.kpiFeedbackSub'),
      accent: 'rose',
    },
  ];

  return (
    <div className="sr-hub-kpi-grid">
      {cards.map((card, i) => (
        <motion.div
          key={card.id}
          className={`sr-hub-kpi sr-hub-kpi--${card.accent}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 * i, duration: 0.35 }}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
        >
          <div className="sr-hub-kpi__icon">
            <card.icon className="h-4 w-4" aria-hidden />
          </div>
          <div className="sr-hub-kpi__body">
            <span className="sr-hub-kpi__label">{card.label}</span>
            <span className="sr-hub-kpi__value">{card.value}</span>
            <span className="sr-hub-kpi__sub">{card.sub}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ReportsHubKpiGrid;
