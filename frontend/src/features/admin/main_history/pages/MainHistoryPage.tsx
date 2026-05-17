import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import { historyActionsMock } from '../data/historyMockData';
import HistoryFiltersBar, {
  HISTORY_ACTION_FILTER_ALL,
  HISTORY_MODULE_FILTER_ALL,
} from '../components/HistoryFiltersBar';
import HistoryStatsGrid from '../components/HistoryStatsGrid';
import HistoryTimelineList from '../components/HistoryTimelineList';
import { HISTORY_MODULE_I18N_KEY } from '../constants/historyModuleI18n';

const MAIN_PREFIX = 'admin.historyUi.main';

const MainHistoryPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>(HISTORY_MODULE_FILTER_ALL);
  const [actionFilter, setActionFilter] = useState<string>(HISTORY_ACTION_FILTER_ALL);

  const rowText = useCallback(
    (rowId: string, field: 'title' | 'actor', fallback: string) => {
      const key = `${MAIN_PREFIX}.rows.${rowId}.${field}`;
      const value = t(key);
      return value === key ? fallback : value;
    },
    [t]
  );

  const filteredRows = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();

    return historyActionsMock.filter((row) => {
      if (moduleFilter !== HISTORY_MODULE_FILTER_ALL && row.module !== moduleFilter) return false;
      if (actionFilter !== HISTORY_ACTION_FILTER_ALL && row.actionType !== actionFilter) return false;

      if (!normalizedQuery) return true;

      const moduleLabel = t(`${MAIN_PREFIX}.modules.${HISTORY_MODULE_I18N_KEY[row.module]}`);
      const actionLabel = t(`${MAIN_PREFIX}.actions.${row.actionType}`);
      const title = rowText(row.id, 'title', row.title);
      const actor = rowText(row.id, 'actor', row.actor);

      return [moduleLabel, title, actor, actionLabel, row.status, row.priority, row.timestamp]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [actionFilter, moduleFilter, search, t, rowText]);

  return (
    <AdminModulePageShell width="wide">
      <div className="flex w-full min-w-0 flex-col gap-5 md:gap-7">
        <HistoryStatsGrid />
        <section
          data-admin-search-id="history-timeline"
          className="admin-history-page admin-history-page--panel admin-module-panel w-full min-w-0 overflow-x-hidden shadow-sm"
        >
          <HistoryFiltersBar
            search={search}
            moduleFilter={moduleFilter}
            actionFilter={actionFilter}
            onSearchChange={setSearch}
            onModuleChange={setModuleFilter}
            onActionChange={setActionFilter}
          />
          <div className="flex min-w-0 max-w-full flex-col gap-3 overflow-x-hidden px-4 pb-4 pt-0 sm:gap-4 sm:px-6 sm:pb-6">
            <HistoryTimelineList rows={filteredRows} />
          </div>
        </section>
      </div>
    </AdminModulePageShell>
  );
};

export default MainHistoryPage;
