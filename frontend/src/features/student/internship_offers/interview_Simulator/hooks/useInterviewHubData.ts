import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchInterviewHubStats,
  getInterviewSessionDetail,
  listInterviewSessions,
} from '../../api/offerAiCoachApi';
import type { InterviewHubStats, InterviewSimulationReport } from '../../types/offerAiCoach';
import type { AnalyticsMetric, InterviewHistoryRow } from '../types/interviewSimulatorDashboard';
import { mapHubStatsToAnalytics, mapSessionListItemToHistoryRow } from '../utils/mapInterviewHubData';

export function useInterviewHubData() {
  const { i18n } = useTranslation();
  const locale = i18n.language?.startsWith('fr') ? 'fr-FR' : 'en-US';

  const [historyRows, setHistoryRows] = useState<InterviewHistoryRow[]>([]);
  const [hubStats, setHubStats] = useState<InterviewHubStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<InterviewSimulationReport | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sessions, stats] = await Promise.all([
        listInterviewSessions(),
        fetchInterviewHubStats(),
      ]);
      setHistoryRows(sessions.map((item) => mapSessionListItemToHistoryRow(item, locale)));
      setHubStats(stats);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load interview data.';
      setError(message);
      setHistoryRows([]);
      setHubStats(null);
    } finally {
      setIsLoading(false);
      setHasLoadedOnce(true);
    }
  }, [locale]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const analytics = useMemo(() => mapHubStatsToAnalytics(hubStats), [hubStats]);
  const hasHistory = (hubStats?.session_count ?? 0) > 0 || historyRows.length > 0;
  const completedCount = hubStats?.completed_count ?? 0;
  const isInitialLoad = isLoading && !hasLoadedOnce;

  const openReportForSession = useCallback(async (sessionUuid: string) => {
    setReportModalOpen(true);
    setReportLoading(true);
    setSelectedReport(null);
    try {
      const detail = await getInterviewSessionDetail(sessionUuid);
      if (detail.report && Object.keys(detail.report).length > 0) {
        setSelectedReport(detail.report);
        return;
      }
      if (detail.final_evaluation) {
        const fe = detail.final_evaluation;
        setSelectedReport({
          overall_score: fe.overall_score ?? 0,
          readiness_key: fe.interview_readiness ?? 'needs_review',
          readiness_text: fe.interview_readiness ?? '',
          role_label: '',
          categories: [],
          speech_metrics: [],
          strengths: fe.strengths ?? [],
          weaknesses: fe.weaknesses ?? [],
          missing_skills: fe.missing_skills ?? [],
          recommendations: fe.improvement_recommendations ?? [],
          timeline: (detail.turns ?? []).map((turn, index) => ({
            order: turn.order ?? index + 1,
            question: turn.question,
            answer: turn.answer,
            score: turn.score ?? null,
            strengths: turn.strengths ?? [],
            weaknesses: turn.weaknesses ?? [],
            ideal_answer: turn.ideal_answer ?? '',
          })),
          communication_score: fe.communication_score ?? 0,
          technical_score: fe.technical_score ?? 0,
          confidence_score: fe.confidence_score ?? 0,
          professionalism_score: fe.professionalism_score ?? 0,
          problem_solving_score: fe.problem_solving_score ?? 0,
          answers_analyzed: (detail.turns ?? []).filter((t) => t.answer?.trim()).length,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load report.';
      setError(message);
      setReportModalOpen(false);
    } finally {
      setReportLoading(false);
    }
  }, []);

  const openLatestReport = useCallback(async () => {
    const latestWithReport = historyRows.find((row) => row.hasReport && row.score > 0);
    if (!latestWithReport) return;
    await openReportForSession(latestWithReport.sessionUuid);
  }, [historyRows, openReportForSession]);

  const closeReportModal = useCallback(() => {
    setReportModalOpen(false);
    setSelectedReport(null);
    setReportLoading(false);
  }, []);

  return {
    historyRows,
    hubStats,
    analytics,
    hasHistory,
    completedCount,
    isLoading,
    isInitialLoad,
    error,
    refresh,
    reportModalOpen,
    reportLoading,
    selectedReport,
    openReportForSession,
    openLatestReport,
    closeReportModal,
  };
}

export type InterviewHubAnalytics = {
  avgOverall: number;
  avgPreparation: number;
  metrics: AnalyticsMetric[];
};
