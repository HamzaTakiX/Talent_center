import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { adminMockData, STAT_ROUTES, type DashboardStatId } from '../data/adminMockData';
import { useAdminDashboardContext } from '../context/AdminDashboardContext';
import { STAT_COUNT_KEYS } from '../utils/buildAdminDashboardViewModel';

const formatCount = (value: number): string => new Intl.NumberFormat('en-US').format(value);

export const useAdminDashboardData = () => {
  const { t } = useTranslation();
  const { loading, viewModel } = useAdminDashboardContext();
  const { counts, chart, recentActivity, alertMetrics } = viewModel;

  return useMemo(
    () => ({
      loading,
      stats: adminMockData.stats.map((stat) => ({
        ...stat,
        value: formatCount(counts[STAT_COUNT_KEYS[stat.id as DashboardStatId]] ?? 0),
        label: t(`admin.dashboard.stats.${stat.id}`),
        route: STAT_ROUTES[stat.id],
      })),
      alertMetrics: alertMetrics.map((item) => ({
        ...item,
        message: t(`admin.dashboard.alerts.messages.${item.messageKey}`, { count: item.count }),
        priorityLabel: t(`admin.dashboard.alerts.priority.${item.priority.toLowerCase()}`),
      })),
      recentActivity,
      chartLabels: adminMockData.activityChart.labels.map((key) =>
        t(`admin.dashboard.chart.weekdays.${key}`),
      ),
      chartData: chart,
      chartMaxValue: Math.max(
        10,
        ...chart.applications,
        ...chart.documents,
        ...chart.announcements,
        ...chart.studentActivity,
      ),
      health: viewModel.health,
      legend: [
        { key: 'applications' as const, label: t('admin.dashboard.chart.legend.applications'), color: '#06b6d4' },
        { key: 'documents' as const, label: t('admin.dashboard.chart.legend.documents'), color: '#eab308' },
        { key: 'announcements' as const, label: t('admin.dashboard.chart.legend.announcements'), color: '#8b5cf6' },
        { key: 'studentActivity' as const, label: t('admin.dashboard.chart.legend.studentActivity'), color: '#2563eb' },
      ],
    }),
    [t, loading, counts, chart, recentActivity, alertMetrics, viewModel.health],
  );
};

export type { DashboardStatId };
