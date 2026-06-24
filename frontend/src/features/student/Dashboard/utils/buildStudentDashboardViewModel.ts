import type { HistoryEventDto } from '../../../admin/api/history';
import type { CvAnalysisDashboardData } from '../../internship_offers/CV_Analyse/types/cvAnalysisDashboard';
import type { InternshipJourneyDashboard } from '../../internship_offers/types/journeyTypes';
import type { StudentStatItem } from '../data/studentDashboardMock';
import type {
  StudentDashboardActivityItem,
  StudentDashboardAlert,
  StudentDashboardChartData,
  StudentDashboardProgressMetric,
  StudentDashboardViewModel,
  StudentActivityIconKey,
} from '../types/studentDashboardData';

const PENDING_STATUSES = new Set(['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED']);

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

function buildWeeklyBuckets(events: HistoryEventDto[]): StudentDashboardChartData {
  const weekStart = startOfWeekMonday();
  const applications = [0, 0, 0, 0, 0, 0, 0];
  const profileViews = [0, 0, 0, 0, 0, 0, 0];
  const messages = [0, 0, 0, 0, 0, 0, 0];

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
    } else if (
      (app === 'students' || app === 'auth') &&
      (code.includes('profile') || code.includes('update'))
    ) {
      profileViews[idx] += 1;
    } else if (
      ['chat', 'notifications', 'announcements'].includes(app) ||
      code.includes('message')
    ) {
      messages[idx] += 1;
    }
  }

  return { applications, profileViews, messages };
}

function resolveActivityIcon(event: HistoryEventDto): StudentActivityIconKey {
  const app = event.source_app;
  if (app === 'chat' || app === 'notifications') return 'message';
  if (app === 'announcements') return 'announcement';
  return 'application';
}

function buildSparkline(current: number, points = 7): number[] {
  if (current <= 0) return Array.from({ length: points }, () => 0);
  const start = Math.max(0, current - Math.round(current * 0.2));
  const step = (current - start) / (points - 1 || 1);
  return Array.from({ length: points }, (_, i) => Math.round(start + step * i));
}

function mapCvSegments(cvDashboard: CvAnalysisDashboardData | null, fallbackScore: number) {
  const breakdown = cvDashboard?.breakdown ?? [];
  const byId = Object.fromEntries(breakdown.map((item) => [item.id, item.score]));

  return [
    { key: 'ats' as const, value: byId.ats ?? fallbackScore },
    { key: 'visibility' as const, value: byId.formatting ?? byId.readiness ?? fallbackScore },
    { key: 'skills' as const, value: byId.skills ?? fallbackScore },
    { key: 'keywords' as const, value: byId.experience ?? byId.education ?? fallbackScore },
  ];
}

function mapAlerts(journey: InternshipJourneyDashboard, translateAction: (titleKey: string, offerTitle?: string) => string): StudentDashboardAlert[] {
  return journey.action_items.slice(0, 5).map((item, index) => ({
    id: `${item.type}-${index}`,
    variant:
      item.priority === 'high'
        ? 'warning'
        : item.type.includes('interview')
          ? 'success'
          : 'info',
    message: translateAction(item.title_key, item.offer_title),
    cta: '→',
    href: item.href,
  }));
}

function buildStats(journey: InternshipJourneyDashboard): StudentStatItem[] {
  const { analytics } = journey;
  const pending = journey.applications_in_progress.filter((app) =>
    PENDING_STATUSES.has(app.status),
  ).length;

  return [
    { labelKey: 'applicationsSent', value: String(analytics.applications_sent), iconKey: 'sent' },
    { labelKey: 'pending', value: String(pending), iconKey: 'pending' },
    { labelKey: 'interviews', value: String(analytics.interviews_obtained), iconKey: 'interviews' },
    { labelKey: 'accepted', value: String(analytics.offers_accepted), iconKey: 'accepted' },
    { labelKey: 'rejected', value: String(analytics.rejected), iconKey: 'rejected' },
  ];
}

function countApplicationsThisWeek(journey: InternshipJourneyDashboard, events: HistoryEventDto[]): number {
  const weekAgo = Date.now() - 7 * 86_400_000;
  const fromApps = journey.applications_in_progress.filter((app) => {
    if (!app.applied_at) return false;
    return Date.parse(app.applied_at) >= weekAgo;
  }).length;

  const fromHistory = events.filter((event) => {
    const code = `${event.event_code} ${event.action_code}`.toLowerCase();
    return (
      ['stage', 'internship', 'smart_assignment'].includes(event.source_app) &&
      code.includes('application') &&
      Date.parse(event.occurred_at) >= weekAgo
    );
  }).length;

  return Math.max(fromApps, fromHistory);
}

