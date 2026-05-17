import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { CircleUserRound, Clock3, Eye, Funnel, Pencil, Plus, Trash2 } from 'lucide-react';
import { HISTORY_MODULE_I18N_KEY } from '../main_history/constants/historyModuleI18n';
import type { HistoryModule } from '../main_history/types';
import AdminModal from './AdminModal';
import AdminSearchEmptyState from './AdminSearchEmptyState';
import AdminSearchInput from './AdminSearchInput';
import AdminSelectField from './AdminSelectField';
import { ACTION_BADGE_CLASS } from './adminKpiTones';

const FILTER_ALL = 'all';
const MAIN_PREFIX = 'admin.historyUi.main';
const TIMELINE_PREFIX = 'admin.historyUi.timeline';

const moduleLabel = (t: TFunction, module: string): string => {
  const key = HISTORY_MODULE_I18N_KEY[module as HistoryModule];
  if (key) {
    const label = t(`${MAIN_PREFIX}.modules.${key}`);
    if (label !== `${MAIN_PREFIX}.modules.${key}`) return label;
  }
  return module;
};

const actionLabel = (t: TFunction, action: string): string => {
  const label = t(`${MAIN_PREFIX}.actions.${action}`);
  return label === `${MAIN_PREFIX}.actions.${action}` ? action : label;
};

export interface AdminHistoryTimelineRow {
  id: string;
  module: string;
  actionType: string;
  title: string;
  actor: string;
  timestamp: string;
}

interface AdminHistoryTimelineListProps {
  rows: readonly AdminHistoryTimelineRow[];
  searchPlaceholder?: string;
  /** Dans un `admin-module-panel` parent — pas de double bordure. */
  embedded?: boolean;
}

const actionIcon = (type: string) => {
  if (type === 'create') return <Plus className="h-4 w-4" strokeWidth={2} />;
  if (type === 'delete') return <Trash2 className="h-4 w-4" strokeWidth={2} />;
  return <Pencil className="h-4 w-4" strokeWidth={2} />;
};

const badgeClass = (type: string): string =>
  ACTION_BADGE_CLASS[type] ?? 'admin-badge admin-badge--info';

