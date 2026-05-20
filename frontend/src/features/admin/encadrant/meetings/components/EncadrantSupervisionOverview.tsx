import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { UserCircle } from 'lucide-react';
import AdminEmptyState from '../../../ui/AdminEmptyState';
import { AdminSectionSkeletonShell } from '../../../ui/AdminSectionSkeleton';
import type { EncadrantMeetingOverview } from '../types/supervisionMeeting';
import { personInitials } from '../utils/meetingStatusMeta';
import { fadeInUp } from '../../../dashboard/ui/animations';

interface EncadrantSupervisionOverviewProps {
  rows: EncadrantMeetingOverview[];
  loading?: boolean;
}

const EncadrantSupervisionOverview: FunctionComponent<EncadrantSupervisionOverviewProps> = ({
  rows,
  loading,
}) => {
  const { t } = useTranslation();

  return (
    <section className="admin-meetings-encadrants admin-card">
      <h3 className="admin-meetings-panel-title admin-meetings-encadrants__title">
        {t('admin.modules.meetings.overview.encadrantLoad', {
          defaultValue: 'Supervision load by supervisor',
        })}
      </h3>

      {loading ? (
        <AdminSectionSkeletonShell className="admin-meetings-encadrants-skeleton">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="admin-shimmer admin-meetings-encadrants-skeleton__row" aria-hidden />
          ))}
        </AdminSectionSkeletonShell>
      ) : !rows.length ? (
        <AdminEmptyState
          title={t('admin.modules.meetings.overview.empty', { defaultValue: 'No supervision activity' })}
          description={t('admin.modules.meetings.overview.emptyDesc', {
            defaultValue: 'Encadrant meeting metrics will appear when sessions are scheduled.',
          })}
          icon={<UserCircle className="h-10 w-10 text-[var(--admin-brand)]" strokeWidth={1.25} />}
        />
      ) : (
        <ul className="admin-meetings-encadrants__list">
          {rows.slice(0, 12).map((row, index) => (
            <motion.li
              key={row.encadrantId}
              className="admin-meetings-encadrant-row"
              {...fadeInUp}
              transition={{ delay: index * 0.04 }}
            >
              <span className="admin-meetings-encadrant-row__avatar" aria-hidden>
                {personInitials(row.encadrantName)}
              </span>
              <span className="admin-meetings-encadrant-row__info">
                <span className="admin-meetings-encadrant-row__name">{row.encadrantName}</span>
                <span className="admin-meetings-encadrant-row__stats">
                  {t('admin.modules.meetings.overview.rowStats', {
                    defaultValue: '{{completed}} / {{total}} completed · {{students}} students',
                    completed: row.completedMeetings,
                    total: row.totalMeetings,
                    students: row.activeStudents,
                  })}
                </span>
              </span>
              <span className="admin-meetings-encadrant-row__rate">
                <span
                  className="admin-meetings-encadrant-row__rate-bar"
                  style={{ width: `${Math.min(100, row.completionRate)}%` }}
                  aria-hidden
                />
                <span className="admin-meetings-encadrant-row__rate-label">{row.completionRate}%</span>
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default EncadrantSupervisionOverview;
