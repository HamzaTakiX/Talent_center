import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchCareerCoachSummary } from '../api/careerCoachApi';
import type { CoachChatSummary, CoachSummaryCategory } from '../types/careerCoach';
import {
  buildCareerCoachReportSections,
  downloadCareerCoachReportPdf,
  downloadCareerCoachReportWord,
} from '../utils/downloadCareerCoachReport';
import { formatSummaryAsPlainText } from '../utils/pinnedReport';

const CATEGORY_KEYS: Record<CoachSummaryCategory, string> = {
  cv: 'student.internshipOffers.careerCoach.summary.categories.cv',
  internship: 'student.internshipOffers.careerCoach.summary.categories.internship',
  interview: 'student.internshipOffers.careerCoach.summary.categories.interview',
  career: 'student.internshipOffers.careerCoach.summary.categories.career',
  skills: 'student.internshipOffers.careerCoach.summary.categories.skills',
};

export function useCareerCoachChatSummary(
  sessionId: string,
  messageCount: number,
  isTyping: boolean,
  pinnedSummary: CoachChatSummary | null,
) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState<CoachChatSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const lastLoadedCountRef = useRef(0);

  const displaySummary = pinnedSummary ?? summary;

  const loadSummary = useCallback(
    async (refresh = false) => {
      if (!sessionId) return;
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchCareerCoachSummary(sessionId, refresh);
        setSummary(result);
        lastLoadedCountRef.current = messageCount;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load summary');
      } finally {
        setIsLoading(false);
      }
    },
    [messageCount, sessionId],
  );

  const toggleOpen = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    setSummary(null);
    setError(null);
    lastLoadedCountRef.current = 0;
    setIsOpen(false);
  }, [sessionId]);

  useEffect(() => {
    if (!isOpen || !sessionId || pinnedSummary) return;
    const needsRefresh = !summary || lastLoadedCountRef.current !== messageCount;
    if (needsRefresh && !isTyping) {
      void loadSummary(false);
    }
  }, [isOpen, isTyping, loadSummary, messageCount, pinnedSummary, sessionId, summary]);

  const refresh = useCallback(() => {
    if (pinnedSummary) return;
    void loadSummary(true);
  }, [loadSummary, pinnedSummary]);

  const categoryLabel = useCallback(
    (category: string) => {
      const key = CATEGORY_KEYS[category as CoachSummaryCategory];
      return key ? t(key) : category;
    },
    [t],
  );

  const buildExportInput = useCallback(() => {
    if (!displaySummary?.has_important_content) return null;

    const introKey = pinnedSummary
      ? 'student.internshipOffers.careerCoach.summary.pinnedIntro'
      : 'student.internshipOffers.careerCoach.summary.reportIntro';

    return {
      title: t('student.internshipOffers.careerCoach.summary.title'),
      intro: t(introKey, { count: displaySummary.important_count }),
      sections: buildCareerCoachReportSections(displaySummary.highlights, categoryLabel),
    };
  }, [categoryLabel, displaySummary, pinnedSummary, t]);

  const buildExportText = useCallback(() => {
    if (!displaySummary?.has_important_content) return '';
    return formatSummaryAsPlainText(
      displaySummary,
      t('student.internshipOffers.careerCoach.summary.title'),
      t('student.internshipOffers.careerCoach.summary.reportIntro', {
        count: displaySummary.important_count,
      }),
    );
  }, [displaySummary, t]);

  const copySummary = useCallback(async () => {
    const text = buildExportText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [buildExportText]);

  const downloadSummaryAsWord = useCallback(() => {
    const input = buildExportInput();
    if (!input) return;
    downloadCareerCoachReportWord(input);
  }, [buildExportInput]);

  const downloadSummaryAsPdf = useCallback(async () => {
    const input = buildExportInput();
    if (!input || isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadCareerCoachReportPdf(input);
    } finally {
      setIsDownloading(false);
    }
  }, [buildExportInput, isDownloading]);

  return {
    isOpen,
    summary: displaySummary,
    isLoading: isLoading && !pinnedSummary,
    error,
    copied,
    isDownloading,
    toggleOpen,
    close,
    refresh,
    copySummary,
    downloadSummaryAsWord,
    downloadSummaryAsPdf,
    hasNewContent:
      messageCount > 0 &&
      (Boolean(pinnedSummary) || lastLoadedCountRef.current !== messageCount),
    isPinnedReport: Boolean(pinnedSummary),
  };
}
