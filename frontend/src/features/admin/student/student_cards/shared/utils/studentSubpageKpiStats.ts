import {
  AlertTriangle,
  Briefcase,
  CheckCircle,
  TrendingUp,
  UserX,
  Users,
} from 'lucide-react';
import type { StudentDashboardStats } from '../../../../api/types';
import type { StudentCardStatItem } from '../../../components/StudentCardStatGrid';
import type { AdminStudentRow } from '../../../../api/types';
import { isActiveStudent } from './studentListFilters';
import type { StudentListSliceFilter } from '../types/studentListSlice';

export function computeStudentStatsFromRows(rows: AdminStudentRow[]): StudentDashboardStats {
  const active = rows.filter(isActiveStudent).length;
  const withInternship = rows.filter((row) => row.has_internship_assignment).length;
  const engagement =
    rows.length > 0
      ? Math.round(rows.reduce((sum, row) => sum + (row.onboarding_percent ?? 0), 0) / rows.length)
      : 0;

  return {
    total: rows.length,
    active,
    inactive: Math.max(0, rows.length - active),
    without_internship: Math.max(0, rows.length - withInternship),
    with_internship: withInternship,
    engagement_percent: engagement,
  };
}

/** KPI cartes sous-pages — mêmes couleurs hex que la page principale étudiants. */
export function buildStudentSubpageKpiStats(
  filter: StudentListSliceFilter,
  sliceRows: AdminStudentRow[],
  globalStats: StudentDashboardStats | null,
): StudentCardStatItem[] {
  const sliceStats = computeStudentStatsFromRows(sliceRows);
  const stats =
    filter === 'all' && globalStats
      ? globalStats
      : filter === 'all'
        ? sliceStats
        : sliceStats;

  return [
    {
      labelKey: 'students.totalStudents',
      value: filter === 'all' ? stats.total : sliceRows.length,
      Icon: Users,
      iconBgClass: 'bg-[#3b82f6]',
    },
    {
      labelKey: 'students.active',
      value: stats.active,
      Icon: CheckCircle,
      iconBgClass: 'bg-[#22c55e]',
    },
    {
      labelKey: 'students.inactive',
      value: stats.inactive,
      Icon: UserX,
      iconBgClass: 'bg-[#64748b]',
    },
    {
      labelKey: 'students.withoutInternship',
      value: stats.without_internship,
      Icon: AlertTriangle,
      iconBgClass: 'bg-[#f97316]',
    },
    {
      labelKey: 'students.withInternship',
      value: stats.with_internship,
      Icon: Briefcase,
      iconBgClass: 'bg-[#6366f1]',
    },
    {
      labelKey: 'students.engagementLevel',
      value: stats.engagement_percent,
      valueSuffix: '%',
      Icon: TrendingUp,
      iconBgClass: 'bg-[#a855f7]',
    },
  ];
}
