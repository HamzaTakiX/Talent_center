import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CoachMessage } from '../types/careerCoach';
import { buildPinnedHighlights, buildPinnedSummary } from '../utils/pinnedReport';

const STORAGE_PREFIX = 'career-coach-pinned:';

function readPinnedIds(sessionId: string): string[] {
  if (!sessionId) return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${sessionId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function writePinnedIds(sessionId: string, ids: string[]) {
  if (!sessionId) return;
  localStorage.setItem(`${STORAGE_PREFIX}${sessionId}`, JSON.stringify(ids));
}

export function useCareerCoachPinnedMessages(sessionId: string, messages: CoachMessage[]) {
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => readPinnedIds(sessionId));

  useEffect(() => {
    setPinnedIds(readPinnedIds(sessionId));
  }, [sessionId]);

  const pinnedSet = useMemo(() => new Set(pinnedIds), [pinnedIds]);

  const isPinned = useCallback((messageId: string) => pinnedSet.has(messageId), [pinnedSet]);

  const togglePin = useCallback(
    (messageId: string) => {
      setPinnedIds((prev) => {
        const next = prev.includes(messageId)
          ? prev.filter((id) => id !== messageId)
          : [...prev, messageId];
        writePinnedIds(sessionId, next);
        return next;
      });
    },
    [sessionId],
  );

  const pinnedHighlights = useMemo(
    () => buildPinnedHighlights(messages, pinnedIds),
    [messages, pinnedIds],
  );

  const pinnedSummary = useMemo(
    () => buildPinnedSummary(sessionId, pinnedHighlights),
    [pinnedHighlights, sessionId],
  );

  return {
    pinnedCount: pinnedIds.length,
    isPinned,
    togglePin,
    pinnedSummary,
    hasPinnedContent: pinnedIds.length > 0,
  };
}
