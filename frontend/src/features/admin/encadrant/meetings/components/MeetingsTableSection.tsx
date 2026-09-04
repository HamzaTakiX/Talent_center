import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calendar, CalendarDays, ChevronRight, Users } from 'lucide-react';
import AdminPagination from '../../../ui/AdminPagination';
import AdminEmptyState from '../../../ui/AdminEmptyState';
import { AdminSectionSkeletonShell } from '../../../ui/AdminSectionSkeleton';
import type { SupervisionMeetingListItem } from '../types/supervisionMeeting';
import MeetingStatusBadge from './MeetingStatusBadge';
import { personInitials } from '../utils/meetingStatusMeta';
import { fadeInUp } from '../../../dashboard/ui/animations';

interface MeetingsTableSectionProps {
  items: SupervisionMeetingListItem[];
  loading?: boolean;
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  hasSearch?: boolean;
}

const MeetingsTableSection: FunctionComponent<MeetingsTableSectionProps> = ({
  items,
  loading,
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  hasSearch,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const locale = i18n.language === 'ar' ? 'ar-MA' : i18n.language === 'en' ? 'en-GB' : 'fr-FR';

  return (
    <div className="admin-meetings-list">
      <div className="admin-meetings-list__head">
        <div className="admin-meetings-list__title-wrap">
          <span className="admin-meetings-list__icon" aria-hidden>
            <CalendarDays className="h-4 w-4" strokeWidth={2} />
          </span>
          <h3 className="admin-meetings-panel-title">
            {t('admin.modules.meetings.table.sectionTitle', { defaultValue: 'Meeting list' })}
          </h3>
        </div>
        <span className="admin-meetings-list__count">{totalItems}</span>
      </div>

      {loading ? (
        <AdminSectionSkeletonShell className="admin-meetings-list-skeleton">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="admin-shimmer admin-meetings-list-skeleton__row" aria-hidden />
          ))}
        </AdminSectionSkeletonShell>
      ) : items.length === 0 ? (
        <AdminEmptyState
          title={
            hasSearch
              ? t('admin.modules.meetings.empty.search', { defaultValue: 'No matching meetings' })
              : t('admin.modules.meetings.empty.list', { defaultValue: 'No meetings yet' })
          }
          description={
            hasSearch
              ? t('admin.modules.meetings.empty.searchDesc', {
                  defaultValue: 'Try adjusting filters or search terms.',
                })
              : t('admin.modules.meetings.empty.listDesc', {
                  defaultValue: 'Scheduled supervision meetings will appear here.',
                })
          }
          icon={<Calendar className="h-10 w-10 text-[var(--admin-brand)]" strokeWidth={1.25} />}
        />
      ) : (
        <ul className="admin-meetings-list__rows">
          {items.map((row, index) => (
            <motion.li
              key={row.id}
              {...fadeInUp}
              transition={{ delay: index * 0.04 }}
            >
              <button
                type="button"
                className="admin-meetings-row-card"
                onClick={() => navigate(`/admin/encadrant/meetings/${row.id}`)}
              >
                <span className="admin-meetings-row-card__rail" aria-hidden />
                <span className="admin-meetings-row-card__avatar" aria-hidden>
                  {personInitials(row.student || row.encadrant)}
                </span>
                <span className="admin-meetings-row-card__main">
                  <span className="admin-meetings-row-card__title">{row.title}</span>
                  <span className="admin-meetings-row-card__meta">
                    <Users className="h-3 w-3 shrink-0" aria-hidden />
                    {row.encadrant} · {row.student || '—'}
                  </span>
                  <span className="admin-meetings-row-card__sub">
                    {t(`admin.modules.meetings.type.${row.meetingType}`, {
                      defaultValue: row.meetingType,
                    })}
                    {row.internshipType ? ` · ${row.internshipType}` : ''}
                  </span>
                </span>
                <span className="admin-meetings-row-card__aside">
                  <span className="admin-meetings-row-card__when">
                    {row.plannedStart
                      ? new Date(row.plannedStart).toLocaleString(locale, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : '—'}
                  </span>
                  <MeetingStatusBadge status={row.status} />
                </span>
                <ChevronRight className="admin-meetings-row-card__chevron h-4 w-4" aria-hidden />
              </button>
            </motion.li>
          ))}
        </ul>
      )}

      <AdminPagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
        itemLabel={t('admin.modules.meetings.table.items', { defaultValue: 'meetings' })}
      />
    </div>
  );
};

export default MeetingsTableSection;
