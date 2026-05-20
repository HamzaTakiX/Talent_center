import type { SmartAssignmentInternshipAnalytics } from '../../../api/types';

/** Muted blue scale aligned with --admin-brand (no rainbow palette). */
export const INTERNSHIP_CHART_COLORS = [
  '#155dfc',
  '#2563eb',
  '#3b82f6',
  '#60a5fa',
  '#1d4ed8',
  '#1e40af',
  '#0284c7',
  '#38bdf8',
] as const;

export type DistributionStatus = 'balanced' | 'low' | 'over' | 'surplus' | 'none';

export interface DistributionRow {
  key: string;
  label: string;
  count: number;
  percent: number;
  color: string;
  studentCount?: number;
  encadrantCount?: number;
  status: DistributionStatus;
}

export interface DistributionSnapshot {
  rows: DistributionRow[];
  /** Primary total shown in KPIs and donut center. */
  total: number;
  /** Denominator for donut arc angles (may differ when categories overlap). */
  donutTotal: number;
  largest: DistributionRow | null;
  smallest: DistributionRow | null;
}

export type InsightKind =
  | 'lowCoverage'
  | 'balanced'
  | 'limitedSupervisors'
  | 'overCapacity'
  | 'surplusSupervisors'
  | 'uncovered'
  | 'dominant'
  | 'diversified';

export interface AnalyticsInsight {
  kind: InsightKind;
  type: string;
  count?: number;
}

const STUDENTS_PER_SUPERVISOR_IDEAL = 4;
const STUDENTS_PER_SUPERVISOR_WARN = 8;

function slugKey(label: string, index: number): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '');
  return base || `type-${index}`;
}

function colorAt(index: number): string {
  return INTERNSHIP_CHART_COLORS[index % INTERNSHIP_CHART_COLORS.length];
}

function encadrantStatus(studentCount: number, encadrantCount: number): DistributionStatus {
  if (studentCount > 0 && encadrantCount === 0) return 'none';
  if (studentCount === 0 && encadrantCount > 2) return 'surplus';
  if (studentCount > 0 && encadrantCount > 0) {
    const ratio = studentCount / encadrantCount;
    if (ratio > STUDENTS_PER_SUPERVISOR_WARN) return 'over';
    if (ratio > STUDENTS_PER_SUPERVISOR_IDEAL) return 'low';
    if (ratio < 1 && encadrantCount >= 2) return 'surplus';
    return 'balanced';
  }
  return 'balanced';
}

export function buildStudentDistribution(
  analytics: SmartAssignmentInternshipAnalytics
): DistributionSnapshot {
  const source = analytics.students_by_internship_type;
  const total = source.reduce((sum, row) => sum + row.count, 0);

  const rows: DistributionRow[] = source.map((row, index) => ({
    key: slugKey(row.internship_type, index),
    label: row.internship_type,
    count: row.count,
    percent: total > 0 ? Math.round((row.count / total) * 100) : 0,
    color: colorAt(index),
    status: 'balanced' as DistributionStatus,
  }));

  const sorted = [...rows].sort((a, b) => b.count - a.count);
  const apiTotal = analytics.total_students_with_type;
  return {
    rows,
    total: apiTotal != null && apiTotal > 0 ? apiTotal : total,
    donutTotal: total,
    largest: sorted[0] ?? null,
    smallest: sorted.length > 1 ? sorted[sorted.length - 1] : sorted[0] ?? null,
  };
}

export function buildEncadrantDistribution(
  analytics: SmartAssignmentInternshipAnalytics
): DistributionSnapshot {
  const studentMap = new Map(
    analytics.students_by_internship_type.map((row) => [row.internship_type, row.count])
  );
  const encSource = analytics.encadrants_by_internship_type;
  const labelOrder: string[] = [];
  const seen = new Set<string>();
  for (const row of [...analytics.students_by_internship_type, ...encSource]) {
    if (!seen.has(row.internship_type)) {
      seen.add(row.internship_type);
      labelOrder.push(row.internship_type);
    }
  }

  let index = 0;
  const rows: DistributionRow[] = labelOrder.map((label) => {
    const encadrantCount = encSource.find((r) => r.internship_type === label)?.count ?? 0;
    const studentCount = studentMap.get(label) ?? 0;
    const row: DistributionRow = {
      key: slugKey(label, index),
      label,
      count: encadrantCount,
      percent: 0,
      color: colorAt(index),
      studentCount,
      encadrantCount,
      status: encadrantStatus(studentCount, encadrantCount),
    };
    index += 1;
    return row;
  });

  const slotTotal =
    analytics.total_supervision_slots ??
    rows.reduce((sum, row) => sum + row.count, 0);
  const uniqueTotal =
    analytics.total_unique_encadrants ??
    (slotTotal > 0 ? Math.max(...rows.map((r) => r.count), 0) : 0);

  rows.forEach((row) => {
    row.percent =
      uniqueTotal > 0 ? Math.round((row.count / uniqueTotal) * 100) : 0;
  });

  const encOnly = rows.filter((r) => r.count > 0).sort((a, b) => b.count - a.count);
  const sorted = encOnly.length > 0 ? encOnly : [...rows].sort((a, b) => b.count - a.count);

  return {
    rows,
    total: uniqueTotal,
    donutTotal: slotTotal,
    largest: sorted[0] ?? null,
    smallest: sorted.length > 1 ? sorted[sorted.length - 1] : sorted[0] ?? null,
  };
}

