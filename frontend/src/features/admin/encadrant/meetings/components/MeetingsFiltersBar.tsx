import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, X } from 'lucide-react';
import AdminSearchInput from '../../../ui/AdminSearchInput';
import AdminSelectField from '../../../ui/AdminSelectField';
import AdminToggle from '../../../account/components/AdminToggle';
import type { SupervisionMeetingListParams } from '../types/supervisionMeeting';

interface MeetingsFiltersBarProps {
  filters: SupervisionMeetingListParams;
  onChange: (next: SupervisionMeetingListParams) => void;
}

const STATUS_OPTIONS = [
  'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED',
  'RESCHEDULED', 'CANCELLED', 'MISSED', 'NEEDS_FOLLOWUP',
] as const;

const TYPE_OPTIONS = [
  'FOLLOW_UP', 'INTERNSHIP_COACHING', 'PROGRESS_REVIEW', 'MID_TERM_EVAL',
  'FINAL_EVAL', 'PROBLEM_RESOLUTION', 'EMERGENCY', 'ORIENTATION', 'ONLINE', 'COMPANY_FOLLOWUP',
] as const;

const MeetingsFiltersBar: FunctionComponent<MeetingsFiltersBarProps> = ({ filters, onChange }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);

  const statusOptions = useMemo(
    () => [
      { value: '', label: t('admin.modules.meetings.filters.allStatuses', { defaultValue: 'All statuses' }) },
      ...STATUS_OPTIONS.map((s) => ({
        value: s,
        label: t(`admin.modules.meetings.status.${s}`, { defaultValue: s }),
      })),
    ],
    [t],
  );

  const typeOptions = useMemo(
    () => [
      { value: '', label: t('admin.modules.meetings.filters.allTypes', { defaultValue: 'All types' }) },
      ...TYPE_OPTIONS.map((s) => ({
        value: s,
        label: t(`admin.modules.meetings.type.${s}`, { defaultValue: s }),
      })),
    ],
    [t],
  );

  const hasActiveFilters = Boolean(
    filters.status || filters.meeting_type || filters.date_from || filters.date_to || filters.upcoming || filters.overdue,
  );

  const clearFilters = () => {
    onChange({
      ...filters,
      status: undefined,
      meeting_type: undefined,
      date_from: undefined,
      date_to: undefined,
      upcoming: undefined,
      overdue: undefined,
      page: 1,
    });
  };

  return (
    <div className="admin-meetings-filters">
      <div className="admin-meetings-filters__head">
        <div className="admin-meetings-filters__search">
          <AdminSearchInput
            value={filters.search ?? ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
            onClear={() => onChange({ ...filters, search: '', page: 1 })}
            placeholder={t('admin.modules.meetings.filters.search', { defaultValue: 'Search meetings…' })}
            aria-label={t('admin.modules.meetings.filters.search', { defaultValue: 'Search meetings…' })}
          />
        </div>
        <button
          type="button"
          className={`admin-meetings-filters__toggle-btn${expanded ? ' is-open' : ''}${hasActiveFilters ? ' is-active' : ''}`}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <Filter className="h-4 w-4" aria-hidden />
          {t('admin.modules.meetings.filters.advanced', { defaultValue: 'Filters' })}
        </button>
      </div>

      {expanded ? (
        <div className="admin-meetings-filters__body">
          <div className="admin-meetings-filters__panel">
            <AdminSelectField
              aria-label={t('admin.modules.meetings.filters.statusLabel', { defaultValue: 'Status' })}
              value={filters.status ?? ''}
              onChange={(v) => onChange({ ...filters, status: v || undefined, page: 1 })}
              options={statusOptions}
              wrapperClassName="admin-meetings-filters__field"
            />
            <AdminSelectField
              aria-label={t('admin.modules.meetings.filters.typeLabel', { defaultValue: 'Meeting type' })}
              value={filters.meeting_type ?? ''}
              onChange={(v) => onChange({ ...filters, meeting_type: v || undefined, page: 1 })}
              options={typeOptions}
              wrapperClassName="admin-meetings-filters__field"
            />
            <label className="admin-meetings-filters__date">
              <span className="sr-only">{t('admin.modules.meetings.filters.dateFrom', { defaultValue: 'From' })}</span>
              <input
                type="date"
                className="admin-search-field w-full"
                value={filters.date_from ?? ''}
                onChange={(e) => onChange({ ...filters, date_from: e.target.value || undefined, page: 1 })}
              />
            </label>
            <label className="admin-meetings-filters__date">
              <span className="sr-only">{t('admin.modules.meetings.filters.dateTo', { defaultValue: 'To' })}</span>
              <input
                type="date"
                className="admin-search-field w-full"
                value={filters.date_to ?? ''}
                onChange={(e) => onChange({ ...filters, date_to: e.target.value || undefined, page: 1 })}
              />
            </label>
            {hasActiveFilters ? (
              <button type="button" className="admin-meetings-filters__clear" onClick={clearFilters}>
                <X className="h-4 w-4" aria-hidden />
                {t('admin.historyUi.timeline.clearFilters', { defaultValue: 'Clear filters' })}
              </button>
            ) : null}
          </div>
          <div className="admin-meetings-filters__toggles">
            <AdminToggle
              id="meetings-filter-upcoming"
              label={t('admin.modules.meetings.filters.upcomingOnly', { defaultValue: 'Upcoming only' })}
              checked={Boolean(filters.upcoming)}
              onChange={(checked) => onChange({ ...filters, upcoming: checked || undefined, page: 1 })}
            />
            <AdminToggle
              id="meetings-filter-overdue"
              label={t('admin.modules.meetings.filters.overdueOnly', { defaultValue: 'Overdue only' })}
              checked={Boolean(filters.overdue)}
              onChange={(checked) => onChange({ ...filters, overdue: checked || undefined, page: 1 })}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MeetingsFiltersBar;
