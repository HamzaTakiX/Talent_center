import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminHistoryApi } from '../../../admin/api/history';
import { parseAdminApiError } from '../../../admin/shared/utils/parseAdminApiError';
import { formatRelativeTime } from '../../../admin/main_history/utils/formatRelativeTime';
import { fetchCvIntelligenceDashboardSafe } from '../../../cv/api/cvIntelligenceApi';
import { stageApi } from '../../../shared/api/stageApi';
import type { StudentDashboardViewModel } from '../types/studentDashboardData';
import { buildStudentDashboardViewModel } from '../utils/buildStudentDashboardViewModel';
import {
  studentActivityChartData,
  studentDashboardStats,
  studentHeroWidgetData,
  studentProgressMetrics,
} from '../data/studentDashboardMock';
import type { InternshipJourneyDashboard } from '../../internship_offers/types/journeyTypes';
import type { CvAnalysisDashboardData } from '../../internship_offers/CV_Analyse/types/cvAnalysisDashboard';
import type { HistoryEventDto } from '../../../admin/api/history';

const EMPTY_VIEW: StudentDashboardViewModel = {
  stats: studentDashboardStats.map((s) => ({ ...s, value: '0' })),
  hero: {
    profile: {
      ...studentHeroWidgetData.profile,
      percent: 0,
      completedSections: 0,
      sparkline: [0, 0, 0, 0, 0, 0, 0],
      checklist: studentHeroWidgetData.profile.checklist.map((item) => ({ ...item })),
    },
    cv: {
      ...studentHeroWidgetData.cv,
      percent: 0,
      segments: studentHeroWidgetData.cv.segments.map((s) => ({ ...s, value: 0 })),
      sparkline: [0, 0, 0, 0, 0, 0, 0],
    },
    readiness: {
      ...studentHeroWidgetData.readiness,
      percent: 0,
      missingCount: 0,
      recruiterMatch: 0,
      stages: [...studentHeroWidgetData.readiness.stages],
      requirements: studentHeroWidgetData.readiness.requirements.map((r) => ({ ...r })),
    },
    applications: {
      ...studentHeroWidgetData.applications,
      weekTotal: 0,
      responseRate: 0,
      ratio: { accepted: 0, pending: 0, rejected: 0 },
      sparkline: [0, 0, 0, 0, 0, 0, 0],
    },
  },
  chart: {
    applications: [...studentActivityChartData.applications],
    profileViews: [...studentActivityChartData.profileViews],
    messages: [...studentActivityChartData.messages],
  },
  alerts: [],
  progress: studentProgressMetrics.map((m) => ({ ...m, percent: 0 })),
  recentActivity: [],
};

export function useStudentDashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [journey, setJourney] = useState<InternshipJourneyDashboard | null>(null);
  const [historyEvents, setHistoryEvents] = useState<HistoryEventDto[]>([]);
  const [cvDashboard, setCvDashboard] = useState<CvAnalysisDashboardData | null>(null);

  const formatTime = useCallback(
    (iso: string) =>
      formatRelativeTime(iso, Date.now(), (key, opts) => t(key, opts ?? {})),
    [t],
  );

  const translateAction = useCallback(
    (titleKey: string, offerTitle?: string) =>
      t(`student.internshipOffers.journey.actions.${titleKey}`, {
        offer: offerTitle ?? '',
        defaultValue: titleKey,
      }),
    [t],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [journeyData, historyCenter, cvResult] = await Promise.all([
        stageApi.journeyDashboard(),
        adminHistoryApi.center({ page_size: 50 }),
        fetchCvIntelligenceDashboardSafe(),
      ]);

      setJourney(journeyData);
      setHistoryEvents(historyCenter.timeline?.items ?? []);
      setCvDashboard(cvResult.ok ? cvResult.response.dashboard : null);
    } catch (err) {
      setError(parseAdminApiError(err, 'dashboard_load_failed').message);
      setJourney(null);
      setHistoryEvents([]);
      setCvDashboard(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const data = useMemo<StudentDashboardViewModel>(() => {
    if (!journey) return EMPTY_VIEW;
    return buildStudentDashboardViewModel({
      journey,
      historyEvents,
      cvDashboard,
      formatRelativeTime: formatTime,
      translateAction,
    });
  }, [journey, historyEvents, cvDashboard, formatTime, translateAction]);

  return { data, loading, error, refresh };
}
