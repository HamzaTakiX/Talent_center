import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AdminModulePageShell from '../../../ui/AdminModulePageShell';
import AdminSubpageHeader from '../../../ui/AdminSubpageHeader';
import type { EncadrantReportListFilter } from '../types/encadrantReportListSlice';
import { filterEncadrantReportsBySlice } from '../utils/encadrantReportListFilters';
import { buildEncadrantReportCardStats } from '../utils/encadrantReportSubpageKpiStats';
import { useSupervisionReports, useSupervisionReportsDashboard } from '../hooks/useSupervisionReports';
import { filterToApiQueue } from '../data/encadrantReportCardRoutes';
import { AdminKpiStripSkeleton } from '../../../ui';
import EncadrantReportCardStatGrid from './EncadrantReportCardStatGrid';
import EncadrantReportsSourceBanner from './EncadrantReportsSourceBanner';
import EncadrantReportsStatusChart from './EncadrantReportsStatusChart';
import EncadrantReportsTableSection from './EncadrantReportsTableSection';
import SupervisionReportsAnalyticsPanel from './SupervisionReportsAnalyticsPanel';
import SupervisionReportsCriticalBanner from './SupervisionReportsCriticalBanner';

const PAGE_COPY: Record<
  EncadrantReportListFilter,
  { titleKey: string; subtitleKey: string; defaultTitle: string; defaultSubtitle: string }
> = {
  all: {
    titleKey: 'admin.pages.reports.all.title',
    subtitleKey: 'admin.pages.reports.all.subtitle',
    defaultTitle: 'Rapports de supervision',
    defaultSubtitle: 'Gestion ERP des rapports encadrants',
  },
  critical: {
    titleKey: 'admin.pages.reports.critical.title',
    subtitleKey: 'admin.pages.reports.critical.subtitle',
    defaultTitle: 'Alertes critiques',
    defaultSubtitle: 'Rapports haute priorité nécessitant une action immédiate',
  },
  overdue: {
    titleKey: 'admin.pages.reports.overdue.title',
    subtitleKey: 'admin.pages.reports.overdue.subtitle',
    defaultTitle: 'Rapports en retard',
    defaultSubtitle: 'Échéances dépassées',
  },
  pending_validation: {
    titleKey: 'admin.pages.reports.pendingValidation.title',
    subtitleKey: 'admin.pages.reports.pendingValidation.subtitle',
    defaultTitle: 'Validations en attente',
    defaultSubtitle: 'Décisions de validation de stage',
  },
  risk_alerts: {
    titleKey: 'admin.pages.reports.riskAlerts.title',
    subtitleKey: 'admin.pages.reports.riskAlerts.subtitle',
    defaultTitle: 'Alertes risque',
    defaultSubtitle: 'Signalements de risque et incidents',
  },
  in_progress: {
    titleKey: 'admin.pages.reports.inProgress.title',
    subtitleKey: 'admin.pages.reports.inProgress.subtitle',
    defaultTitle: 'Rapports soumis',
    defaultSubtitle: 'En attente de prise en charge',
  },
  pending: {
    titleKey: 'admin.pages.reports.pending.title',
    subtitleKey: 'admin.pages.reports.pending.subtitle',
    defaultTitle: 'En cours de revue',
    defaultSubtitle: 'Analyse administrative en cours',
  },
  approved: {
    titleKey: 'admin.pages.reports.approved.title',
    subtitleKey: 'admin.pages.reports.approved.subtitle',
    defaultTitle: 'Rapports approuvés',
    defaultSubtitle: 'Validations terminées',
  },
};

interface EncadrantReportFilteredLayoutProps {
  filter: EncadrantReportListFilter;
}

const EncadrantReportFilteredLayout: FunctionComponent<EncadrantReportFilteredLayoutProps> = ({
  filter,
}) => {
  const { t } = useTranslation();
  const copy = PAGE_COPY[filter];
  const apiQueue = filterToApiQueue(filter);
  const { rows: apiRows, pagination, loading, reload } = useSupervisionReports({
    queue: apiQueue,
    page_size: 100,
  });
  const { summary, analytics, loading: dashLoading } = useSupervisionReportsDashboard();

  const sliceRows = useMemo(() => {
    if (['critical', 'overdue', 'pending_validation', 'risk_alerts'].includes(filter)) {
      return apiRows;
    }
    return filterEncadrantReportsBySlice(apiRows, filter);
  }, [apiRows, filter]);

  const cardStats = useMemo(() => {
    if (summary) {
      return buildEncadrantReportCardStats(apiRows, summary);
    }
    return buildEncadrantReportCardStats(apiRows);
  }, [apiRows, summary]);

  return (
    <AdminModulePageShell width="wide">
    <div className="admin-subpage-stack">
      {filter !== 'all' ? (
        <AdminSubpageHeader
          title={t(copy.titleKey, { defaultValue: copy.defaultTitle, count: pagination.total })}
          subtitle={t(copy.subtitleKey, { defaultValue: copy.defaultSubtitle })}
        />
      ) : null}
      {filter === 'all' && summary ? (
        <SupervisionReportsCriticalBanner summary={summary} />
      ) : null}
      <EncadrantReportsSourceBanner count={pagination.total} loading={loading || dashLoading} />
      {loading || dashLoading ? (
        <AdminKpiStripSkeleton count={5} />
      ) : (
        <EncadrantReportCardStatGrid stats={cardStats} columns={5} />
      )}
      {filter === 'all' && analytics ? <SupervisionReportsAnalyticsPanel analytics={analytics} /> : null}
      <EncadrantReportsStatusChart rows={sliceRows} filter={filter} loading={loading} />
      <EncadrantReportsTableSection
        rows={sliceRows}
        loading={loading}
        onActionComplete={reload}
        showPriority
      />
    </div>
    </AdminModulePageShell>
  );
};

export default EncadrantReportFilteredLayout;
