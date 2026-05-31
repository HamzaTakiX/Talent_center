import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import {
  BookMarked,
  Clock,
  FileText,
  Hash,
  Image,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { ReportAnalytics } from '../../types';

interface ReportAnalyticsBarProps {
  analytics: ReportAnalytics;
}

const ReportAnalyticsBar: FunctionComponent<ReportAnalyticsBarProps> = ({ analytics }) => {
  const { t } = useTranslation();

  const items = [
    { icon: FileText, label: t('student.reports.analytics.words'), value: analytics.wordCount.toLocaleString() },
    { icon: Hash, label: t('student.reports.analytics.completion'), value: `${analytics.completionPercent}%` },
    { icon: Clock, label: t('student.reports.analytics.readingTime'), value: `${analytics.readingTimeMinutes} min` },
    { icon: BookMarked, label: t('student.reports.analytics.references'), value: String(analytics.referenceCount) },
    { icon: Image, label: t('student.reports.analytics.images'), value: String(analytics.imageCount) },
  ];

  return (
    <div className="student-report-analytics" role="region" aria-label={t('student.reports.analytics.title')}>
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="student-report-analytic-card">
          <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--admin-text-muted)]" aria-hidden />
          <span className="text-[var(--admin-text-muted)]">{label}</span>
          <span className="student-report-analytic-card__value">{value}</span>
        </div>
      ))}
    </div>
  );
};

export default ReportAnalyticsBar;
