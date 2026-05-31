import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, FileText, PenLine, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { studentReportEditorPath } from '../../constants/routes';
import type { HubKpiMetrics, StudentReportSummary } from '../../types';

interface ReportsHubHeroProps {
  report: StudentReportSummary;
  kpis: HubKpiMetrics;
}

const statusClassMap: Record<string, string> = {
  draft: 'sr-hub-hero__status--draft',
  submitted: 'sr-hub-hero__status--submitted',
  under_review: 'sr-hub-hero__status--review',
  needs_revision: 'sr-hub-hero__status--revision',
  approved: 'sr-hub-hero__status--approved',
  rejected: 'sr-hub-hero__status--rejected',
};

const ReportsHubHero: FunctionComponent<ReportsHubHeroProps> = ({ report, kpis }) => {
  const { t } = useTranslation();
  const lastUpdate = new Date(report.lastModified).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.section
      className="sr-hub-hero"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="sr-hub-hero__glow" aria-hidden />
      <div className="sr-hub-hero__inner">
        <div className="sr-hub-hero__content">
          <span className="sr-hub-hero__eyebrow">{t('student.reports.hub.activeReport')}</span>
          <h1 className="sr-hub-hero__title">{report.title}</h1>
          <div className="sr-hub-hero__meta">
            <span className="sr-hub-hero__meta-item">
              <User className="h-3.5 w-3.5" aria-hidden />
              {report.supervisor}
            </span>
            <span className={`sr-hub-hero__status ${statusClassMap[report.status] ?? ''}`}>
              {t(`student.reports.status.${report.status}`)}
            </span>
            <span className="sr-hub-hero__meta-item">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {t('student.reports.hub.lastUpdate', { date: lastUpdate })}
            </span>
          </div>
          <div className="sr-hub-hero__stats">
            <div className="sr-hub-hero__stat">
              <span className="sr-hub-hero__stat-value">{kpis.completion}%</span>
              <span className="sr-hub-hero__stat-label">{t('student.reports.hub.completion')}</span>
            </div>
            <div className="sr-hub-hero__stat-divider" aria-hidden />
            <div className="sr-hub-hero__stat">
              <span className="sr-hub-hero__stat-value">
                {kpis.wordCount.toLocaleString()}
                <span className="sr-hub-hero__stat-target">/{kpis.targetWords.toLocaleString()}</span>
              </span>
              <span className="sr-hub-hero__stat-label">{t('student.reports.hub.totalWords')}</span>
            </div>
            <div className="sr-hub-hero__stat-divider" aria-hidden />
            <div className="sr-hub-hero__stat">
              <span className="sr-hub-hero__stat-value">
                {kpis.sectionsComplete}/{kpis.totalSections}
              </span>
              <span className="sr-hub-hero__stat-label">{t('student.reports.hub.sectionsDone')}</span>
            </div>
          </div>
          <div className="sr-hub-hero__progress">
            <div className="sr-hub-hero__progress-bar">
              <motion.div
                className="sr-hub-hero__progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${kpis.completion}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        </div>
        <div className="sr-hub-hero__actions">
          <Link to={studentReportEditorPath(report.id)} className="sr-hub-btn sr-hub-btn--primary">
            <PenLine className="h-4 w-4" aria-hidden />
            {t('student.reports.hub.continueWriting')}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link to={studentReportEditorPath(report.id)} className="sr-hub-btn sr-hub-btn--ghost">
            <FileText className="h-4 w-4" aria-hidden />
            {t('student.reports.hub.openEditor')}
          </Link>
        </div>
      </div>
    </motion.section>
  );
};

export default ReportsHubHero;
