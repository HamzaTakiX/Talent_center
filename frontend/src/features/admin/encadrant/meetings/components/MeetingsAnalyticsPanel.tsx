import { FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CalendarRange } from 'lucide-react';
import AdminDonutChart from '../../../ui/charts/AdminDonutChart';
import { AdminChartDonutSkeleton } from '../../../ui/AdminSectionSkeleton';
import type { MeetingsDashboardSummary } from '../types/supervisionMeeting';
import { statusChartColors } from '../utils/meetingStatusMeta';
import { fadeInUp } from '../../../dashboard/ui/animations';

interface MeetingsAnalyticsPanelProps {
  summary: MeetingsDashboardSummary | null;
  loading?: boolean;
}

const MeetingsAnalyticsPanel: FunctionComponent<MeetingsAnalyticsPanelProps> = ({
  summary,
  loading,
}) => {
  const { t } = useTranslation();

  const statusSegments = useMemo(() => {
    if (!summary?.byStatus?.length) return [];
    return summary.byStatus
      .filter((s) => s.count > 0)
      .map((s) => ({
        key: s.status,
        label: t(`admin.modules.meetings.status.${s.status}`, { defaultValue: s.status }),
        value: s.count,
        color: statusChartColors[s.status] ?? '#3b82f6',
      }));
  }, [summary, t]);

  const completed = summary?.completed ?? 0;
  const delayed = (summary?.delayed ?? 0) + (summary?.overdue ?? 0);
  const total = summary?.total ?? 0;
  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const delayedPct = total > 0 ? Math.round((delayed / total) * 100) : 0;

  return (
    <motion.section {...fadeInUp} className="admin-meetings-analytics" aria-labelledby="meetings-analytics-title">
      <h3 id="meetings-analytics-title" className="admin-meetings-panel-title">
        {t('admin.modules.meetings.analytics.title', { defaultValue: 'Supervision analytics' })}
      </h3>

      <motion.div className="admin-meetings-analytics__progress" {...fadeInUp}>
        <div className="admin-meetings-progress-row">
          <span className="admin-meetings-progress-label">
            {t('admin.modules.meetings.analytics.completedVsDelayed', {
              defaultValue: 'Completed vs delayed',
            })}
          </span>
          <span className="admin-meetings-progress-values">
            {completedPct}% / {delayedPct}%
          </span>
        </div>
        <div className="admin-meetings-progress-bar" role="presentation">
          <motion.span
            className="admin-meetings-progress-bar__completed"
            initial={{ width: 0 }}
            animate={{ width: `${completedPct}%` }}
            transition={{ duration: 0.6 }}
          />
          <motion.span
            className="admin-meetings-progress-bar__delayed"
            initial={{ width: 0 }}
            animate={{ width: `${delayedPct}%` }}
            transition={{ duration: 0.6, delay: 0.1 }}
          />
        </div>
        <ul className="admin-meetings-progress-legend">
          <li className="admin-meetings-progress-legend__item admin-meetings-progress-legend__item--completed">
            <span className="admin-meetings-progress-legend__dot" aria-hidden />
            <span>{t('admin.modules.meetings.kpi.completed', { defaultValue: 'Completed' })}</span>
            <span className="admin-meetings-progress-legend__value">{completed}</span>
          </li>
          <li className="admin-meetings-progress-legend__item admin-meetings-progress-legend__item--delayed">
            <span className="admin-meetings-progress-legend__dot" aria-hidden />
            <span>{t('admin.modules.meetings.kpi.delayed', { defaultValue: 'Delayed' })}</span>
            <span className="admin-meetings-progress-legend__value">{delayed}</span>
          </li>
        </ul>
      </motion.div>

      <div className="admin-meetings-analytics__chart">
        <p className="admin-meetings-analytics__chart-label">
          {t('admin.modules.meetings.analytics.distribution', {
            defaultValue: 'Meetings distribution',
          })}
        </p>
        {loading ? (
          <AdminChartDonutSkeleton legendItems={4} />
        ) : statusSegments.length > 0 ? (
          <AdminDonutChart
            segments={statusSegments}
            centerTotal={total}
            centerCaption={t('admin.modules.meetings.analytics.totalCaption', {
              defaultValue: 'total',
            })}
            ariaLabel={t('admin.modules.meetings.analytics.distribution', {
              defaultValue: 'Meetings distribution',
            })}
          />
        ) : (
          <div className="admin-meetings-analytics__empty">
            <span className="admin-meetings-analytics__empty-icon" aria-hidden>
              <CalendarRange className="h-5 w-5" strokeWidth={2} />
            </span>
            <p className="admin-meetings-analytics__empty-title">
              {t('admin.modules.meetings.analytics.distributionEmptyTitle', {
                defaultValue: 'No meetings recorded',
              })}
            </p>
            <p className="admin-meetings-analytics__empty-desc">
              {t('admin.modules.meetings.analytics.distributionEmptyDesc', {
                defaultValue: 'The status breakdown appears once a meeting is scheduled.',
              })}
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default MeetingsAnalyticsPanel;
