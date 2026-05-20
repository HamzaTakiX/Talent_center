import type { AdminEncadrantRow } from '../../../../api/types';
import type { AdminDonutSegment } from '../../../../ui/charts/types';
import type { EncadrantDashboardStats } from './encadrantStats';
import type { EncadrantListSliceFilter } from '../types/encadrantListSlice';
import { encadrantScopeLabel } from './encadrantDisplay';

const DEPT_COLORS = ['#7c3aed', '#6366f1', '#3b82f6', '#0891b2', '#22c55e', '#64748b'];
const TOP_ASSIGNED = 5;

export function segmentLabelWithTotal(baseLabel: string, count: number, total: number): string {
  return `${baseLabel} — ${count} / ${total}`;
}

function countEncadrantsByScope(rows: AdminEncadrantRow[]): { label: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const label = encadrantScopeLabel(row, '—');
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function buildDepartmentDonut(
  rows: AdminEncadrantRow[],
  total: number,
  othersLabel: string,
): AdminDonutSegment[] {
  const items = countEncadrantsByScope(rows).slice(0, TOP_ASSIGNED);
  const topSum = items.reduce((sum, item) => sum + item.value, 0);
  const others = Math.max(0, total - topSum);

  const segments: AdminDonutSegment[] = items.map((item, index) => ({
    key: `dept-${index}`,
    label: segmentLabelWithTotal(item.label, item.value, total),
    value: item.value,
    color: DEPT_COLORS[index % DEPT_COLORS.length],
  }));

  if (others > 0) {
    segments.push({
      key: 'others',
      label: segmentLabelWithTotal(othersLabel, others, total),
      value: others,
      color: '#64748b',
    });
  }

  return segments.filter((segment) => segment.value > 0);
}

export function buildActiveInactiveDonut(
  stats: EncadrantDashboardStats,
  labels: { active: string; inactive: string },
): AdminDonutSegment[] {
  const { total, active_encadrants, inactive_encadrants } = stats;
  return [
    {
      key: 'active',
      label: segmentLabelWithTotal(labels.active, active_encadrants, total),
      value: active_encadrants,
      color: '#22c55e',
    },
    {
      key: 'inactive',
      label: segmentLabelWithTotal(labels.inactive, inactive_encadrants, total),
      value: inactive_encadrants,
      color: '#64748b',
    },
  ].filter((segment) => segment.value > 0);
}

export function buildWithStudentsSplitDonut(
  stats: EncadrantDashboardStats,
  labels: { withStudents: string; withoutStudents: string },
  highlight: 'with' | 'without',
): AdminDonutSegment[] {
  const { total, with_students, without_students } = stats;
  return [
    {
      key: 'with',
      label: segmentLabelWithTotal(labels.withStudents, with_students, total),
      value: with_students,
      color: highlight === 'with' ? '#22c55e' : '#94a3b8',
    },
    {
      key: 'without',
      label: segmentLabelWithTotal(labels.withoutStudents, without_students, total),
      value: without_students,
      color: highlight === 'without' ? '#f97316' : '#94a3b8',
    },
  ].filter((segment) => segment.value > 0);
}

export function buildTopAssignedDonut(
  rows: AdminEncadrantRow[],
  totalAssigned: number,
): AdminDonutSegment[] {
  const top = [...rows]
    .filter((row) => row.current_students > 0)
    .sort((a, b) => b.current_students - a.current_students)
    .slice(0, TOP_ASSIGNED);

  const topSum = top.reduce((sum, row) => sum + row.current_students, 0);
  const others = Math.max(0, totalAssigned - topSum);

  const segments: AdminDonutSegment[] = top.map((row, index) => ({
    key: `enc-${row.id}`,
    label: segmentLabelWithTotal(row.full_name || row.email, row.current_students, totalAssigned),
    value: row.current_students,
    color: DEPT_COLORS[index % DEPT_COLORS.length],
  }));

  if (others > 0) {
    segments.push({
      key: 'others',
      label: segmentLabelWithTotal('Autres', others, totalAssigned),
      value: others,
      color: '#64748b',
    });
  }

  return segments.filter((segment) => segment.value > 0);
}

export function buildSubpageEncadrantDonut(
  filter: EncadrantListSliceFilter,
  stats: EncadrantDashboardStats,
  allRows: AdminEncadrantRow[],
  labels: {
    active: string;
    inactive: string;
    withStudents: string;
    withoutStudents: string;
    others: string;
  },
): { segments: AdminDonutSegment[]; centerTotal: number } {
  const { total, total_assigned_students } = stats;

  switch (filter) {
    case 'with_students':
      return {
        segments: buildTopAssignedDonut(allRows, total_assigned_students),
        centerTotal: total_assigned_students,
      };
    case 'reports_in_progress':
      return {
        segments: [],
        centerTotal: 0,
      };
    case 'meetings':
      return {
        segments: buildWithStudentsSplitDonut(
          stats,
          { withStudents: labels.withStudents, withoutStudents: labels.withoutStudents },
          'with',
        ),
        centerTotal: total,
      };
    case 'all':
    default:
      return {
        segments: buildDepartmentDonut(allRows, total, labels.others),
        centerTotal: total,
      };
  }
}