const AdminHistoryTimelineList: FunctionComponent<AdminHistoryTimelineListProps> = ({
  rows,
  searchPlaceholder,
  embedded = false,
}) => {
  const { t } = useTranslation();
  const resolvedPlaceholder = searchPlaceholder ?? t('admin.search.activity');
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [moduleFilter, setModuleFilter] = useState(FILTER_ALL);
  const [actionFilter, setActionFilter] = useState(FILTER_ALL);
  const [selectedRow, setSelectedRow] = useState<AdminHistoryTimelineRow | null>(null);

  const uniqueModules = useMemo(
    () => [...new Set(rows.map((row) => row.module))].sort(),
    [rows]
  );

  const showModuleFilter = uniqueModules.length > 1;

  const moduleOptions = useMemo(
    () => [
      { value: FILTER_ALL, label: t(`${MAIN_PREFIX}.modules.all`) },
      ...uniqueModules.map((module) => ({ value: module, label: moduleLabel(t, module) })),
    ],
    [uniqueModules, t]
  );

  const actionOptions = useMemo(() => {
    const actions = [...new Set(rows.map((row) => row.actionType))].sort();
    return [
      { value: FILTER_ALL, label: t(`${MAIN_PREFIX}.actions.all`) },
      ...actions.map((action) => ({ value: action, label: actionLabel(t, action) })),
    ];
  }, [rows, t]);

  const hasActiveFilters = moduleFilter !== FILTER_ALL || actionFilter !== FILTER_ALL;

  const clearFilters = useCallback(() => {
    setModuleFilter(FILTER_ALL);
    setActionFilter(FILTER_ALL);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (moduleFilter !== FILTER_ALL && row.module !== moduleFilter) return false;
      if (actionFilter !== FILTER_ALL && row.actionType !== actionFilter) return false;
      if (!q) return true;
      return [row.module, row.title, row.actor, row.actionType, row.timestamp]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [query, rows, moduleFilter, actionFilter]);

  return (
    <>
      <section
        className={
          embedded ? 'w-full space-y-3' : 'admin-timeline-panel w-full space-y-3'
        }
      >
        <div className="admin-timeline-search-row">
          <AdminSearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            placeholder={resolvedPlaceholder}
          />
          <button
            type="button"
            className={`admin-icon-btn admin-icon-btn--active-toggle h-10 w-10 shrink-0${filtersOpen || hasActiveFilters ? ' admin-icon-btn--active' : ''}`}
            aria-label={t(`${TIMELINE_PREFIX}.filterAria`)}
            aria-expanded={filtersOpen}
            aria-controls="admin-timeline-filters"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <Funnel className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {filtersOpen && (
          <div
            id="admin-timeline-filters"
            className="admin-timeline-filters"
            role="region"
            aria-label={t(`${TIMELINE_PREFIX}.filtersPanelAria`)}
          >
            {showModuleFilter && (
              <AdminSelectField
                value={moduleFilter}
                onChange={setModuleFilter}
                options={moduleOptions}
                aria-label={t(`${MAIN_PREFIX}.moduleFilterAria`)}
                wrapperClassName="admin-timeline-filters__field"
              />
            )}
            <AdminSelectField
              value={actionFilter}
              onChange={setActionFilter}
              options={actionOptions}
              aria-label={t(`${MAIN_PREFIX}.actionFilterAria`)}
              wrapperClassName="admin-timeline-filters__field"
            />
            {hasActiveFilters && (
              <button type="button" className="admin-timeline-filters__clear" onClick={clearFilters}>
                {t(`${TIMELINE_PREFIX}.clearFilters`)}
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <AdminSearchEmptyState
              titleKey={
                hasActiveFilters || query.trim()
                  ? 'admin.empty.historyFilters'
                  : 'admin.empty.noResults'
              }
            />
          ) : (
          filtered.map((row) => (
            <article key={row.id} className="admin-timeline-row font-inter">
              <div className="flex min-w-0 items-center gap-4">
                <span className="admin-timeline-icon">{actionIcon(row.actionType)}</span>
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="admin-badge admin-badge--neutral">{row.module}</span>
                    <span className={badgeClass(row.actionType)}>{row.actionType}</span>
                  </div>
                  <p className="m-0 text-sm font-medium leading-5 text-[var(--admin-text)]">{row.title}</p>
                  <p className="m-0 text-xs leading-4 text-[var(--admin-text-secondary)]">
                    {row.actor} • {row.timestamp}
                  </p>
                </div>
              </div>
              <button type="button" className="admin-btn-ghost shrink-0" onClick={() => setSelectedRow(row)}>
                <Eye className="h-4 w-4" />
                <span>View Details</span>
              </button>
            </article>
          )))}
        </div>
      </section>

      <AdminModal
        open={selectedRow != null}
        onClose={() => setSelectedRow(null)}
        title="Activity Details"
        description="Complete information about this action"
        footer={
          <>
            <button type="button" className="admin-btn-secondary h-9 px-4 text-sm" onClick={() => setSelectedRow(null)}>
              Close
            </button>
            <button type="button" className="admin-btn-outline h-9 gap-2">
              <Eye className="h-4 w-4" />
              View Related Entity
            </button>
          </>
        }
      >
        {selectedRow && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text)]">
                  {actionIcon(selectedRow.actionType)}
                  Module
                </p>
                <p className="text-sm text-[var(--admin-text)]">{selectedRow.module}</p>
              </div>
              <div className="space-y-1">
                <p className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text)]">
                  <Pencil className="h-4 w-4 text-[var(--admin-text-muted)]" />
                  Action Type
                </p>
                <span className={badgeClass(selectedRow.actionType)}>{selectedRow.actionType}</span>
              </div>
              <div className="space-y-1">
                <p className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text)]">
                  <CircleUserRound className="h-4 w-4 text-[var(--admin-text-muted)]" />
                  Performed By
                </p>
                <p className="text-sm text-[var(--admin-text)]">{selectedRow.actor}</p>
              </div>
              <div className="space-y-1">
                <p className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text)]">
                  <Clock3 className="h-4 w-4 text-[var(--admin-text-muted)]" />
                  Timestamp
                </p>
                <p className="text-sm text-[var(--admin-text)]">{selectedRow.timestamp}</p>
              </div>
            </div>
            <div>
              <h4 className="text-base font-semibold text-[var(--admin-text)]">Action Description</h4>
              <p className="mt-1 text-sm leading-5 text-[var(--admin-text)]">{selectedRow.title}</p>
            </div>
            <div>
              <h4 className="text-base font-semibold text-[var(--admin-text)]">Details</h4>
              <p className="mt-1 text-sm leading-5 text-[var(--admin-text-secondary)]">
                Updated account information and related metadata for this action.
              </p>
            </div>
          </div>
        )}
      </AdminModal>
    </>
  );
};

export default AdminHistoryTimelineList;
