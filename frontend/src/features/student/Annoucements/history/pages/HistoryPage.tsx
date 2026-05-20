import { FunctionComponent, useMemo, useState } from 'react';
import {
  Bell,
  Bookmark,
  CalendarClock,
  Eye,
  MessageSquare,
  UserCheck,
  X,
} from 'lucide-react';
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

function statusLabel(status: StudentAnnouncementsHistoryStatus): string {
  switch (status) {
    case 'viewed_announcement':
      return 'Viewed';
    case 'read_announcement':
      return 'Read';
    case 'saved_announcement':
      return 'Saved';
    case 'dismissed_announcement':
      return 'Dismissed';
    case 'replied_in_chat':
      return 'Chat reply';
    case 'event_registered':
      return 'Registered';
    case 'deadline_reminder':
      return 'Deadline';
    default:
      return status;
  }
}

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

function rowToDisplay(row: StudentAnnouncementsHistoryRow): HistoryRowDisplay {
  return {
    id: row.id,
    glyph: glyphFor(row.status),
    badgeLabel: statusLabel(row.status),
    circleVariant: statusCircleVariant(row.status),
    actorName: row.actorName,
    headline: row.headline,
    metaLine: row.channel,
    date: row.date,
    time: row.time,
  };
}

const HistoryPage: FunctionComponent = () => {
  const [search, setSearch] = useState('');
  const [activityType, setActivityType] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return studentAnnouncementsHistoryTimelineSeed.filter((row) => {
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
    });
  }, [search, activityType, priorityFilter]);

  return (
    <StudentModuleHistory
      searchValue={search}
      onSearchChange={setSearch}
      filters={[
        {
          ariaLabel: 'Activity type',
          placeholderOptionLabel: 'Activity type',
          value: activityType,
          onChange: setActivityType,
          options: [
            { value: 'events', label: 'Events' },
            { value: 'deadlines', label: 'Deadlines' },
            { value: 'competitions', label: 'Competitions' },
            { value: 'general', label: 'General' },
            { value: 'chat', label: 'Chat' },
          ],
        },
        {
          ariaLabel: 'Priority',
          placeholderOptionLabel: 'Priority',
          value: priorityFilter,
          onChange: setPriorityFilter,
          options: [
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
          ],
        },
      ]}
      rows={rows.map(rowToDisplay)}
      emptyMessage="No announcement activity matches your filters."
    />
  );
};

export default HistoryPage;