export function buildStudentDashboardViewModel(input: {
  journey: InternshipJourneyDashboard;
  historyEvents: HistoryEventDto[];
  cvDashboard: CvAnalysisDashboardData | null;
  formatRelativeTime: (iso: string) => string;
  translateAction: (titleKey: string, offerTitle?: string) => string;
}): StudentDashboardViewModel {
  const { journey, historyEvents, cvDashboard, formatRelativeTime, translateAction } = input;

  const profilePercent = journey.profile_completion.percent;
  const profileChecks = journey.profile_completion.checks;
  const checkValues = Object.values(profileChecks);
  const completedSections = checkValues.filter(Boolean).length;
  const totalSections = checkValues.length || 4;

  const cvPercent = Math.round(journey.cv_score ?? cvDashboard?.meta?.overallScore ?? 0);
  const cvWeeklyDelta = cvDashboard?.meta?.overallScore
    ? Math.max(0, Math.round((cvDashboard.meta.overallScore - (cvPercent - 5)) * 0.1))
    : 0;

  const hasCv = journey.action_items.every((item) => item.type !== 'upload_cv');
  const readinessPercent = Math.round(
    (profilePercent + (cvPercent > 0 ? cvPercent : hasCv ? 70 : 30)) / (cvPercent > 0 || hasCv ? 2 : 1),
  );
  const missingCount =
    totalSections -
    completedSections +
    (hasCv ? 0 : 1) +
    (profileChecks.skills ? 0 : 0);

  const weekTotal = countApplicationsThisWeek(journey, historyEvents);
  const { analytics } = journey;
  const responded = analytics.offers_accepted + analytics.rejected;
  const responseRate =
    analytics.applications_sent > 0
      ? Math.round((responded / analytics.applications_sent) * 100)
      : 0;

  const pending = journey.applications_in_progress.filter((app) =>
    PENDING_STATUSES.has(app.status),
  ).length;

  const recentActivityCount =
    historyEvents.filter((event) => Date.parse(event.occurred_at) >= Date.now() - 7 * 86_400_000)
      .length;
  const activityPercent = Math.min(100, recentActivityCount * 12);

  const alerts: StudentDashboardAlert[] = journey.action_items.length
    ? mapAlerts(journey, translateAction)
    : [];

  const recentActivity: StudentDashboardActivityItem[] = historyEvents.slice(0, 5).map((event) => ({
    id: String(event.id),
    iconKey: resolveActivityIcon(event),
    action: event.summary || event.event_code,
    time: formatRelativeTime(event.occurred_at),
  }));

  if (recentActivity.length === 0 && journey.recent_status_updates.length > 0) {
    for (const update of journey.recent_status_updates.slice(0, 5)) {
      recentActivity.push({
        id: update.application_uuid,
        iconKey: 'application',
        action: `${update.offer_title} — ${update.status}`,
        time: formatRelativeTime(update.changed_at),
      });
    }
  }

  const chart = buildWeeklyBuckets(historyEvents);

  return {
    stats: buildStats(journey),
    hero: {
      profile: {
        percent: profilePercent,
        trendPercent: Math.min(20, Math.max(0, profilePercent - 70)),
        completedSections,
        totalSections,
        checklist: [
          { key: 'photo', done: profileChecks.professional_summary ?? false },
          { key: 'experience', done: profileChecks.academic_profile ?? false },
          { key: 'skills', done: profileChecks.skills ?? false },
        ],
        sparkline: buildSparkline(profilePercent),
      },
      cv: {
        percent: cvPercent,
        weeklyDelta: cvWeeklyDelta,
        percentile: Math.min(99, Math.max(10, cvPercent - 5)),
        segments: mapCvSegments(cvDashboard, cvPercent),
        sparkline: buildSparkline(cvPercent),
      },
      readiness: {
        percent: readinessPercent,
        recruiterMatch: Math.min(99, Math.max(0, readinessPercent - 6)),
        missingCount: Math.max(0, missingCount),
        stageIndex: hasCv ? (profilePercent >= 80 ? 2 : 1) : 0,
        stages: ['profile', 'cv', 'apply'],
        requirements: [
          { key: 'cvUploaded', done: hasCv },
          { key: 'preferences', done: profileChecks.city ?? false },
        ],
      },
      applications: {
        weekTotal,
        responseRate,
        trendPercent: weekTotal > 0 ? 12 : 0,
        sparkline: chart.applications.length ? chart.applications : buildSparkline(weekTotal, 7),
        ratio: {
          accepted: analytics.offers_accepted,
          pending,
          rejected: analytics.rejected,
        },
      },
    },
    chart,
    alerts,
    progress: [
      { key: 'profile', percent: profilePercent, barClass: 'bg-[#2b7fff]' },
      { key: 'cv', percent: cvPercent, barClass: 'bg-[#1d4ed8]' },
      { key: 'activity', percent: activityPercent, barClass: 'bg-[#8b5cf6]' },
    ],
    recentActivity,
  };
}
