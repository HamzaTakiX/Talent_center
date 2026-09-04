import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, MessageSquareOff, Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { REPORTS_HUB_FEEDBACK_SKELETON_ROWS } from '../../constants/limits';
import { studentReportEditorPath } from '../../constants/routes';
import type { HubSupervisorFeedbackItem } from '../../types';
import ReportsHubSkeletonBlock from './ReportsHubSkeletonBlock';
import ReportsWorkspaceModuleHeader from './ReportsWorkspaceModuleHeader';

interface ReportsSupervisorFeedbackProps {
  items: HubSupervisorFeedbackItem[];
  reportId: string;
  loading?: boolean;
}

function authorInitials(name: string): string {
  const cleaned = name.replace(/^(dr|prof|pr)\.?\s+/i, '').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const ReportsSupervisorFeedback: FunctionComponent<ReportsSupervisorFeedbackProps> = ({
  items,
  reportId,
  loading = false,
}) => {
  const { t } = useTranslation();
  const loadingLabel = t('student.reports.hub.loading', { defaultValue: 'Chargement…' });
  const pending = items.filter((i) => !i.resolved);
  const resolvedCount = items.length - pending.length;
  const preview = items.slice(0, 3);
  const editorPath = studentReportEditorPath(reportId);

  return (
    <section className="sr-hub-card sr-hub-feedback-panel" aria-busy={loading || undefined}>
      <div className="sr-hub-feedback-panel__glow" aria-hidden />
      <ReportsWorkspaceModuleHeader
        icon={<Quote className="h-5 w-5" />}
        title={t('student.reports.hub.feedbackTitle')}
        subtitle={t('student.reports.hub.feedbackModuleSubtitle')}
        badge={
          loading ? (
            <ReportsHubSkeletonBlock className="h-5 w-5 rounded-full" />
          ) : pending.length > 0 ? (
            <span className="sr-hub-feedback__badge">{pending.length}</span>
          ) : undefined
        }
      />

      {loading ? (
        <div className="sr-hub-feedback-panel__stats" aria-hidden>
          <ReportsHubSkeletonBlock className="h-6 w-28 rounded-full" />
          <ReportsHubSkeletonBlock className="h-6 w-24 rounded-full" />
        </div>
      ) : items.length > 0 ? (
        <div className="sr-hub-feedback-panel__stats">
          <span className="sr-hub-feedback-panel__stat sr-hub-feedback-panel__stat--pending">
            <span className="sr-hub-feedback-panel__stat-dot" aria-hidden />
            {t('student.reports.hub.feedbackPending', { count: pending.length })}
          </span>
          <span className="sr-hub-feedback-panel__stat sr-hub-feedback-panel__stat--resolved">
            <CheckCircle2 className="sr-hub-feedback-panel__stat-icon" aria-hidden />
            {t('student.reports.hub.feedbackResolvedCount', { count: resolvedCount })}
          </span>
        </div>
      ) : null}

      {loading ? (
        <ul className="sr-hub-feedback__list" role="status" aria-label={loadingLabel}>
          {Array.from({ length: REPORTS_HUB_FEEDBACK_SKELETON_ROWS }, (_, i) => (
            <li key={i} aria-hidden>
              <div className="sr-hub-feedback__card">
                <ReportsHubSkeletonBlock className="h-8 w-8 shrink-0 rounded-lg" />
                <div className="sr-hub-feedback__body min-w-0 flex-1">
                  <div className="sr-hub-feedback__top">
                    <ReportsHubSkeletonBlock className="h-3 w-24" />
                    <ReportsHubSkeletonBlock className="h-4 w-12 rounded" />
                  </div>
                  <ReportsHubSkeletonBlock className="mt-2 h-3 w-full" />
                  <ReportsHubSkeletonBlock className="mt-1.5 h-3 w-[78%]" />
                  <div className="sr-hub-feedback__meta mt-2">
                    <ReportsHubSkeletonBlock className="h-6 w-6 rounded-full" />
                    <ReportsHubSkeletonBlock className="h-2.5 w-20" />
                    <ReportsHubSkeletonBlock className="ml-auto h-2.5 w-12" />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : preview.length === 0 ? (
        <div className="sr-hub-feedback__empty">
          <span className="sr-hub-feedback__empty-icon" aria-hidden>
            <MessageSquareOff className="h-5 w-5" />
          </span>
          <span className="sr-hub-feedback__empty-title">{t('student.reports.hub.feedbackEmpty')}</span>
          <span className="sr-hub-feedback__empty-hint">{t('student.reports.hub.feedbackEmptyHint')}</span>
        </div>
      ) : (
        <ul className="sr-hub-feedback__list">
          {preview.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <Link
                to={editorPath}
                className={`sr-hub-feedback__card sr-hub-feedback__card--${item.priority} ${item.resolved ? 'is-resolved' : ''}`}
              >
                <span className="sr-hub-feedback__rail" aria-hidden />
                <span className="sr-hub-feedback__icon" aria-hidden>
                  {item.resolved ? <CheckCircle2 className="h-4 w-4" /> : <Quote className="h-4 w-4" />}
                </span>
                <div className="sr-hub-feedback__body">
                  <div className="sr-hub-feedback__top">
                    <span className="sr-hub-feedback__section">{item.section}</span>
                    <span className={`sr-hub-feedback__priority sr-hub-feedback__priority--${item.priority}`}>
                      <span className="sr-hub-feedback__priority-dot" aria-hidden />
                      {t(`student.reports.hub.priority.${item.priority}`)}
                    </span>
                  </div>
                  <p className="sr-hub-feedback__text">{item.text}</p>
                  <div className="sr-hub-feedback__meta">
                    <span className="sr-hub-feedback__avatar" aria-hidden>
                      {authorInitials(item.author)}
                    </span>
                    <span className="sr-hub-feedback__author">{item.author}</span>
                    {item.resolved && (
                      <span className="sr-hub-feedback__resolved">
                        {t('student.reports.hub.feedbackResolved')}
                      </span>
                    )}
                    <time className="sr-hub-feedback__date" dateTime={item.createdAt}>
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </time>
                    <ArrowRight className="sr-hub-feedback__chevron h-3.5 w-3.5" aria-hidden />
                  </div>
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ReportsSupervisorFeedback;
