import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import type { ReportAcademicProgress } from '../../types';

interface AcademicProgressWidgetProps {
  progress: ReportAcademicProgress;
}

function ProgressRing({ value, label }: { value: number; label: string }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="student-reports-progress-ring">
        <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden>
          <circle cx="32" cy="32" r={r} fill="none" stroke="var(--admin-border)" strokeWidth="4" />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke="var(--admin-brand)"
            strokeWidth="4"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className="student-reports-progress-ring__label">{value}%</span>
      </div>
      <span className="text-center text-xs font-medium text-[var(--admin-text-muted)]">{label}</span>
    </div>
  );
}

const AcademicProgressWidget: FunctionComponent<AcademicProgressWidgetProps> = ({ progress }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      className="student-reports-progress-widget"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="m-0 mb-4 text-sm font-bold uppercase tracking-wider text-[var(--admin-text-muted)]">
        {t('student.reports.hub.academicProgress')}
      </h2>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <ProgressRing
          value={progress.reportCompletion}
          label={t('student.reports.hub.progressReport')}
        />
        <ProgressRing
          value={progress.researchCompletion}
          label={t('student.reports.hub.progressResearch')}
        />
        <ProgressRing
          value={Math.min(100, progress.supervisorReviews * 25)}
          label={t('student.reports.hub.progressReviews')}
        />
        <ProgressRing
          value={progress.documentCompletion}
          label={t('student.reports.hub.progressDocuments')}
        />
      </div>
    </motion.div>
  );
};

export default AcademicProgressWidget;
