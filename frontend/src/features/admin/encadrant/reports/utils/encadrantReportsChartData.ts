import type { AdminDonutSegment } from '../../../ui/charts/types';
import type { EncadrantReportRow, EncadrantReportStatus } from '../data/encadrantReportsMock';
import type { EncadrantReportListFilter } from '../types/encadrantReportListSlice';

const STATUS_COLORS: Record<EncadrantReportStatus, string> = {
  Submitted: '#f97316',
  Pending: '#eab308',
  Approved: '#22c55e',
  Overdue: '#ef4444',
};

const STATUS_ORDER: EncadrantReportStatus[] = ['Submitted', 'Pending', 'Approved', 'Overdue'];

const TYPE_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6', '#f59e0b'];

export function buildReportsStatusDonut(
  rows: EncadrantReportRow[],
  statusLabels: Record<EncadrantReportStatus, string>,
): { segments: AdminDonutSegment[]; centerTotal: number } {
  const counts: Record<EncadrantReportStatus, number> = {
    Submitted: 0,
    Pending: 0,
    Approved: 0,
    Overdue: 0,
  };
  rows.forEach((r) => {
    counts[r.status] += 1;
  });
  const segments = STATUS_ORDER.map((status) => ({
    key: status,
    label: statusLabels[status],
    value: counts[status],
    color: STATUS_COLORS[status],
  })).filter((s) => s.value > 0);

  return { segments, centerTotal: rows.length };
}

export function buildReportsTypeDonut(rows: EncadrantReportRow[]): {
  segments: AdminDonutSegment[];
  centerTotal: number;
} {
  const byType = new Map<string, number>();
  rows.forEach((r) => byType.set(r.reportType, (byType.get(r.reportType) ?? 0) + 1));

  const segments = [...byType.entries()].map(([type, value], index) => ({
    key: type,
    label: type,
    value,
    color: TYPE_COLORS[index % TYPE_COLORS.length],
  }));

  return { segments, centerTotal: rows.length };
}

export function chartMetaForReportFilter(
  filter: EncadrantReportListFilter,
  t: (key: string, opts?: { defaultValue?: string }) => string,
): { title: string; subtitle: string; ariaLabel: string; mode: 'status' | 'types' } {
  switch (filter) {
    case 'in_progress':
      return {
        title: t('admin.charts.encadrant-reports.inProgress.title', {
          defaultValue: 'Types de rapports en cours',
        }),
        subtitle: t('admin.charts.encadrant-reports.inProgress.subtitle', {
          defaultValue: 'Répartition par type parmi les rapports soumis',
        }),
        ariaLabel: t('admin.charts.encadrant-reports.inProgress.ariaLabel', {
          defaultValue: 'Graphique des types de rapports en cours',
        }),
        mode: 'types',
      };
    case 'pending':
      return {
        title: t('admin.charts.encadrant-reports.pending.title', {
          defaultValue: 'Types en attente de validation',
        }),
        subtitle: t('admin.charts.encadrant-reports.pending.subtitle', {
          defaultValue: 'Répartition par type de rapport',
        }),
        ariaLabel: t('admin.charts.encadrant-reports.pending.ariaLabel', {
          defaultValue: 'Graphique des rapports en attente',
        }),
        mode: 'types',
      };
    case 'approved':
      return {
        title: t('admin.charts.encadrant-reports.approved.title', {
          defaultValue: 'Types de rapports validés',
        }),
        subtitle: t('admin.charts.encadrant-reports.approved.subtitle', {
          defaultValue: 'Répartition par type de rapport validé',
        }),
        ariaLabel: t('admin.charts.encadrant-reports.approved.ariaLabel', {
          defaultValue: 'Graphique des rapports validés',
        }),
        mode: 'types',
      };
    case 'overdue':
      return {
        title: t('admin.charts.encadrant-reports.overdue.title', {
          defaultValue: 'Types de rapports en retard',
        }),
        subtitle: t('admin.charts.encadrant-reports.overdue.subtitle', {
          defaultValue: 'Répartition par type de rapport en retard',
        }),
        ariaLabel: t('admin.charts.encadrant-reports.overdue.ariaLabel', {
          defaultValue: 'Graphique des rapports en retard',
        }),
        mode: 'types',
      };
    default:
      return {
        title: t('admin.charts.encadrant-reports.status.title', {
          defaultValue: 'Répartition par statut',
        }),
        subtitle: t('admin.charts.encadrant-reports.status.subtitle', {
          defaultValue: 'Tous les rapports de la plateforme',
        }),
        ariaLabel: t('admin.charts.encadrant-reports.status.ariaLabel', {
          defaultValue: 'Graphique circulaire des statuts de rapports',
        }),
        mode: 'status',
      };
  }
}
