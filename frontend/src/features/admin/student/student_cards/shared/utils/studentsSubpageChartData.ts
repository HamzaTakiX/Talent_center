import type { AdminStudentRow, StudentDashboardStats } from '../../../../api/types';
import type { AdminDonutSegment } from '../../../../ui/charts/types';
import { studentFieldLabel } from '../../../../dashboard/dashboard_cards/shared/utils/dashboardCardFilters';
import { engagementBand } from './studentListFilters';
import type { StudentListSliceFilter } from '../types/studentListSlice';

const FIELD_COLORS = ['#2563eb', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#64748b'];
const TOP_FIELDS = 5;

export function segmentLabelWithTotal(baseLabel: string, count: number, total: number): string {
  return `${baseLabel} — ${count} / ${total}`;
}

function countByField(rows: AdminStudentRow[]): { label: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const label = studentFieldLabel(row);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function buildActiveInactiveDonut(
  stats: StudentDashboardStats,
  labels: { active: string; inactive: string },
): AdminDonutSegment[] {
  const { total, active, inactive } = stats;
  return [
    {
      key: 'active',
      label: segmentLabelWithTotal(labels.active, active, total),
      value: active,
      color: '#22c55e',
    },
    {
      key: 'inactive',
      label: segmentLabelWithTotal(labels.inactive, inactive, total),
      value: inactive,
      color: '#64748b',
    },
  ].filter((segment) => segment.value > 0);
}

export function buildInternshipSplitDonut(
  stats: StudentDashboardStats,
  labels: { withInternship: string; withoutInternship: string },
  highlight: 'with' | 'without',
): AdminDonutSegment[] {
  const { total, with_internship, without_internship } = stats;
  const withSeg = {
    key: 'with',
    label: segmentLabelWithTotal(labels.withInternship, with_internship, total),
    value: with_internship,
    color: highlight === 'with' ? '#6366f1' : '#94a3b8',
  };
  const withoutSeg = {
    key: 'without',
    label: segmentLabelWithTotal(labels.withoutInternship, without_internship, total),
    value: without_internship,
    color: highlight === 'without' ? '#f97316' : '#94a3b8',
  };
  return [withSeg, withoutSeg].filter((segment) => segment.value > 0);
}

export function buildFieldDistributionDonut(
  rows: AdminStudentRow[],
  total: number,
  othersLabel: string,
): AdminDonutSegment[] {
  const items = countByField(rows).slice(0, TOP_FIELDS);
  const topSum = items.reduce((sum, item) => sum + item.value, 0);
  const others = Math.max(0, total - topSum);

  const segments: AdminDonutSegment[] = items.map((item, index) => ({
    key: `field-${index}`,
    label: segmentLabelWithTotal(item.label, item.value, total),
    value: item.value,
    color: FIELD_COLORS[index % FIELD_COLORS.length],
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

export function buildEngagementDonut(
  rows: AdminStudentRow[],
  total: number,
  labels: { high: string; medium: string; low: string },
): AdminDonutSegment[] {
  const counts = { High: 0, Medium: 0, Low: 0 };
  for (const row of rows) {
    counts[engagementBand(row)] += 1;
  }
  return [
    {
      key: 'high',
      label: segmentLabelWithTotal(labels.high, counts.High, total),
      value: counts.High,
      color: '#22c55e',
    },
    {
      key: 'medium',
      label: segmentLabelWithTotal(labels.medium, counts.Medium, total),
      value: counts.Medium,
      color: '#3b82f6',
    },
    {
      key: 'low',
      label: segmentLabelWithTotal(labels.low, counts.Low, total),
      value: counts.Low,
      color: '#f97316',
    },
  ].filter((segment) => segment.value > 0);
}

export function buildOnboardingStepDonut(
  rows: AdminStudentRow[],
  total: number,
  labels: { step0: string; step50: string; step100: string },
): AdminDonutSegment[] {
  let step0 = 0;
  let step50 = 0;
  let step100 = 0;
  for (const row of rows) {
    const p = row.onboarding_percent ?? 0;
    if (p >= 100) step100 += 1;
    else if (p >= 50) step50 += 1;
    else step0 += 1;
  }
  return [
    {
      key: 'step0',
      label: segmentLabelWithTotal(labels.step0, step0, total),
      value: step0,
      color: '#f97316',
    },
    {
      key: 'step50',
      label: segmentLabelWithTotal(labels.step50, step50, total),
      value: step50,
      color: '#3b82f6',
    },
    {
      key: 'step100',
      label: segmentLabelWithTotal(labels.step100, step100, total),
      value: step100,
      color: '#22c55e',
    },
  ].filter((segment) => segment.value > 0);
}

export function buildSubpageDonutSegments(
  filter: StudentListSliceFilter,
  globalStats: StudentDashboardStats | null,
  allRows: AdminStudentRow[],
  labels: {
    active: string;
    inactive: string;
    withInternship: string;
    withoutInternship: string;
    high: string;
    medium: string;
    low: string;
    others: string;
    step0: string;
    step50: string;
    step100: string;
  },
): { segments: AdminDonutSegment[]; centerTotal: number } {
  const total = globalStats?.total ?? allRows.length;
  const stats = globalStats ?? {
    total: allRows.length,
    active: 0,
    inactive: 0,
    without_internship: 0,
    with_internship: 0,
    engagement_percent: 0,
  };

  switch (filter) {
    case 'active':
    case 'inactive':
      return {
        segments: buildActiveInactiveDonut(stats, {
          active: labels.active,
          inactive: labels.inactive,
        }),
        centerTotal: total,
      };
    case 'without_internship':
      return {
        segments: buildInternshipSplitDonut(
          stats,
          { withInternship: labels.withInternship, withoutInternship: labels.withoutInternship },
          'without',
        ),
        centerTotal: total,
      };
    case 'with_internship':
      return {
        segments: buildInternshipSplitDonut(
          stats,
          { withInternship: labels.withInternship, withoutInternship: labels.withoutInternship },
          'with',
        ),
        centerTotal: total,
      };
    case 'engagement':
      return {
        segments: buildEngagementDonut(allRows, total, {
          high: labels.high,
          medium: labels.medium,
          low: labels.low,
        }),
        centerTotal: total,
      };
    case 'all':
    default:
      return {
        segments: buildFieldDistributionDonut(allRows, total, labels.others),
        centerTotal: total,
      };
  }
}
