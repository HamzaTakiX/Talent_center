import { FunctionComponent } from 'react';
import {
  BookOpen,
  Clock,
  FileText,
  Hash,
  Image,
  Layers,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { ReportAnalytics } from '../../types';

interface ReportAnalyticsBarProps {
  analytics: ReportAnalytics;
  pageCount?: number;
  maxPages?: number;
}

const ReportAnalyticsBar: FunctionComponent<ReportAnalyticsBarProps> = ({
  analytics,
  pageCount = 1,
  maxPages,
}) => {
  const { t } = useTranslation();
  const overLimit = typeof maxPages === 'number' && maxPages > 0 && pageCount > maxPages;

  const items = [
    { icon: FileText, label: t('student.reports.analytics.words'), value: analytics.wordCount.toLocaleString() },
    { icon: Hash, label: t('student.reports.analytics.completion'), value: `${analytics.completionPercent}%` },
    { icon: Clock, label: t('student.reports.analytics.readingTime'), value: `${analytics.readingTimeMinutes} min` },
    {
      icon: BookOpen,
      label: t('student.reports.analytics.structure'),
      value: `${analytics.structureProgressPercent}%`,
    },
    {
      icon: Layers,
      label: t('student.reports.analytics.pages'),
      value:
        typeof maxPages === 'number' && maxPages > 0
          ? t('student.reports.analytics.pagesValue', { current: pageCount, max: maxPages })
          : String(pageCount),
      warn: overLimit,
    },
    { icon: Image, label: t('student.reports.analytics.images'), value: String(analytics.imageCount) },
  ];

  return (
    <div className="student-report-analytics" role="region" aria-label={t('student.reports.analytics.title')}>
      {items.map(({ icon: Icon, label, value, warn }) => (
        <div
          key={label}
          className={`student-report-analytic-card${warn ? ' student-report-analytic-card--warn' : ''}`}
        >
          <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--admin-text-muted)]" aria-hidden />
          <span className="text-[var(--admin-text-muted)]">{label}</span>
          <span className="student-report-analytic-card__value">{value}</span>
        </div>
      ))}
    </div>
  );
};

export default ReportAnalyticsBar;
