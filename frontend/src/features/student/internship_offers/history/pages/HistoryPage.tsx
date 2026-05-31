import { FunctionComponent, useCallback, useMemo, useState } from 'react';
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
import { useTranslation } from 'react-i18next';
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

const STATUS_I18N_KEY: Record<StudentInternshipHistoryStatus, string> = {
  viewed_offer: 'student.internshipOffers.history.statuses.viewed',
  saved_offer: 'student.internshipOffers.history.statuses.saved',
  applied: 'student.internshipOffers.history.statuses.applied',
  cv_uploaded: 'student.internshipOffers.history.statuses.cvUploaded',
  cv_analysis_used: 'student.internshipOffers.history.statuses.cvAnalysis',
  interview_simulator_used: 'student.internshipOffers.history.statuses.interviewSimulator',
  chat_question: 'student.internshipOffers.history.statuses.chatQuestion',
  external_link_confirmed: 'student.internshipOffers.history.statuses.externalLink',
  application_status_changed: 'student.internshipOffers.history.statuses.statusUpdated',
  deadline_reminder: 'student.internshipOffers.history.statuses.deadlineReminder',
};

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

const HistoryPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [activityType, setActivityType] = useState('all');
  const [expireOffer, setExpireOffer] = useState('all');

  const statusLabel = useCallback(
    (status: StudentInternshipHistoryStatus) => t(STATUS_I18N_KEY[status] ?? status),
    [t],
  );

  const rowToDisplay = useCallback(
    (row: StudentInternshipHistoryRow): HistoryRowDisplay => ({
      id: row.id,
      glyph: glyphFor(row.status),
      badgeLabel: statusLabel(row.status),
      circleVariant: statusCircleVariant(row.status),
      actorName: row.actorName,
      headline: row.headline,
      metaLine: row.company,
      date: row.date,
      time: row.time,
    }),
    [statusLabel],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return studentInternshipHistoryTimelineSeed
      .filter((row) => {
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
      })
      .map(rowToDisplay);
  }, [search, activityType, expireOffer, statusLabel, rowToDisplay]);

  return (
    <StudentModuleHistory
      searchValue={search}
      onSearchChange={setSearch}
      filters={[
        {
          ariaLabel: t('student.internshipOffers.history.activityType'),
          placeholderOptionLabel: t('student.internshipOffers.history.activityType'),
          value: activityType,
          onChange: setActivityType,
          options: [
            { value: 'applications', label: t('student.internshipOffers.history.filters.applications') },
            { value: 'saved', label: t('student.internshipOffers.history.filters.saved') },
            { value: 'tools', label: t('student.internshipOffers.history.filters.tools') },
            { value: 'chat', label: t('student.internshipOffers.history.filters.chat') },
            { value: 'offers', label: t('student.internshipOffers.history.filters.offers') },
          ],
        },
        {
          ariaLabel: t('student.internshipOffers.history.offerExpiry'),
          placeholderOptionLabel: t('student.internshipOffers.history.offerExpiry'),
          value: expireOffer,
          onChange: setExpireOffer,
          options: [
            { value: 'active', label: t('student.internshipOffers.history.filters.active') },
            { value: 'expiring_soon', label: t('student.internshipOffers.history.filters.expiringSoon') },
            { value: 'expired', label: t('student.internshipOffers.history.filters.expired') },
          ],
        },
      ]}
      rows={rows}
      emptyMessage={t('student.internshipOffers.history.empty')}
    />
  );
};

export default HistoryPage;
