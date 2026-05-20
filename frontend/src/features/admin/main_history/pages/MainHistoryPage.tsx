import { FunctionComponent, useMemo, useState } from 'react';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import { AdminSearchEmptyState } from '../../ui';
import HistoryFiltersBar, {
  HISTORY_ACTION_FILTER_ALL,
  HISTORY_MODULE_FILTER_ALL,
} from '../components/HistoryFiltersBar';
import HistoryStatsGrid from '../components/HistoryStatsGrid';
import HistoryTimelineList from '../components/HistoryTimelineList';
import HistoryEventDetailDrawer from '../components/HistoryEventDetailDrawer';
import HistoryExportButton from '../components/HistoryExportButton';
import { useHistoryCenter } from '../hooks/useHistoryCenter';
import type { HistoryActionRow } from '../types';
import type { HistoryListParams } from '../../api/history';

const MODULE_TO_API: Record<string, string> = {
  'Internship Offers': 'stage',
  Documents: 'documents',
  Students: 'students',
  Announcements: 'announcements',
  SRF: 'srf',
  Encadrants: 'encadrant',
  Reports: 'reports',
  Chat: 'chat',
};

const MainHistoryPage: FunctionComponent = () => {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>(HISTORY_MODULE_FILTER_ALL);
  const [actionFilter, setActionFilter] = useState<string>(HISTORY_ACTION_FILTER_ALL);
  const [criticalityFilter, setCriticalityFilter] = useState('all');
  const [automatedFilter, setAutomatedFilter] = useState('all');
  const [selectedRow, setSelectedRow] = useState<HistoryActionRow | null>(null);

  const apiFilters: HistoryListParams = useMemo(
    () => ({
      search: search.trim() || undefined,
      module: moduleFilter === HISTORY_MODULE_FILTER_ALL ? undefined : MODULE_TO_API[moduleFilter] ?? moduleFilter,
      action: actionFilter === HISTORY_ACTION_FILTER_ALL ? undefined : actionFilter,
      criticality: criticalityFilter === 'all' ? undefined : criticalityFilter,
      automated:
        automatedFilter === 'all' ? undefined : automatedFilter === 'yes' ? 'true' : 'false',
    }),
    [search, moduleFilter, actionFilter, criticalityFilter, automatedFilter],
  );

  const { rows, stats, loading, error } = useHistoryCenter(apiFilters);

  return (
    <AdminModulePageShell width="wide">
      <div className="flex w-full min-w-0 flex-col gap-5 md:gap-7">
        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c] dark:border-[#7f1d1d] dark:bg-[#450a0a]/50 dark:text-[#fca5a5]"
          >
            {error}
          </p>
        ) : null}

        {stats.length > 0 ? <HistoryStatsGrid stats={stats} loading={loading} /> : null}

        <section
          data-admin-search-id="history-timeline"
          className="admin-history-page admin-history-page--panel admin-module-panel w-full min-w-0 overflow-x-hidden shadow-sm"
        >
          <HistoryFiltersBar
            search={search}
            moduleFilter={moduleFilter}
            actionFilter={actionFilter}
            criticalityFilter={criticalityFilter}
            automatedFilter={automatedFilter}
            onSearchChange={setSearch}
            onModuleChange={setModuleFilter}
            onActionChange={setActionFilter}
            onCriticalityChange={setCriticalityFilter}
            onAutomatedChange={setAutomatedFilter}
            trailingActions={<HistoryExportButton filters={apiFilters} />}
          />

          <div className="flex min-w-0 max-w-full flex-col gap-3 overflow-x-hidden px-4 pb-4 pt-0 sm:gap-4 sm:px-6 sm:pb-6">
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
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

export default MainHistoryPage;
