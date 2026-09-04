import type { ScheduledMeetingSummary } from '../types';

export interface ResolveAgendaMeetingIdOptions {
  explicitMeetingId?: number;
  studentDisplayName?: string;
  startAt?: string;
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

function parseStart(value?: string): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

/** Match mock agenda rows to real scheduled Meeting PKs from the backend. */
export function resolveAgendaMeetingId(
  scheduledMeetings: ScheduledMeetingSummary[],
  options: ResolveAgendaMeetingIdOptions,
): number | undefined {
  if (options.explicitMeetingId) return options.explicitMeetingId;

  let candidates = scheduledMeetings;
  if (options.studentDisplayName) {
    const targetName = normalizeName(options.studentDisplayName);
    candidates = candidates.filter(
      (meeting) => normalizeName(meeting.student.display_name) === targetName,
    );
  }

  const targetStart = parseStart(options.startAt);
  if (targetStart != null && candidates.length > 1) {
    const withDistance = candidates
      .map((meeting) => {
        const planned = parseStart(meeting.planned_start ?? undefined);
        return {
          meeting,
          distance: planned == null ? Number.POSITIVE_INFINITY : Math.abs(planned - targetStart),
        };
      })
      .sort((a, b) => a.distance - b.distance);
    const best = withDistance[0];
    if (best && best.distance <= 24 * 60 * 60 * 1000) {
      return best.meeting.meeting_id;
    }
  }

  return candidates[0]?.meeting_id;
}
