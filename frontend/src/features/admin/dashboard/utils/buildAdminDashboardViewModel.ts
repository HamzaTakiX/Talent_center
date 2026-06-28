import type { HistoryEventDto } from '../../api/history';
import type { DocumentsDashboardData } from '../../Documents_admin/types';
import type { SrfDashboardSummary } from '../../api/srf';
import type { StageAnalyticsDashboard } from '../../../shared/types/stageTypes';
import type { AlertMetricDefinition } from '../data/alertAnalyticsMock';
import { ALERT_METRIC_DEFINITIONS } from '../data/alertAnalyticsMock';
import type { DashboardStatId } from '../data/adminMockData';

import type { StudentDashboardStats } from '../../api/types';

export interface AdminDashboardCounts {
  totalStudents: number;
  totalEncadrants: number;
  totalAdmins: number;
  studentsWithoutInternship: number;
  activeInternshipOffers: number;
  ongoingApplications: number;
  documentsPending: number;
  studentsUnpaidSrf: number;
  offersExpiring: number;
  studentsAtRisk: number;
  criticalAlerts: number;
  activeUsersToday: number;
  engagementPercent: number;
}

export interface AdminDashboardChartData {
  applications: number[];
  documents: number[];
  announcements: number[];
  studentActivity: number[];
}

export interface AdminDashboardActivityItem {
  id: string;
  action: string;
  user: string;
  time: string;
}

export interface AdminDashboardHealth {
  score: number;
  criticalAlerts: number;
  studentsAtRisk: number;
  activeUsers: number;
  riskTrend: number[];
  activityTrend: number[];
}

export interface AdminDashboardViewModel {
  counts: AdminDashboardCounts;
  chart: AdminDashboardChartData;
  recentActivity: AdminDashboardActivityItem[];
  health: AdminDashboardHealth;
  alertMetrics: AlertMetricDefinition[];
}

function startOfWeekMonday(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diff);
  return d;
}

function dayIndexInWeek(iso: string, weekStart: Date): number | null {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return null;
  const eventDay = new Date(parsed);
  eventDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round((eventDay.getTime() - weekStart.getTime()) / 86_400_000);
  if (diffDays < 0 || diffDays > 6) return null;
  return diffDays;
}

function buildWeeklyChart(events: HistoryEventDto[]): AdminDashboardChartData {
  const weekStart = startOfWeekMonday();
  const applications = [0, 0, 0, 0, 0, 0, 0];
  const documents = [0, 0, 0, 0, 0, 0, 0];
  const announcements = [0, 0, 0, 0, 0, 0, 0];
  const studentActivity = [0, 0, 0, 0, 0, 0, 0];

  for (const event of events) {
    const idx = dayIndexInWeek(event.occurred_at, weekStart);
    if (idx === null) continue;

    const app = event.source_app;
    const code = `${event.event_code} ${event.action_code}`.toLowerCase();

    if (
      ['stage', 'internship', 'smart_assignment'].includes(app) &&
      code.includes('application')
    ) {
      applications[idx] += 1;
    } else if (app === 'documents') {
      documents[idx] += 1;
    } else if (app === 'announcements') {
      announcements[idx] += 1;
    } else if (
      ['students', 'auth', 'stage', 'internship'].includes(app) ||
      code.includes('student') ||
      code.includes('profile')
    ) {
      studentActivity[idx] += 1;
    }
  }

  return { applications, documents, announcements, studentActivity };
}

function normalizeTrend(values: number[], points = 5): number[] {
  const slice = values.slice(-points);
  while (slice.length < points) slice.unshift(0);
  const max = Math.max(...slice, 1);
  return slice.map((v) => Math.max(0.08, v / max));
}

