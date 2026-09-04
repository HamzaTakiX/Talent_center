import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import AdminSectionEmptyState from '../../../ui/AdminSectionEmptyState';
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
    <section
      className="admin-meetings-encadrants admin-module-panel"
      aria-labelledby="meetings-encadrant-load-title"
    >
      <header className="admin-meetings-encadrants__head">
        <div className="admin-meetings-encadrants__title-wrap">
          <span className="admin-meetings-encadrants__icon" aria-hidden>
            <Users className="h-4 w-4" strokeWidth={2} />
          </span>
          <h3 id="meetings-encadrant-load-title" className="admin-meetings-panel-title">
            {t('admin.modules.meetings.overview.encadrantLoad', {
              defaultValue: 'Supervision load by supervisor',
            })}
          </h3>
        </div>
        {rows.length > 0 ? (
          <span className="admin-meetings-encadrants__count">{rows.length}</span>
        ) : null}
      </header>

      <div className="admin-meetings-encadrants__body">
        {loading ? (
          <AdminSectionSkeletonShell className="admin-meetings-encadrants-skeleton">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="admin-shimmer admin-meetings-encadrants-skeleton__row" aria-hidden />
            ))}
          </AdminSectionSkeletonShell>
        ) : !rows.length ? (
          <AdminSectionEmptyState
            variant="inline"
            iconPreset="users"
            title={t('admin.modules.meetings.overview.empty', { defaultValue: 'No supervision activity' })}
            description={t('admin.modules.meetings.overview.emptyDesc', {
              defaultValue: 'Encadrant meeting metrics will appear when sessions are scheduled.',
            })}
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
      </div>
    </section>
  );
};

export default EncadrantSupervisionOverview;
