import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import { AdminBackToHistoryButton, AdminSearchEmptyState } from '../../ui';
import HistoryFiltersBar, { HISTORY_ACTION_FILTER_ALL } from '../components/HistoryFiltersBar';
import HistoryStatsGrid from '../components/HistoryStatsGrid';
import HistoryTimelineList from '../components/HistoryTimelineList';
import HistoryEventDetailDrawer from '../components/HistoryEventDetailDrawer';
import HistoryExportButton from '../components/HistoryExportButton';
import HistoryStatCard from '../components/HistoryStatCard';
import { HISTORY_STAT_CARD_DEFINITIONS } from '../constants/statCardDefinitions';
import { useHistoryCenter } from '../hooks/useHistoryCenter';
import type { HistoryActionRow, HistoryStatItem } from '../types';
import type { HistoryListParams } from '../../api/history';

export interface ModuleHistoryCardPageProps {
  /** KPI key from `statCardDefinitions` / backend `KPI_SOURCE_APPS`. Use `total_actions` for unfiltered view. */
  kpiKey: string;
}

const ModuleHistoryCardPage: FunctionComponent<ModuleHistoryCardPageProps> = ({ kpiKey }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>(HISTORY_ACTION_FILTER_ALL);
  const [criticalityFilter, setCriticalityFilter] = useState('all');
  const [automatedFilter, setAutomatedFilter] = useState('all');
  const [selectedRow, setSelectedRow] = useState<HistoryActionRow | null>(null);

  const apiFilters: HistoryListParams = useMemo(
    () => ({
      search: search.trim() || undefined,
      kpi: kpiKey === 'total_actions' ? undefined : kpiKey,
      action: actionFilter === HISTORY_ACTION_FILTER_ALL ? undefined : actionFilter,
      criticality: criticalityFilter === 'all' ? undefined : criticalityFilter,
      automated:
        automatedFilter === 'all' ? undefined : automatedFilter === 'yes' ? 'true' : 'false',
    }),
    [search, kpiKey, actionFilter, criticalityFilter, automatedFilter],
  );

  const { rows, stats, loading, error } = useHistoryCenter(apiFilters);

  const displayStats: HistoryStatItem[] = useMemo(() => {
    if (kpiKey === 'total_actions') {
      return stats;
    }
    const fromApi = stats.filter((s) => s.key === kpiKey);
    if (fromApi.length > 0) {
      return fromApi;
    }
    const def = HISTORY_STAT_CARD_DEFINITIONS.find((d) => d.key === kpiKey);
    if (!def) {
      return [];
    }
    return [{ ...def, value: '0' }];
  }, [stats, kpiKey]);

  const moduleTitle = t(`admin.kpi.history.${kpiKey}`, defLabel(kpiKey));

  return (
    <AdminModulePageShell width="wide">
      <AdminBackToHistoryButton />
      <div className="flex w-full min-w-0 flex-col gap-5 md:gap-7">
        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c] dark:border-[#7f1d1d] dark:bg-[#450a0a]/50 dark:text-[#fca5a5]"
          >
            {error}
          </p>
        ) : null}

        {kpiKey === 'total_actions' ? (
          displayStats.length > 0 ? <HistoryStatsGrid stats={displayStats} loading={loading} /> : null
        ) : displayStats.length > 0 ? (
          <div className="max-w-xs">
            <HistoryStatCard item={displayStats[0]} index={0} />
          </div>
        ) : !loading ? (
          <p className="text-sm text-[var(--admin-text-secondary)]">
            {t('admin.auditCenter.moduleEmpty', { module: moduleTitle })}
          </p>
        ) : null}

        <section
          data-admin-search-id={`history-${kpiKey}`}
          className="admin-history-page admin-history-page--panel admin-module-panel w-full min-w-0 overflow-x-hidden shadow-sm"
        >
          <HistoryFiltersBar
            search={search}
            moduleFilter=""
            actionFilter={actionFilter}
            criticalityFilter={criticalityFilter}
            automatedFilter={automatedFilter}
            onSearchChange={setSearch}
            onModuleChange={() => undefined}
            onActionChange={setActionFilter}
            onCriticalityChange={setCriticalityFilter}
            onAutomatedChange={setAutomatedFilter}
            showModuleFilter={false}
            title={moduleTitle}
            trailingActions={<HistoryExportButton filters={apiFilters} />}
          />

          <div className="flex min-w-0 max-w-full flex-col gap-3 overflow-x-hidden px-4 pb-4 pt-0 sm:gap-4 sm:px-6 sm:pb-6">
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="admin-skeleton h-[76px] rounded-xl" />
                ))}
              </div>
            ) : error ? (
              <AdminSearchEmptyState titleKey="admin.auditCenter.loadError" />
            ) : (
              <HistoryTimelineList rows={rows} onViewDetails={setSelectedRow} />
            )}
          </div>
        </section>
      </div>

      <HistoryEventDetailDrawer
        row={selectedRow}
        open={Boolean(selectedRow)}
        onClose={() => setSelectedRow(null)}
      />
    </AdminModulePageShell>
  );
};

function defLabel(key: string): string {
  return HISTORY_STAT_CARD_DEFINITIONS.find((d) => d.key === key)?.label ?? key;
}

export default ModuleHistoryCardPage;
