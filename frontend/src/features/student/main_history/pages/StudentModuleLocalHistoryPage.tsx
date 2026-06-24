import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import HistoryFiltersBar, {
  HISTORY_ACTION_FILTER_ALL,
} from '../../../admin/main_history/components/HistoryFiltersBar';
import HistoryAuditGrid from '../../../admin/main_history/components/HistoryAuditGrid';
import HistoryActivitySummaryBar from '../../../admin/main_history/components/HistoryActivitySummaryBar';
import HistoryTimelineList from '../../../admin/main_history/components/HistoryTimelineList';
import HistoryEventDetailDrawer from '../../../admin/main_history/components/HistoryEventDetailDrawer';
import { useHistoryCenter } from '../../../admin/main_history/hooks/useHistoryCenter';
import type { ModuleLocalHistoryConfig } from '../../../admin/main_history/config/moduleLocalHistoryConfig';
import type { ModuleAuditKey } from '../../../admin/main_history/constants/moduleAuditDefinitions';
import type { HistoryActionRow } from '../../../admin/main_history/types';
import type { HistoryListParams } from '../../../admin/api/history';
import { AdminSearchEmptyState } from '../../../admin/ui';
import StudentLayout from '../../components/StudentLayout';
import { MAIN_HISTORY_PAGE_ROOT, MAIN_HISTORY_TIMELINE_PANEL } from '../constants/mainHistoryLayout';

export interface StudentModuleLocalHistoryPageProps {
  config: ModuleLocalHistoryConfig;
}

const StudentModuleLocalHistoryPage: FunctionComponent<StudentModuleLocalHistoryPageProps> = ({
  config,
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>(HISTORY_ACTION_FILTER_ALL);
  const [criticalityFilter, setCriticalityFilter] = useState('all');
  const [automatedFilter, setAutomatedFilter] = useState('all');
  const [selectedRow, setSelectedRow] = useState<HistoryActionRow | null>(null);

  const moduleKey = config.kpiKey as ModuleAuditKey;
  const hideAuditCards = config.hideAuditCards ?? false;
  const showActivitySummary = config.showActivitySummary ?? false;
  const auditStatsMode = hideAuditCards
    ? showActivitySummary
      ? 'summary-only'
      : 'off'
    : 'cards';

  const apiFilters: HistoryListParams = useMemo(
    () => ({
      search: search.trim() || undefined,
      kpi: config.kpiKey,
      action: actionFilter === HISTORY_ACTION_FILTER_ALL ? undefined : actionFilter,
      criticality: criticalityFilter === 'all' ? undefined : criticalityFilter,
      automated:
        automatedFilter === 'all' ? undefined : automatedFilter === 'yes' ? 'true' : 'false',
    }),
    [search, config.kpiKey, actionFilter, criticalityFilter, automatedFilter],
  );

  const { rows, stats, statsLoading, timelineLoading, error, total, eventsToday } = useHistoryCenter(
    apiFilters,
    {
      moduleKey: hideAuditCards ? undefined : moduleKey,
      auditStatsMode,
    },
  );

  const title = t(`admin.localHistory.${config.id}.title`);
  const subtitle = t(`admin.localHistory.${config.id}.subtitle`);

  return (
    <StudentLayout>
      <div className={`${MAIN_HISTORY_PAGE_ROOT} admin-audit-center`}>
        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c] dark:border-[#7f1d1d] dark:bg-[#450a0a]/50 dark:text-[#fca5a5]"
          >
            {error}
          </p>
        ) : null}

        {!hideAuditCards ? (
          <HistoryAuditGrid stats={stats} loading={statsLoading} moduleKey={moduleKey} />
        ) : null}

        <section
          data-admin-search-id={config.searchId}
          className={`${MAIN_HISTORY_TIMELINE_PANEL} admin-history-page--hero`}
        >
          {showActivitySummary ? (
            <HistoryActivitySummaryBar
              total={total}
              lastActivityAt={rows[0]?.timestamp}
              actionsToday={eventsToday}
              loading={timelineLoading || statsLoading}
            />
          ) : null}

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
            title={title}
            subtitle={subtitle}
            isRefreshing={timelineLoading && rows.length > 0}
            searchLoading={timelineLoading}
          />

          <div className="admin-audit-timeline-body flex min-w-0 max-w-full flex-col gap-3 overflow-x-hidden px-4 pb-5 pt-0 sm:gap-4 sm:px-6 sm:pb-6">
            {error ? (
              <AdminSearchEmptyState titleKey="admin.auditCenter.loadError" />
            ) : (
              <HistoryTimelineList
                rows={rows}
                onViewDetails={setSelectedRow}
                hideModuleBadge
                emptyTitleKey="admin.localHistory.empty"
                loading={timelineLoading}
              />
            )}
          </div>
        </section>
      </div>

      <HistoryEventDetailDrawer
        row={selectedRow}
        open={Boolean(selectedRow)}
        onClose={() => setSelectedRow(null)}
      />
    </StudentLayout>
  );
};

export default StudentModuleLocalHistoryPage;