function buildRiskTrend(events: HistoryEventDto[]): number[] {
  const days = 5;
  const buckets = Array.from({ length: days }, () => 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (const event of events) {
    const parsed = Date.parse(event.occurred_at);
    if (Number.isNaN(parsed)) continue;
    const eventDay = new Date(parsed);
    eventDay.setHours(0, 0, 0, 0);
    const diffDays = Math.round((now.getTime() - eventDay.getTime()) / 86_400_000);
    if (diffDays < 0 || diffDays >= days) continue;
    if (['ERROR', 'CRITICAL'].includes(event.severity?.toUpperCase?.() ?? '')) {
      buckets[days - 1 - diffDays] += 1;
    }
  }

  return normalizeTrend(buckets);
}

function buildActivityTrend(events: HistoryEventDto[]): number[] {
  const days = 5;
  const buckets = Array.from({ length: days }, () => 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (const event of events) {
    const parsed = Date.parse(event.occurred_at);
    if (Number.isNaN(parsed)) continue;
    const eventDay = new Date(parsed);
    eventDay.setHours(0, 0, 0, 0);
    const diffDays = Math.round((now.getTime() - eventDay.getTime()) / 86_400_000);
    if (diffDays < 0 || diffDays >= days) continue;
    buckets[days - 1 - diffDays] += 1;
  }

  return normalizeTrend(buckets);
}

function computeHealthScore(counts: AdminDashboardCounts): number {
  const engagement = counts.engagementPercent;
  const issueWeight =
    counts.studentsUnpaidSrf +
    counts.studentsWithoutInternship +
    counts.documentsPending +
    counts.studentsAtRisk;
  const studentBase = Math.max(counts.totalStudents, 1);
  const penalty = Math.min(55, Math.round((issueWeight / studentBase) * 100));
  return Math.max(0, Math.min(100, Math.round(engagement * 0.45 + (100 - penalty) * 0.55)));
}

export function buildAdminDashboardCounts(input: {
  studentStats: StudentDashboardStats | null;
  totalEncadrants: number | null;
  totalAdmins: number | null;
  stageDashboard: StageAnalyticsDashboard | null;
  documentsDashboard: DocumentsDashboardData | null;
  srfSummary: SrfDashboardSummary | null;
  historySummary: {
    critical_events?: number;
    active_users_today?: number;
  } | null;
}): AdminDashboardCounts {
  const studentStats = input.studentStats;
  const stageSummary = input.stageDashboard?.summary;
  const unpaid = input.srfSummary?.unpaid_students ?? 0;
  const atRisk = input.srfSummary?.at_risk_students ?? 0;
  const withoutInternship = studentStats?.without_internship ?? 0;
  const documentsPending = input.documentsDashboard?.summary.pendingApprovals ?? 0;
  const offersExpiring = stageSummary?.expiring_offers_this_week ?? 0;

  const criticalAlerts =
    unpaid + withoutInternship + documentsPending + offersExpiring + atRisk;

  return {
    totalStudents: studentStats?.total ?? 0,
    totalEncadrants: input.totalEncadrants ?? 0,
    totalAdmins: input.totalAdmins ?? 0,
    studentsWithoutInternship: withoutInternship,
    activeInternshipOffers: stageSummary?.open_offers ?? stageSummary?.published_offers ?? 0,
    ongoingApplications: stageSummary?.ongoing_applications ?? 0,
    documentsPending,
    studentsUnpaidSrf: unpaid,
    offersExpiring,
    studentsAtRisk: atRisk,
    criticalAlerts: input.historySummary?.critical_events ?? criticalAlerts,
    activeUsersToday: input.historySummary?.active_users_today ?? 0,
    engagementPercent: studentStats?.engagement_percent ?? 0,
  };
}

export function buildAlertMetricsFromCounts(counts: AdminDashboardCounts): AlertMetricDefinition[] {
  const countByKey: Record<string, number> = {
    unpaidSrf: counts.studentsUnpaidSrf,
    documentsPending: counts.documentsPending,
    noInternship: counts.studentsWithoutInternship,
    offersExpiring: counts.offersExpiring,
  };

  return ALERT_METRIC_DEFINITIONS.map((def) => ({
    ...def,
    count: countByKey[def.messageKey] ?? 0,
  }));
}

export function buildAdminDashboardViewModel(input: {
  studentStats: StudentDashboardStats | null;
  totalEncadrants: number | null;
  totalAdmins: number | null;
  stageDashboard: StageAnalyticsDashboard | null;
  documentsDashboard: DocumentsDashboardData | null;
  srfSummary: SrfDashboardSummary | null;
  historyEvents: HistoryEventDto[];
  historySummary: {
    critical_events?: number;
    active_users_today?: number;
  } | null;
  formatRelativeTime: (iso: string) => string;
}): AdminDashboardViewModel {
  const counts = buildAdminDashboardCounts({
    studentStats: input.studentStats,
    totalEncadrants: input.totalEncadrants,
    totalAdmins: input.totalAdmins,
    stageDashboard: input.stageDashboard,
    documentsDashboard: input.documentsDashboard,
    srfSummary: input.srfSummary,
    historySummary: input.historySummary,
  });

  const chart = buildWeeklyChart(input.historyEvents);
  const recentActivity: AdminDashboardActivityItem[] = input.historyEvents.slice(0, 7).map((event) => ({
    id: String(event.id),
    action: event.summary?.trim() || event.event_code,
    user: event.actor_name?.trim() || (event.is_automated ? 'System' : '—'),
    time: input.formatRelativeTime(event.occurred_at),
  }));

  const health: AdminDashboardHealth = {
    score: computeHealthScore(counts),
    criticalAlerts: counts.criticalAlerts,
    studentsAtRisk: counts.studentsAtRisk,
    activeUsers: counts.activeUsersToday,
    riskTrend: buildRiskTrend(input.historyEvents),
    activityTrend: buildActivityTrend(input.historyEvents),
  };

  return {
    counts,
    chart,
    recentActivity,
    health,
    alertMetrics: buildAlertMetricsFromCounts(counts),
  };
}

export const STAT_COUNT_KEYS: Record<DashboardStatId, keyof AdminDashboardCounts> = {
  totalStudents: 'totalStudents',
  totalEncadrants: 'totalEncadrants',
  totalAdmins: 'totalAdmins',
  studentsWithoutInternship: 'studentsWithoutInternship',
  activeInternshipOffers: 'activeInternshipOffers',
  ongoingApplications: 'ongoingApplications',
  documentsPending: 'documentsPending',
  studentsUnpaidSrf: 'studentsUnpaidSrf',
};

export function isAdminDashboardChartEmpty(chart: AdminDashboardChartData): boolean {
  return (
    chart.applications.every((v) => v === 0) &&
    chart.documents.every((v) => v === 0) &&
    chart.announcements.every((v) => v === 0) &&
    chart.studentActivity.every((v) => v === 0)
  );
}
