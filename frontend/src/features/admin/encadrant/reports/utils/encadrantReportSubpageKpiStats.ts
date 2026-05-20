import { AlertTriangle, CheckCircle, Clock, FileEdit, ShieldAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { EncadrantReportRow } from '../data/encadrantReportsMock';
import { filterEncadrantReportsBySlice } from './encadrantReportListFilters';
import type { EncadrantReportListFilter } from '../types/encadrantReportListSlice';
import type { SupervisionReportDashboardSummary } from '../types/supervisionReport';

export interface EncadrantReportCardStatItem {
  filter: EncadrantReportListFilter;
  labelKey: string;
  value: number;
  Icon: LucideIcon;
  iconBgClass: string;
}

export function buildEncadrantReportCardStats(
  rows: EncadrantReportRow[],
  summary?: SupervisionReportDashboardSummary,
): EncadrantReportCardStatItem[] {
  const s = summary;
  return [
    {
      filter: 'all',
      labelKey: 'encadrants.totalReports',
      value: s?.total ?? rows.length,
      Icon: FileEdit,
      iconBgClass: 'bg-[#3b82f6]',
    },
    {
      filter: 'critical',
      labelKey: 'encadrants.reportsCritical',
      value: s?.critical ?? 0,
      Icon: ShieldAlert,
      iconBgClass: 'bg-[#dc2626]',
    },
    {
      filter: 'overdue',
      labelKey: 'encadrants.reportsOverdue',
      value: s?.overdue ?? filterEncadrantReportsBySlice(rows, 'overdue').length,
      Icon: AlertTriangle,
      iconBgClass: 'bg-[#ef4444]',
    },
    {
      filter: 'pending_validation',
      labelKey: 'encadrants.reportsPendingValidation',
      value: s?.pending_validation ?? 0,
      Icon: Clock,
      iconBgClass: 'bg-[#8b5cf6]',
    },
    {
      filter: 'in_progress',
      labelKey: 'encadrants.reportsInProgress',
      value: s?.submitted ?? filterEncadrantReportsBySlice(rows, 'in_progress').length,
      Icon: Clock,
      iconBgClass: 'bg-[#f97316]',
    },
    {
      filter: 'pending',
      labelKey: 'encadrants.reportsPending',
      value: s?.under_review ?? filterEncadrantReportsBySlice(rows, 'pending').length,
      Icon: Clock,
      iconBgClass: 'bg-[#eab308]',
    },
    {
      filter: 'approved',
      labelKey: 'encadrants.reportsApproved',
      value: s?.approved ?? filterEncadrantReportsBySlice(rows, 'approved').length,
      Icon: CheckCircle,
      iconBgClass: 'bg-[#22c55e]',
    },
    {
      filter: 'risk_alerts',
      labelKey: 'encadrants.reportsRiskAlerts',
      value: s?.risk_alerts ?? 0,
      Icon: AlertTriangle,
      iconBgClass: 'bg-[#f59e0b]',
    },
  ];
}
