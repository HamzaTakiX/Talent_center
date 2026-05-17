import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Archive, Megaphone, PenLine, Radio, Shuffle, Trophy, CalendarClock } from 'lucide-react';
import AdminModuleHistory from '../../../shared/admin-module-history/AdminModuleHistory';
import type { AdminHistoryRowDisplay } from '../../../shared/admin-module-history/adminHistoryTypes';
import {
  ADMIN_HISTORY_ICON_PROPS,
  adminHistoryBadgeClass,
  adminHistoryCircleClass,
  type AdminHistoryCircleVariant,
} from '../../../shared/admin-module-history/adminHistoryUi';
import {
  ANNOUNCEMENTS_AUDIENCE_SCOPES,
  ANNOUNCEMENTS_LIFECYCLE_FILTERS,
} from '../constants/announcementsHistoryFilters';
import {
  AnnouncementsTimelineRow,
  AnnouncementsTimelineStatus,
  announcementsHistorySeed,
} from '../data/announcementsHistoryMock';

const STATUS_PREFIX = 'admin.historyUi.announcements.status';
const FILTER_PREFIX = 'admin.historyUi.announcements.filters';
const AUDIENCE_PREFIX = 'admin.historyUi.announcements.audienceScope';
const ROW_PREFIX = 'admin.historyUi.announcements.rows';

function statusVariant(s: AnnouncementsTimelineStatus): AdminHistoryCircleVariant {
  switch (s) {
    case 'announcement_archived':
      return 'neutral';
    case 'announcement_published':
    case 'competition_rollout':
      return 'warning';
    case 'deadline_adjusted':
      return 'event';
    case 'audience_changed':
      return 'interview';
    case 'announcement_created':
      return 'success';
    case 'interview_wave':
      return 'danger';
    default:
      return 'neutral';
  }
}

function glyph(row: AnnouncementsTimelineRow) {
  switch (row.status) {
    case 'announcement_created':
      return <PenLine {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'announcement_published':
      return <Megaphone {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'deadline_adjusted':
      return <CalendarClock {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'audience_changed':
      return <Shuffle {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'announcement_archived':
      return <Archive {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'competition_rollout':
      return <Trophy {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'interview_wave':
      return <Radio {...ADMIN_HISTORY_ICON_PROPS} />;
    default:
      return <Megaphone {...ADMIN_HISTORY_ICON_PROPS} />;
  }
}

const AnnouncementsHistoryPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [audienceScope, setAudienceScope] = useState('all');
  const [lifecycle, setLifecycle] = useState('all');

  const statusLabel = useCallback(
    (status: AnnouncementsTimelineStatus) => t(`${STATUS_PREFIX}.${status}`),
    [t]
  );

  const audienceLabel = useCallback(
    (value: (typeof ANNOUNCEMENTS_AUDIENCE_SCOPES)[number]['value']) => {
      const entry = ANNOUNCEMENTS_AUDIENCE_SCOPES.find((o) => o.value === value);
      return entry ? t(`${AUDIENCE_PREFIX}.${entry.labelKey}`) : value;
    },
    [t]
  );

  const rowField = useCallback(
    (rowId: string, field: 'actorName' | 'headline' | 'venueOrChannel', fallback: string) => {
      const key = `${ROW_PREFIX}.${rowId}.${field}`;
      const value = t(key);
      return value === key ? fallback : value;
    },
    [t]
  );

  const rowToDisplay = useCallback(
    (row: AnnouncementsTimelineRow): AdminHistoryRowDisplay => {
      const variant = statusVariant(row.status);
      return {
        id: row.id,
        glyph: glyph(row),
        badgeLabel: statusLabel(row.status),
        badgeClassName: adminHistoryBadgeClass(variant),
        circleBgClassName: adminHistoryCircleClass(variant),
        circleVariant: variant,
        actorName: rowField(row.id, 'actorName', row.actorName),
        headline: rowField(row.id, 'headline', row.headline),
        metaLine: rowField(row.id, 'venueOrChannel', row.venueOrChannel),
        date: row.date,
        time: row.time,
      };
    },
    [statusLabel, rowField]
  );

  const audienceOptions = useMemo(
    () =>
      ANNOUNCEMENTS_AUDIENCE_SCOPES.map((o) => ({
        value: o.value,
        label: t(`${AUDIENCE_PREFIX}.${o.labelKey}`),
      })),
    [t]
  );

  const lifecycleOptions = useMemo(
    () =>
      ANNOUNCEMENTS_LIFECYCLE_FILTERS.map((o) => ({
        value: o.value,
        label: t(`${FILTER_PREFIX}.${o.labelKey}`),
      })),
    [t]
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return announcementsHistorySeed.filter((row) => {
      if (audienceScope !== 'all' && row.audienceScope !== audienceScope) return false;
      if (lifecycle !== 'all' && row.lifecycle !== lifecycle) return false;
      if (!q) return true;
      const display = rowToDisplay(row);
      const hay = [
        display.actorName,
        display.headline,
        display.metaLine,
        statusLabel(row.status),
        audienceLabel(row.audienceScope),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [search, audienceScope, lifecycle, rowToDisplay, statusLabel, audienceLabel]);

  return (
    <AdminModuleHistory
      searchValue={search}
      onSearchChange={setSearch}
      filters={[
        {
          ariaLabel: t(`${FILTER_PREFIX}.audienceAria`),
          placeholderOptionLabel: t(`${FILTER_PREFIX}.audience`),
          value: audienceScope,
          onChange: setAudienceScope,
          options: audienceOptions,
        },
        {
          ariaLabel: t(`${FILTER_PREFIX}.lifecycleAria`),
          placeholderOptionLabel: t(`${FILTER_PREFIX}.lifecycle`),
          value: lifecycle,
          onChange: setLifecycle,
          options: lifecycleOptions,
        },
      ]}
      rows={rows.map(rowToDisplay)}
    />
  );
};

export default AnnouncementsHistoryPage;
