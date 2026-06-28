import type { InterviewHubStats, InterviewSessionListItem } from '../../types/offerAiCoach';
import type { AnalyticsMetric, InterviewDifficulty, InterviewHistoryRow } from '../types/interviewSimulatorDashboard';

const DIFFICULTY_MAP: Record<string, InterviewDifficulty> = {
  easy: 'beginner',
  medium: 'intermediate',
  hard: 'advanced',
};

const TYPE_KEY_MAP: Record<string, string> = {
  technical: 'student.internshipOffers.interviewSim.history.types.technical',
  hr: 'student.internshipOffers.interviewSim.history.types.behavioral',
  behavioral: 'student.internshipOffers.interviewSim.history.types.behavioral',
  case_study: 'student.internshipOffers.interviewSim.history.types.technical',
  mixed: 'student.internshipOffers.interviewSim.history.types.general',
};

const STATUS_KEY_MAP: Record<string, string> = {
  completed: 'student.internshipOffers.interviewSim.history.statuses.completed',
  in_progress: 'student.internshipOffers.interviewSim.history.statuses.inProgress',
  abandoned: 'student.internshipOffers.interviewSim.history.statuses.abandoned',
  draft: 'student.internshipOffers.interviewSim.history.statuses.draft',
};

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '—';
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} min`;
}

function formatSessionDate(value: string | null | undefined, locale: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function mapSessionListItemToHistoryRow(
  item: InterviewSessionListItem,
  locale: string,
): InterviewHistoryRow {
  const difficulty = DIFFICULTY_MAP[item.difficulty ?? 'medium'] ?? 'intermediate';
  const typeKey = TYPE_KEY_MAP[item.interview_type ?? 'mixed'] ?? TYPE_KEY_MAP.mixed;
  const statusKey = STATUS_KEY_MAP[item.status] ?? STATUS_KEY_MAP.completed;
  const dateSource = item.completed_at || item.created_at;

  return {
    id: item.session_uuid,
    sessionUuid: item.session_uuid,
    date: formatSessionDate(dateSource, locale),
    typeKey,
    difficulty,
    score: typeof item.score === 'number' ? item.score : 0,
    duration: formatDuration(item.duration_seconds),
    statusKey,
    status: item.status,
    roleLabel: item.role_label || undefined,
    hasReport: Boolean(item.has_report),
    readinessText: item.readiness_text || undefined,
  };
}

function padTrend(values: number[], minLength = 2): number[] {
  if (values.length === 0) return [0, 0];
  if (values.length === 1) return [values[0], values[0]];
  return values;
}

export function mapHubStatsToAnalytics(stats: InterviewHubStats | null): {
  avgOverall: number;
  avgPreparation: number;
  metrics: AnalyticsMetric[];
} {
  if (!stats) {
    return {
      avgOverall: 0,
      avgPreparation: 0,
      metrics: [],
    };
  }

  const analytics = stats.analytics ?? {
    avg_score: [],
    confidence: [],
    technical: [],
    completion: [],
  };

  return {
    avgOverall: stats.avg_overall_score ?? 0,
    avgPreparation: stats.avg_preparation_score ?? 0,
    metrics: [
      {
        id: 'avg',
        labelKey: 'student.internshipOffers.interviewSim.analytics.avgScore',
        values: padTrend(analytics.avg_score ?? []),
      },
      {
        id: 'conf',
        labelKey: 'student.internshipOffers.interviewSim.analytics.confidence',
        values: padTrend(analytics.confidence ?? []),
        unit: '%',
      },
      {
        id: 'tech',
        labelKey: 'student.internshipOffers.interviewSim.analytics.technical',
        values: padTrend(analytics.technical ?? []),
        unit: '%',
      },
      {
        id: 'completion',
        labelKey: 'student.internshipOffers.interviewSim.analytics.completion',
        values: padTrend(analytics.completion ?? []),
        unit: '%',
      },
    ],
  };
}
