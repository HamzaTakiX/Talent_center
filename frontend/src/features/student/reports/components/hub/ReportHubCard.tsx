import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, FileText, GraduationCap, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { StudentReportSummary } from '../../types';
import { studentReportEditorPath } from '../../constants/routes';

interface ReportHubCardProps {
  report: StudentReportSummary;
  index?: number;
}

const statusClassMap: Record<string, string> = {
  draft: 'student-report-status-badge--draft',
  submitted: 'student-report-status-badge--submitted',
  under_review: 'student-report-status-badge--under_review',
  needs_revision: 'student-report-status-badge--needs_revision',
  approved: 'student-report-status-badge--approved',
  rejected: 'student-report-status-badge--rejected',
  archived: 'student-report-status-badge--draft',
};

const ReportHubCard: FunctionComponent<ReportHubCardProps> = ({ report, index = 0 }) => {
  const { t } = useTranslation();
  const modified = new Date(report.lastModified).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <Link
        to={report.isTemplate ? studentReportEditorPath('rpt-template-pfe') : studentReportEditorPath(report.id)}
        className="student-report-card"
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="student-report-card__title">{report.title}</h3>
          <span className={`student-report-status-badge ${statusClassMap[report.status] ?? ''}`}>
            {t(`student.reports.status.${report.status}`)}
          </span>
        </div>
        <div className="student-report-card__meta">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t('student.reports.hub.lastModified', { date: modified })}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {report.supervisor}
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t('student.reports.hub.wordCount', { count: report.wordCount.toLocaleString() })}
          </span>
        </div>
        <div className="student-report-card__progress">
          <div className="mb-1 flex justify-between text-xs text-[var(--admin-text-muted)]">
            <span>{t('student.reports.hub.progress')}</span>
            <span className="font-semibold tabular-nums text-[var(--admin-brand)]">{report.progress}%</span>
          </div>
          <div className="student-report-card__progress-bar">
            <div
              className="student-report-card__progress-fill"
              style={{ width: `${report.progress}%` }}
            />
          </div>
        </div>
        {report.isTemplate && (
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--admin-brand)]">
            <GraduationCap className="h-3.5 w-3.5" aria-hidden />
            {t('student.reports.hub.template')}
          </span>
        )}
      </Link>
    </motion.div>
  );
};

export default ReportHubCard;
