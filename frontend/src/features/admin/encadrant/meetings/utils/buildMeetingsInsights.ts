import type {
  EncadrantMeetingOverview,
  MeetingsDashboardSummary,
  MeetingAlert,
} from '../types/supervisionMeeting';

export type MeetingInsightTone = 'info' | 'warning' | 'success' | 'critical';

export interface MeetingInsight {
  id: string;
  tone: MeetingInsightTone;
  messageKey: string;
  defaultMessage: string;
  count?: number;
}

export function buildMeetingsInsights(
  summary: MeetingsDashboardSummary | null,
  alerts: MeetingAlert[],
  encadrantRows: EncadrantMeetingOverview[],
): MeetingInsight[] {
  const insights: MeetingInsight[] = [];

  if (!summary) return insights;

  if (summary.needsFollowup > 0) {
    insights.push({
      id: 'needs-followup',
      tone: 'warning',
      messageKey: 'admin.modules.meetings.insights.needsFollowup',
      defaultMessage: '{{count}} meetings require follow-up action',
      count: summary.needsFollowup,
    });
  }

  if (summary.overdue > 0) {
    insights.push({
      id: 'overdue',
      tone: 'critical',
      messageKey: 'admin.modules.meetings.insights.overdue',
      defaultMessage: '{{count}} meetings are overdue',
      count: summary.overdue,
    });
  }

  const overloaded = encadrantRows.filter((r) => r.totalMeetings >= 8).slice(0, 3);
  if (overloaded.length) {
    insights.push({
      id: 'overloaded-encadrants',
      tone: 'warning',
      messageKey: 'admin.modules.meetings.insights.overloadedEncadrants',
      defaultMessage: '{{count}} supervisors have a heavy meeting load this period',
      count: overloaded.length,
    });
  }

  if (summary.cancellationRate > 15) {
    insights.push({
      id: 'cancellation-rate',
      tone: 'warning',
      messageKey: 'admin.modules.meetings.insights.cancellationHigh',
      defaultMessage: 'Meeting cancellation rate is elevated ({{count}}%)',
      count: Math.round(summary.cancellationRate),
    });
  } else if (summary.completionRate >= 70) {
    insights.push({
      id: 'coverage-balanced',
      tone: 'success',
      messageKey: 'admin.modules.meetings.insights.coverageBalanced',
      defaultMessage: 'Supervision follow-up coverage is balanced',
    });
  }

  if (summary.upcoming === 0 && summary.total > 0) {
    insights.push({
      id: 'no-upcoming',
      tone: 'info',
      messageKey: 'admin.modules.meetings.insights.noUpcoming',
      defaultMessage: 'No upcoming meetings scheduled — review the agenda',
    });
  }

  for (const alert of alerts.slice(0, 2)) {
    insights.push({
      id: `alert-${alert.code}`,
      tone: alert.severity === 'high' ? 'critical' : 'warning',
      messageKey: 'admin.modules.meetings.insights.alert',
      defaultMessage: alert.message,
      count: alert.count,
    });
  }

  return insights.slice(0, 5);
}
