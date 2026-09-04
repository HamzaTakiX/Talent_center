import { useEffect, useState } from 'react';
import { meetingSessionsApi } from '../api/meetingSessionsApi';
import type { ScheduledMeetingSummary } from '../types';

let cachedMeetings: ScheduledMeetingSummary[] | null = null;
let cachePromise: Promise<ScheduledMeetingSummary[]> | null = null;

function loadScheduledMeetings(): Promise<ScheduledMeetingSummary[]> {
  if (cachedMeetings) return Promise.resolve(cachedMeetings);
  if (!cachePromise) {
    cachePromise = meetingSessionsApi
      .listScheduledMeetings()
      .then((data) => {
        cachedMeetings = data;
        return data;
      })
      .catch((err) => {
        cachePromise = null;
        throw err;
      });
  }
  return cachePromise;
}

export function useScheduledMeetings() {
  const [meetings, setMeetings] = useState<ScheduledMeetingSummary[]>(cachedMeetings ?? []);
  const [loading, setLoading] = useState(cachedMeetings == null);

  useEffect(() => {
    let active = true;
    void loadScheduledMeetings()
      .then((data) => {
        if (active) setMeetings(data);
      })
      .catch((err) => {
        console.error('[meeting-room] failed to load scheduled meetings', err);
        if (active) setMeetings([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { meetings, loading };
}

/** Test helper — clears in-memory scheduled meeting cache between sessions. */
export function resetScheduledMeetingsCache(): void {
  cachedMeetings = null;
  cachePromise = null;
}
