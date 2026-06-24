import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import StudentLayout from '../../components/StudentLayout';
import HistoryFiltersBar, {
  HISTORY_ACTION_FILTER_ALL,
} from '../../../admin/main_history/components/HistoryFiltersBar';
import HistoryActivitySummaryBar from '../../../admin/main_history/components/HistoryActivitySummaryBar';
import HistoryTimelineList from '../../../admin/main_history/components/HistoryTimelineList';
import HistoryEventDetailDrawer from '../../../admin/main_history/components/HistoryEventDetailDrawer';
import type { HistoryActionRow } from '../../../admin/main_history/types';
import {
  MAIN_HISTORY_PAGE_ROOT,
  MAIN_HISTORY_TIMELINE_PANEL,
} from '../constants/mainHistoryLayout';
import { useStudentHistory } from '../hooks/useStudentHistory';
import { AdminSearchEmptyState } from '../../../admin/ui';

const MainHistoryPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>(HISTORY_ACTION_FILTER_ALL);
  const [criticalityFilter, setCriticalityFilter] = useState('all');
  const [automatedFilter, setAutomatedFilter] = useState('all');
  const [selectedRow, setSelectedRow] = useState<HistoryActionRow | null>(null);

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      action: actionFilter === HISTORY_ACTION_FILTER_ALL ? undefined : actionFilter,
      criticality: criticalityFilter === 'all' ? undefined : criticalityFilter,
      automated:
        automatedFilter === 'all' ? undefined : automatedFilter === 'yes' ? 'true' : 'false',
    }),
    [search, actionFilter, criticalityFilter, automatedFilter],
  );

  const { rows, summaryLoading, timelineLoading, error, total, eventsToday } =
    useStudentHistory(filters);

  return (
    <StudentLayout>
      <div id="student-main-history-root" className={`${MAIN_HISTORY_PAGE_ROOT} admin-audit-center`}>
        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c] dark:border-[#7f1d1d] dark:bg-[#450a0a]/50 dark:text-[#fca5a5]"
          >
            {t('student.mainHistory.loadError')}
          </p>
        ) : null}

        <section
          aria-label={t('student.mainHistory.timelineAria')}
          data-admin-search-id="student-main-history-timeline"
          className={`${MAIN_HISTORY_TIMELINE_PANEL} admin-history-page--hero`}
        >
          <HistoryActivitySummaryBar
            total={total}
            lastActivityAt={rows[0]?.timestamp}
            actionsToday={eventsToday}
            loading={timelineLoading || summaryLoading}
          />

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
            title={t('student.mainHistory.timelineTitle')}
            subtitle={t('student.mainHistory.timelineSubtitle')}
            isRefreshing={timelineLoading && rows.length > 0}
            searchLoading={timelineLoading}
          />

          <div className="admin-audit-timeline-body flex min-w-0 max-w-full flex-col gap-3 overflow-x-hidden px-4 pb-5 pt-0 sm:gap-4 sm:px-6 sm:pb-6">
            {error ? (
              <AdminSearchEmptyState titleKey="student.mainHistory.loadError" />
            ) : (
              <HistoryTimelineList
                rows={rows}
                onViewDetails={setSelectedRow}
                hideModuleBadge={false}
                emptyTitleKey="student.mainHistory.empty"
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

export default MainHistoryPage;
