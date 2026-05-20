import { FunctionComponent, useMemo, useState } from 'react';
import {
  Bookmark,
  CalendarClock,
  ExternalLink,
  Eye,
  FileText,
  MessageSquare,
  RefreshCw,
  Upload,
  User,
  Users,
} from 'lucide-react';
import {
  ADMIN_HISTORY_ICON_PROPS,
  type AdminHistoryCircleVariant,
} from '../../../../admin/shared/admin-module-history/adminHistoryUi';
import StudentModuleHistory from '../components/StudentModuleHistory';
import type { HistoryRowDisplay } from '../types';
import {
  studentInternshipHistoryTimelineSeed,
  StudentInternshipHistoryRow,
  StudentInternshipHistoryStatus,
} from '../data/studentInternshipHistoryMock';

function statusLabel(status: StudentInternshipHistoryStatus): string {
  switch (status) {
    case 'viewed_offer':
      return 'Viewed offer';
    case 'saved_offer':
      return 'Saved offer';
    case 'applied':
      return 'Applied';
    case 'cv_uploaded':
      return 'CV uploaded';
    case 'cv_analysis_used':
      return 'CV Analysis';
    case 'interview_simulator_used':
      return 'Interview Simulator';
    case 'chat_question':
      return 'Chat question';
    case 'external_link_confirmed':
      return 'External link';
    case 'application_status_changed':
      return 'Status updated';
    case 'deadline_reminder':
      return 'Deadline reminder';
    default:
      return status;
  }
}

function statusCircleVariant(status: StudentInternshipHistoryStatus): AdminHistoryCircleVariant {
  switch (status) {
    case 'viewed_offer':
    case 'saved_offer':
    case 'cv_analysis_used':
    case 'interview_simulator_used':
      return 'info';
    case 'applied':
    case 'cv_uploaded':
    case 'external_link_confirmed':
      return 'event';
    case 'chat_question':
    case 'application_status_changed':
      return 'success';
    case 'deadline_reminder':
      return 'danger';
    default:
      return 'neutral';
  }
}

function glyphFor(status: StudentInternshipHistoryStatus) {
  switch (status) {
    case 'viewed_offer':
      return <Eye {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'saved_offer':
      return <Bookmark {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'applied':
      return <User {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'cv_uploaded':
      return <Upload {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'cv_analysis_used':
      return <FileText {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'interview_simulator_used':
      return <Users {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'chat_question':
      return <MessageSquare {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'external_link_confirmed':
      return <ExternalLink {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'application_status_changed':
      return <RefreshCw {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'deadline_reminder':
      return <CalendarClock {...ADMIN_HISTORY_ICON_PROPS} />;
    default:
      return <User {...ADMIN_HISTORY_ICON_PROPS} />;
  }
}

function rowToDisplay(row: StudentInternshipHistoryRow): HistoryRowDisplay {
  return {
    id: row.id,
    glyph: glyphFor(row.status),
    badgeLabel: statusLabel(row.status),
    circleVariant: statusCircleVariant(row.status),
    actorName: row.actorName,
    headline: row.headline,
    metaLine: row.company,
    date: row.date,
    time: row.time,
  };
}

const HistoryPage: FunctionComponent = () => {
  const [search, setSearch] = useState('');
  const [activityType, setActivityType] = useState('all');
  const [expireOffer, setExpireOffer] = useState('all');

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return studentInternshipHistoryTimelineSeed.filter((row) => {
      if (activityType !== 'all' && row.activityCategory !== activityType) return false;
      if (expireOffer !== 'all' && row.offerExpiry !== expireOffer) return false;
      if (!q) return true;
      const hay = [
        row.actorName,
        row.headline,
        row.company,
        statusLabel(row.status),
        row.activityCategory,
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [search, activityType, expireOffer]);

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
            { value: 'applications', label: 'Applications' },
            { value: 'saved', label: 'Saved offers' },
            { value: 'tools', label: 'Tools' },
            { value: 'chat', label: 'Chat' },
            { value: 'offers', label: 'Offers' },
          ],
        },
        {
          ariaLabel: 'Offer expiry',
          placeholderOptionLabel: 'Expire offer',
          value: expireOffer,
          onChange: setExpireOffer,
          options: [
            { value: 'active', label: 'Active' },
            { value: 'expiring_soon', label: 'Expiring soon' },
            { value: 'expired', label: 'Expired' },
          ],
        },
      ]}
      rows={rows.map(rowToDisplay)}
      emptyMessage="No internship offer activity matches your filters."
    />
  );
};

export default HistoryPage;
