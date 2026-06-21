import { FunctionComponent, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import { AdminBackToHistoryButton, AdminSearchEmptyState } from '../../ui';
import HistoryFiltersBar, { HISTORY_ACTION_FILTER_ALL } from '../components/HistoryFiltersBar';
import HistoryAuditGrid from '../components/HistoryAuditGrid';
import HistoryTimelineList from '../components/HistoryTimelineList';
import HistoryEventDetailDrawer from '../components/HistoryEventDetailDrawer';
import HistoryExportButton from '../components/HistoryExportButton';
import HistoryTimelineLoading from '../components/HistoryTimelineLoading';
import { useHistoryCenter } from '../hooks/useHistoryCenter';
import type { ModuleAuditKey } from '../constants/moduleAuditDefinitions';
import { MODULE_AUDIT_CARD_DEFINITIONS } from '../constants/moduleAuditDefinitions';
import type { HistoryActionRow } from '../types';
import type { HistoryListParams } from '../../api/history';

export interface ModuleHistoryCardPageProps {
  kpiKey: string;
}

const ModuleHistoryCardPage: FunctionComponent<ModuleHistoryCardPageProps> = ({ kpiKey }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>(HISTORY_ACTION_FILTER_ALL);
  const [criticalityFilter, setCriticalityFilter] = useState('all');
  const [automatedFilter, setAutomatedFilter] = useState('all');
  const [selectedRow, setSelectedRow] = useState<HistoryActionRow | null>(null);

  const moduleKey = kpiKey as ModuleAuditKey;
  const hasModuleAudit = Boolean(MODULE_AUDIT_CARD_DEFINITIONS[moduleKey]);

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

  const { rows, stats, statsLoading, timelineLoading, error } = useHistoryCenter(apiFilters, {
    moduleKey: hasModuleAudit ? moduleKey : undefined,
  });

  if (kpiKey === 'total_actions') {
    return <Navigate to="/admin/history" replace />;
  }

  const moduleTitle = t(`admin.auditCenter.modules.${kpiKey}`, kpiKey);

  return (
    <AdminModulePageShell width="wide">
      <AdminBackToHistoryButton />
      <div className="admin-audit-center flex w-full min-w-0 flex-col gap-4 md:gap-5">
        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]"
          >
            {error}
          </p>
        ) : null}

        {hasModuleAudit ? (
          <HistoryAuditGrid stats={stats} loading={statsLoading} moduleKey={moduleKey} />
        ) : null}

        <section
          data-admin-search-id={`history-${kpiKey}`}
          className="admin-history-page admin-history-page--panel admin-history-page--hero admin-module-panel w-full min-w-0 overflow-x-hidden shadow-sm"
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

          <div className="admin-audit-timeline-body flex min-w-0 max-w-full flex-col gap-3 overflow-x-hidden px-4 pb-5 pt-0 sm:gap-4 sm:px-6 sm:pb-6">
            {timelineLoading && rows.length === 0 ? (
              <HistoryTimelineLoading rows={3} />
            ) : error ? (
              <AdminSearchEmptyState titleKey="admin.auditCenter.loadError" />
            ) : (
              <HistoryTimelineList rows={rows} onViewDetails={setSelectedRow} hideModuleBadge />
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

export default ModuleHistoryCardPage;
