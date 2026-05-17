import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Briefcase,
  Check,
  FilePenLine,
  SendHorizontal,
  UserPlus,
  X,
  User,
  CalendarClock,
  Megaphone,
} from 'lucide-react';
import AdminModuleHistory from '../../../shared/admin-module-history/AdminModuleHistory';
import type { AdminHistoryRowDisplay } from '../../../shared/admin-module-history/adminHistoryTypes';
import {
  ADMIN_HISTORY_ICON_PROPS,
  adminHistoryBadgeClass,
  adminHistoryCircleClass,
  type AdminHistoryCircleVariant,
} from '../../../shared/admin-module-history/adminHistoryUi';
import {
  internshipOffersHistoryTimelineSeed,
  InternshipOffersTimelineRow,
  InternshipOffersTimelineStatus,
} from '../data/internshipOffersHistoryMock';

const STATUS_PREFIX = 'admin.historyUi.offers.status';
const FILTER_PREFIX = 'admin.historyUi.offers.filters';
const ROW_PREFIX = 'admin.historyUi.offers.rows';

function statusVariant(status: InternshipOffersTimelineStatus): AdminHistoryCircleVariant {
  switch (status) {
    case 'applied':
      return 'event';
    case 'accepted':
    case 'cv_sent':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'offer_created':
    case 'candidate_assigned':
      return 'interview';
    case 'offer_edited':
    case 'offer_published':
      return 'warning';
    case 'offer_expired':
      return 'neutral';
    default:
      return 'neutral';
  }
}

function glyphFor(row: InternshipOffersTimelineRow) {
  switch (row.status) {
    case 'applied':
      return <User {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'accepted':
      return <Check {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'rejected':
      return <X {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'offer_created':
      return <Briefcase {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'offer_edited':
      return <FilePenLine {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'offer_published':
      return <Megaphone {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'offer_expired':
      return <CalendarClock {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'candidate_assigned':
      return <UserPlus {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'cv_sent':
      return <SendHorizontal {...ADMIN_HISTORY_ICON_PROPS} />;
    default:
      return <User {...ADMIN_HISTORY_ICON_PROPS} />;
  }
}

const InternshipOffersHistoryPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [studentClass, setStudentClass] = useState('all');
  const [expireOffer, setExpireOffer] = useState('all');

  const statusLabel = useCallback(
    (status: InternshipOffersTimelineStatus) => t(`${STATUS_PREFIX}.${status}`),
    [t]
  );

  const rowField = useCallback(
    (rowId: string, field: 'actorName' | 'headline' | 'company', fallback: string) => {
      const key = `${ROW_PREFIX}.${rowId}.${field}`;
      const value = t(key);
      return value === key ? fallback : value;
    },
    [t]
  );

  const rowToDisplay = useCallback(
    (row: InternshipOffersTimelineRow): AdminHistoryRowDisplay => {
      const variant = statusVariant(row.status);
      return {
        id: row.id,
        glyph: glyphFor(row),
        badgeLabel: statusLabel(row.status),
        badgeClassName: adminHistoryBadgeClass(variant),
        circleBgClassName: adminHistoryCircleClass(variant),
        circleVariant: variant,
        actorName: rowField(row.id, 'actorName', row.actorName),
        headline: rowField(row.id, 'headline', row.headline),
        metaLine: rowField(row.id, 'company', row.company),
        date: row.date,
        time: row.time,
      };
    },
    [statusLabel, rowField]
  );

  const classOptions = useMemo(
    () => [
      { value: '1st year', label: t(`${FILTER_PREFIX}.year1`) },
      { value: '2nd year', label: t(`${FILTER_PREFIX}.year2`) },
      { value: '3rd year', label: t(`${FILTER_PREFIX}.year3`) },
    ],
    [t]
  );

  const expiryOptions = useMemo(
    () => [
      { value: 'active', label: t(`${FILTER_PREFIX}.active`) },
      { value: 'expiring_soon', label: t(`${FILTER_PREFIX}.expiringSoon`) },
      { value: 'expired', label: t(`${FILTER_PREFIX}.expired`) },
    ],
    [t]
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return internshipOffersHistoryTimelineSeed.filter((row) => {
      if (studentClass !== 'all') {
        if (row.studentClass != null && row.studentClass !== studentClass) return false;
      }
      if (expireOffer !== 'all' && row.offerExpiry !== expireOffer) return false;
      if (!q) return true;
      const display = rowToDisplay(row);
      const hay = [
        display.actorName,
        display.headline,
        display.metaLine ?? '',
        statusLabel(row.status),
        row.studentClass ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [search, studentClass, expireOffer, statusLabel, rowToDisplay]);

  return (
    <AdminModuleHistory
      searchValue={search}
      onSearchChange={setSearch}
      filters={[
        {
          ariaLabel: t(`${FILTER_PREFIX}.studentCohortAria`),
          placeholderOptionLabel: t(`${FILTER_PREFIX}.studentClass`),
          value: studentClass,
          onChange: setStudentClass,
          options: classOptions,
        },
        {
          ariaLabel: t(`${FILTER_PREFIX}.offerExpiryAria`),
          placeholderOptionLabel: t(`${FILTER_PREFIX}.expireOffer`),
          value: expireOffer,
          onChange: setExpireOffer,
          options: expiryOptions,
        },
      ]}
      rows={rows.map(rowToDisplay)}
    />
  );
};

export default InternshipOffersHistoryPage;
