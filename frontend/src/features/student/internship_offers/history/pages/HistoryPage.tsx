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
import type { HistoryEventDto } from '../../../../admin/api/history';
import {
  ADMIN_HISTORY_ICON_PROPS,
  type AdminHistoryCircleVariant,
} from '../../../../admin/shared/admin-module-history/adminHistoryUi';
import { useStudentInternshipHistory } from '../../hooks/useStudentStageOffers';
import StudentModuleHistory from '../components/StudentModuleHistory';
import type { HistoryRowDisplay } from '../types';

function formatEventDate(iso: string): { date: string; time: string } {
  try {
    const d = new Date(iso);
    return {
      date: new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d),
      time: new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(d),
    };
  } catch {
    return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
  }
}

function circleVariantFor(event: HistoryEventDto): AdminHistoryCircleVariant {
  const code = event.event_code.toLowerCase();
  if (code.includes('reject') || code.includes('deadline')) return 'danger';
  if (code.includes('accept') || code.includes('publish')) return 'success';
  if (code.includes('apply') || code.includes('submit')) return 'event';
  if (code.includes('view') || code.includes('chat')) return 'info';
  return 'neutral';
}

function glyphForEvent(event: HistoryEventDto) {
  const code = event.event_code.toLowerCase();
  if (code.includes('view')) return <Eye {...ADMIN_HISTORY_ICON_PROPS} />;
  if (code.includes('save') || code.includes('bookmark')) return <Bookmark {...ADMIN_HISTORY_ICON_PROPS} />;
  if (code.includes('apply') || code.includes('submit')) return <User {...ADMIN_HISTORY_ICON_PROPS} />;
  if (code.includes('upload') || code.includes('cv')) return <Upload {...ADMIN_HISTORY_ICON_PROPS} />;
  if (code.includes('analysis')) return <FileText {...ADMIN_HISTORY_ICON_PROPS} />;
  if (code.includes('interview')) return <Users {...ADMIN_HISTORY_ICON_PROPS} />;
  if (code.includes('chat')) return <MessageSquare {...ADMIN_HISTORY_ICON_PROPS} />;
  if (code.includes('external') || code.includes('link')) return <ExternalLink {...ADMIN_HISTORY_ICON_PROPS} />;
  if (code.includes('status') || code.includes('update')) return <RefreshCw {...ADMIN_HISTORY_ICON_PROPS} />;
  if (code.includes('deadline')) return <CalendarClock {...ADMIN_HISTORY_ICON_PROPS} />;
  return <User {...ADMIN_HISTORY_ICON_PROPS} />;
}

function activityCategoryFor(event: HistoryEventDto): string {
  const code = event.event_code.toLowerCase();
  if (code.includes('apply') || code.includes('application')) return 'applications';
  if (code.includes('save') || code.includes('bookmark')) return 'saved';
  if (code.includes('chat')) return 'chat';
  if (code.includes('cv') || code.includes('interview') || code.includes('analysis')) return 'tools';
  return 'offers';
}

const HistoryPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [activityType, setActivityType] = useState('all');
  const [expireOffer, setExpireOffer] = useState('all');

  const { rows: apiRows, loading, error } = useStudentInternshipHistory(search, activityType);

  const rowToDisplay = useCallback((row: HistoryEventDto): HistoryRowDisplay => {
    const { date, time } = formatEventDate(row.occurred_at);
    const company =
      (row.details?.company_name as string | undefined) ??
      (row.new_values?.company_name as string | undefined) ??
      row.entity_type;

    return {
      id: String(row.id),
      glyph: glyphForEvent(row),
      badgeLabel: row.summary.slice(0, 48),
      circleVariant: circleVariantFor(row),
      actorName: row.is_automated ? 'Système' : row.actor_name || row.actor_email,
      headline: row.summary,
      metaLine: company,
      date,
      time,
    };
  }, []);

  const rows = useMemo(() => {
    return apiRows
      .filter((row) => {
        if (activityType !== 'all' && activityCategoryFor(row) !== activityType) return false;
        if (expireOffer !== 'all') {
          const expiry = (row.details?.offer_expiry as string | undefined) ?? 'active';
          if (expiry !== expireOffer) return false;
        }
        return true;
      })
      .map(rowToDisplay);
  }, [apiRows, activityType, expireOffer, rowToDisplay]);

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
      emptyMessage={
        loading
          ? 'Chargement…'
          : error ?? t('student.internshipOffers.history.empty')
      }
    />
  );
};

export default HistoryPage;