export function computeCoverageRatio(
  analytics: SmartAssignmentInternshipAnalytics,
  totalStudents: number,
  totalEncadrants: number
): number {
  if (totalStudents <= 0 || totalEncadrants <= 0) return 0;
  const uncoveredStudents = analytics.uncovered_internship_types.reduce(
    (sum, row) => sum + row.student_count,
    0
  );
  const covered = Math.max(totalStudents - uncoveredStudents, 0);
  return Math.round((covered / totalStudents) * 100);
}

export function buildSmartInsights(analytics: SmartAssignmentInternshipAnalytics): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = [];
  const studentMap = new Map(
    analytics.students_by_internship_type.map((row) => [row.internship_type, row.count])
  );
  const encMap = new Map(
    analytics.encadrants_by_internship_type.map((row) => [row.internship_type, row.count])
  );

  for (const uncovered of analytics.uncovered_internship_types) {
    insights.push({
      kind: 'uncovered',
      type: uncovered.internship_type_name,
      count: uncovered.student_count,
    });
  }

  for (const [type, studentCount] of studentMap) {
    const encCount = encMap.get(type) ?? 0;
    if (studentCount > 0 && encCount === 0) {
      if (!insights.some((i) => i.kind === 'uncovered' && i.type === type)) {
        insights.push({ kind: 'lowCoverage', type });
      }
      continue;
    }
    if (studentCount > 0 && encCount > 0) {
      const ratio = studentCount / encCount;
      if (ratio > STUDENTS_PER_SUPERVISOR_WARN) {
        insights.push({ kind: 'overCapacity', type });
      } else if (ratio > STUDENTS_PER_SUPERVISOR_IDEAL) {
        insights.push({ kind: 'limitedSupervisors', type });
      } else if (ratio <= 2 && encCount >= 2) {
        insights.push({ kind: 'surplusSupervisors', type });
      } else if (ratio >= 1 && ratio <= STUDENTS_PER_SUPERVISOR_IDEAL) {
        insights.push({ kind: 'balanced', type });
      }
    }
  }

  const priority: Record<InsightKind, number> = {
    uncovered: 0,
    overCapacity: 1,
    lowCoverage: 2,
    limitedSupervisors: 3,
    surplusSupervisors: 4,
    balanced: 5,
    dominant: 6,
    diversified: 7,
  };

  return insights.sort((a, b) => priority[a.kind] - priority[b.kind]).slice(0, 4);
}

export function buildStudentInsights(snapshot: DistributionSnapshot): AnalyticsInsight[] {
  if (snapshot.rows.length === 0) return [];
  const insights: AnalyticsInsight[] = [];
  const largest = snapshot.largest;
  if (largest && largest.percent >= 35) {
    insights.push({ kind: 'dominant', type: largest.label, count: largest.percent });
  }
  const topShare = largest?.percent ?? 0;
  if (snapshot.rows.length >= 3 && topShare <= 40) {
    insights.push({ kind: 'diversified', type: '' });
  }
  return insights.slice(0, 3);
}

export function donutArcPath(
  size: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const cx = size / 2;
  const cy = size / 2;
  const polar = (angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };
  const start = polar(endAngle);
  const end = polar(startAngle);
  const large = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${large} 0 ${end.x} ${end.y}`;
}

export function buildDonutSegments(rows: DistributionRow[], donutTotal: number) {
  let cursor = 0;
  return rows
    .filter((row) => row.count > 0)
    .map((row, index) => {
      const sweep = donutTotal > 0 ? (row.count / donutTotal) * 360 : 0;
      const start = cursor;
      const end = cursor + sweep;
      cursor = end;
      return {
        ...row,
        path: sweep > 0 ? donutArcPath(140, 52, start, end) : '',
        sweep,
        index,
      };
    });
}
