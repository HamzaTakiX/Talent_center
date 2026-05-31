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

import type { HubKpiMetrics } from '../../types';

interface ReportsHubKpiGridProps {
  metrics: HubKpiMetrics;
}

const ReportsHubKpiGrid: FunctionComponent<ReportsHubKpiGridProps> = ({ metrics }) => {
  const { t } = useTranslation();

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
