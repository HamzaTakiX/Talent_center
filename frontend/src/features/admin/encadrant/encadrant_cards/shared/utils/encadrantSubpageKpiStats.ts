import { AlertTriangle, CheckCircle, Clock, FileEdit, User, Users, Video } from 'lucide-react';
import type { EncadrantCardStatItem } from '../components/EncadrantCardStatGrid';
import type { AdminEncadrantRow } from '../../../../api/types';
import type { EncadrantListSliceFilter } from '../types/encadrantListSlice';
import { computeEncadrantStatsFromRows, type EncadrantDashboardStats } from './encadrantStats';
import {
  computeEncadrantReportKpiStats,
  EMPTY_ENCADRANT_REPORT_KPI,
} from '../../../shared/utils/encadrantReportKpiStats';

function buildReportKpiCards(stats: typeof EMPTY_ENCADRANT_REPORT_KPI): EncadrantCardStatItem[] {
  return [
    {
      labelKey: 'encadrants.totalReports',
      value: stats.total,
      Icon: FileEdit,
      iconBgClass: 'bg-[#3b82f6]',
    },
    {
      labelKey: 'encadrants.reportsInProgress',
      value: stats.in_progress,
      Icon: Clock,
      iconBgClass: 'bg-[#f97316]',
    },
    {
      labelKey: 'encadrants.reportsPending',
      value: stats.pending,
      Icon: Clock,
      iconBgClass: 'bg-[#eab308]',
    },
    {
      labelKey: 'encadrants.reportsApproved',
      value: stats.approved,
      Icon: CheckCircle,
      iconBgClass: 'bg-[#22c55e]',
    },
    {
      labelKey: 'encadrants.reportsOverdue',
      value: stats.overdue,
      Icon: AlertTriangle,
      iconBgClass: 'bg-[#ef4444]',
    },
  ];
}

export function buildEncadrantSubpageKpiStats(
  filter: EncadrantListSliceFilter,
  sliceRows: AdminEncadrantRow[],
  globalStats: EncadrantDashboardStats | null,
): EncadrantCardStatItem[] {
  const sliceStats = computeEncadrantStatsFromRows(sliceRows);
  const stats =
    filter === 'all' && globalStats ? globalStats : globalStats ?? sliceStats;

  if (filter === 'reports_in_progress') {
    return buildReportKpiCards(EMPTY_ENCADRANT_REPORT_KPI);
  }

  const reportKpi = computeEncadrantReportKpiStats([]);

  return [
    {
      labelKey: 'encadrants.total',
      value: filter === 'all' ? stats.total : sliceRows.length,
      Icon: User,
      iconBgClass: 'bg-[#a855f7]',
    },
    {
      labelKey: 'encadrants.assigned',
      value: stats.total_assigned_students,
      Icon: Users,
      iconBgClass: 'bg-[#3b82f6]',
    },
    {
      labelKey: 'encadrants.totalReports',
      value: reportKpi.total,
      Icon: FileEdit,
      iconBgClass: 'bg-[#f97316]',
    },
    {
      labelKey: 'encadrants.meetings',
      value: stats.with_students,
      Icon: Video,
      iconBgClass: 'bg-[#22c55e]',
    },
  ];
}
