import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Activity, CalendarDays, Sparkles } from 'lucide-react';
import type { MeetingsDashboardSummary } from '../types/supervisionMeeting';
import { fadeInUp } from '../../../dashboard/ui/animations';

interface MeetingsOverviewHeaderProps {
  summary: MeetingsDashboardSummary | null;
  loading?: boolean;
}

const MeetingsOverviewHeader: FunctionComponent<MeetingsOverviewHeaderProps> = ({
  summary,
  loading,
}) => {
  const { t } = useTranslation();
  const activityRate = summary?.completionRate ?? 0;

  return (
    <motion.header
      {...fadeInUp}
      className="admin-meetings-hero"
      aria-labelledby="meetings-overview-title"
    >
      <motion.div
        className="admin-meetings-hero__glow"
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />
      <motion.div className="admin-meetings-hero__content" {...fadeInUp}>
        <motion.div className="admin-meetings-hero__badge" {...fadeInUp}>
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          <span>{t('admin.modules.meetings.overview.badge', { defaultValue: 'Supervision operations' })}</span>
        </motion.div>
        <h1 id="meetings-overview-title" className="admin-meetings-hero__title">
          {t('admin.modules.meetings.overview.title', { defaultValue: 'Meetings overview' })}
        </h1>
        <p className="admin-meetings-hero__subtitle">
          {t('admin.modules.meetings.subtitle', {
            defaultValue: 'Academic agenda. Monitor supervisor and student meetings.',
          })}
        </p>
        <div className="admin-meetings-hero__metrics">
          <motion.div className="admin-meetings-hero__metric" {...fadeInUp}>
            <CalendarDays className="h-4 w-4 shrink-0 text-[var(--admin-brand)]" aria-hidden />
            <span className="admin-meetings-hero__metric-label">
              {t('admin.modules.meetings.overview.activePipeline', {
                defaultValue: 'In progress',
              })}
            </span>
            <span className="admin-meetings-hero__metric-value">
              {loading ? '—' : (summary?.upcoming ?? 0) + (summary?.inProgress ?? 0)}
            </span>
          </motion.div>
          <motion.div className="admin-meetings-hero__metric" {...fadeInUp}>
            <Activity className="h-4 w-4 shrink-0 text-[var(--admin-brand)]" aria-hidden />
            <span className="admin-meetings-hero__metric-label">
              {t('admin.modules.meetings.overview.activityRate', {
                defaultValue: 'Supervision activity rate',
              })}
            </span>
            <span className="admin-meetings-hero__metric-value">
              {loading ? '—' : `${activityRate}%`}
            </span>
            {!loading && summary ? (
              <span
                className={`admin-meetings-trend ${activityRate >= 70 ? 'admin-meetings-trend--up' : 'admin-meetings-trend--neutral'}`}
                aria-hidden
              >
                {activityRate >= 70 ? '↑' : '→'}
              </span>
            ) : null}
          </motion.div>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default MeetingsOverviewHeader;
