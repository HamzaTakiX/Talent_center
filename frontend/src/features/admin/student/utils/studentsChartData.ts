import type { StudentDashboardStats } from '../../api/types';
import type { AdminDonutSegment } from '../../ui/charts/types';

export function buildStudentsInternshipSplitSegments(
  stats: StudentDashboardStats,
  labels: { withInternship: string; withoutInternship: string },
): AdminDonutSegment[] {
  return [
    {
      key: 'with',
      label: labels.withInternship,
      value: stats.with_internship,
      color: '#6366f1',
    },
    {
      key: 'without',
      label: labels.withoutInternship,
      value: stats.without_internship,
      color: '#f97316',
    },
  ].filter((segment) => segment.value > 0);
}

export function buildStudentsActiveSplitSegments(
  stats: StudentDashboardStats,
  labels: { active: string; inactive: string },
): AdminDonutSegment[] {
  return [
    {
      key: 'active',
      label: labels.active,
      value: stats.active,
      color: '#22c55e',
    },
    {
      key: 'inactive',
      label: labels.inactive,
      value: stats.inactive,
      color: '#64748b',
    },
  ].filter((segment) => segment.value > 0);
}
