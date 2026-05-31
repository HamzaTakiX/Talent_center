import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import {
  Bell,
  Bookmark,
  CalendarClock,
  Eye,
  MessageSquare,
  UserCheck,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  ADMIN_HISTORY_ICON_PROPS,
  type AdminHistoryCircleVariant,
} from '../../../../admin/shared/admin-module-history/adminHistoryUi';
import StudentModuleHistory from '../../../internship_offers/history/components/StudentModuleHistory';
import type { HistoryRowDisplay } from '../../../internship_offers/history/types';
import {
  studentAnnouncementsHistoryTimelineSeed,
  StudentAnnouncementsHistoryRow,
  StudentAnnouncementsHistoryStatus,
} from '../data/studentAnnouncementsHistoryMock';

const STATUS_I18N_KEY: Record<StudentAnnouncementsHistoryStatus, string> = {
  viewed_announcement: 'student.announcements.history.statuses.viewed',
  read_announcement: 'student.announcements.history.statuses.read',
  saved_announcement: 'student.announcements.history.statuses.saved',
  dismissed_announcement: 'student.announcements.history.statuses.dismissed',
  replied_in_chat: 'student.announcements.history.statuses.chatReply',
  event_registered: 'student.announcements.history.statuses.registered',
  deadline_reminder: 'student.announcements.history.statuses.deadline',
};

function statusCircleVariant(status: StudentAnnouncementsHistoryStatus): AdminHistoryCircleVariant {
  switch (status) {
    case 'viewed_announcement':
    case 'read_announcement':
    case 'saved_announcement':
      return 'info';
    case 'event_registered':
    case 'replied_in_chat':
      return 'success';
    case 'deadline_reminder':
      return 'danger';
    case 'dismissed_announcement':
      return 'neutral';
    default:
      return 'neutral';
  }
}

function glyphFor(status: StudentAnnouncementsHistoryStatus) {
  switch (status) {
    case 'viewed_announcement':
      return <Eye {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'read_announcement':
      return <Bell {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'saved_announcement':
      return <Bookmark {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'dismissed_announcement':
      return <X {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'replied_in_chat':
      return <MessageSquare {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'event_registered':
      return <UserCheck {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'deadline_reminder':
      return <CalendarClock {...ADMIN_HISTORY_ICON_PROPS} />;
    default:
      return <Bell {...ADMIN_HISTORY_ICON_PROPS} />;
  }
}

const HistoryPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [activityType, setActivityType] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const statusLabel = useCallback(
    (status: StudentAnnouncementsHistoryStatus) => t(STATUS_I18N_KEY[status] ?? status),
    [t],
  );

  const rowToDisplay = useCallback(
    (row: StudentAnnouncementsHistoryRow): HistoryRowDisplay => ({
      id: row.id,
      glyph: glyphFor(row.status),
      badgeLabel: statusLabel(row.status),
      circleVariant: statusCircleVariant(row.status),
      actorName: row.actorName,
      headline: row.headline,
      metaLine: row.channel,
      date: row.date,
      time: row.time,
    }),
    [statusLabel],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return studentAnnouncementsHistoryTimelineSeed
      .filter((row) => {
        if (activityType !== 'all' && row.activityCategory !== activityType) return false;
        if (priorityFilter !== 'all' && row.priority !== priorityFilter) return false;
        if (!q) return true;
        const hay = [
          row.actorName,
          row.headline,
          row.channel,
          statusLabel(row.status),
          row.activityCategory,
        ]
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      })
      .map(rowToDisplay);
  }, [search, activityType, priorityFilter, statusLabel, rowToDisplay]);

  return (
    <StudentModuleHistory
      searchValue={search}
      onSearchChange={setSearch}
      filters={[
        {
          ariaLabel: t('student.announcements.history.activityType'),
          placeholderOptionLabel: t('student.announcements.history.activityType'),
          value: activityType,
          onChange: setActivityType,
          options: [
            { value: 'events', label: t('student.announcements.history.filters.events') },
            { value: 'deadlines', label: t('student.announcements.history.filters.deadlines') },
            { value: 'competitions', label: t('student.announcements.history.filters.competitions') },
            { value: 'general', label: t('student.announcements.history.filters.general') },
            { value: 'chat', label: t('student.announcements.history.filters.chat') },
          ],
        },
        {
          ariaLabel: t('student.announcements.history.priority'),
          placeholderOptionLabel: t('student.announcements.history.priority'),
          value: priorityFilter,
          onChange: setPriorityFilter,
          options: [
            { value: 'high', label: t('student.announcements.history.filters.high') },
            { value: 'medium', label: t('student.announcements.history.filters.medium') },
            { value: 'low', label: t('student.announcements.history.filters.low') },
          ],
        },
      ]}
      rows={rows}
      emptyMessage={t('student.announcements.history.empty')}
    />
  );
};

export default HistoryPage;
