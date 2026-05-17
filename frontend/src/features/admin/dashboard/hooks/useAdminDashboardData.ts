import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { adminMockData, STAT_ROUTES, type DashboardStatId } from '../data/adminMockData';

export const useAdminDashboardData = () => {
  const { t } = useTranslation();

  return useMemo(
    () => ({
      stats: adminMockData.stats.map((stat) => ({
        ...stat,
        label: t(`admin.dashboard.stats.${stat.id}`),
        route: STAT_ROUTES[stat.id],
      })),
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
    [t]
  );
};

export type { DashboardStatId };
