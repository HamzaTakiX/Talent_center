import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { adminMockData, STAT_ROUTES, type DashboardStatId } from '../data/adminMockData';
import { useAdminDashboardLiveCounts } from './useAdminDashboardLiveCounts';

const formatCount = (value: number | null, fallback: string): string => {
  if (value == null) return fallback;
  return new Intl.NumberFormat('en-US').format(value);
};

const LIVE_STAT_IDS = new Set<DashboardStatId>([
  'totalStudents',
  'totalEncadrants',
  'totalAdmins',
  'studentsWithoutInternship',
]);

export const useAdminDashboardData = () => {
  const { t } = useTranslation();
  const liveCounts = useAdminDashboardLiveCounts();

  const liveValueById: Partial<Record<DashboardStatId, number | null>> = {
    totalStudents: liveCounts.totalStudents,
    totalEncadrants: liveCounts.totalEncadrants,
    totalAdmins: liveCounts.totalAdmins,
    studentsWithoutInternship: liveCounts.studentsWithoutInternship,
  };

  return useMemo(
    () => ({
      statsLoading: liveCounts.loading,
      stats: adminMockData.stats.map((stat) => {
        const liveValue = liveValueById[stat.id];
        const value =
          LIVE_STAT_IDS.has(stat.id) && liveValue != null
            ? formatCount(liveValue, stat.value)
            : stat.value;
        return {
          ...stat,
          value,
          label: t(`admin.dashboard.stats.${stat.id}`),
          route: STAT_ROUTES[stat.id],
        };
      }),
      alerts: adminMockData.alerts.map((alert) => ({
        ...alert,
        message: t(`admin.dashboard.alerts.messages.${alert.messageKey}`),
        priorityLabel: t(`admin.dashboard.alerts.priority.${alert.priority.toLowerCase()}`),
      })),
      recentActivity: adminMockData.recentActivity.map((item) => ({
        ...item,
        action: t(`admin.dashboard.activity.actions.${item.actionKey}`),
        time:
          item.timeKey === 'yesterday'
            ? t('admin.dashboard.activity.times.yesterday')
            : t(`admin.dashboard.activity.times.${item.timeKey}`, { count: item.timeCount ?? 0 }),
      })),
      chartLabels: adminMockData.activityChart.labels.map((key) =>
        t(`admin.dashboard.chart.weekdays.${key}`)
      ),
      chartData: adminMockData.activityChart.data,
      legend: [
        { key: 'applications' as const, label: t('admin.dashboard.chart.legend.applications'), color: '#06b6d4' },
        { key: 'documents' as const, label: t('admin.dashboard.chart.legend.documents'), color: '#eab308' },
        { key: 'announcements' as const, label: t('admin.dashboard.chart.legend.announcements'), color: '#8b5cf6' },
        { key: 'studentActivity' as const, label: t('admin.dashboard.chart.legend.studentActivity'), color: '#2563eb' },
      ],
    }),
    [t, liveCounts.loading, liveCounts.totalStudents, liveCounts.totalEncadrants, liveCounts.totalAdmins, liveCounts.studentsWithoutInternship]
  );
};

export type { DashboardStatId };
