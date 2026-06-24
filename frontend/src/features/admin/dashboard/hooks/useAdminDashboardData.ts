import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  adminAlertMetricCounts,
  adminMockData,
  adminPlatformHealthMock,
  STAT_ROUTES,
  USE_ADMIN_DASHBOARD_MOCK,
  type DashboardStatId,
} from '../data/adminMockData';
import { ALERT_METRIC_DEFINITIONS } from '../data/alertAnalyticsMock';
import { useAdminDashboardContext } from '../context/AdminDashboardContext';
import { STAT_COUNT_KEYS } from '../utils/buildAdminDashboardViewModel';

const formatCount = (value: number): string => new Intl.NumberFormat('en-US').format(value);

export const useAdminDashboardData = () => {
  const { t } = useTranslation();
  const { loading, viewModel } = useAdminDashboardContext();
  const { counts, chart, recentActivity, alertMetrics } = viewModel;

  return useMemo(() => {
    const chartData = USE_ADMIN_DASHBOARD_MOCK ? adminMockData.activityChart.data : chart;
    const mockRecentActivity = adminMockData.recentActivity.map((item) => ({
      id: item.id,
      action: t(`admin.dashboard.activity.actions.${item.actionKey}`),
      user: item.user,
      time: t(`admin.dashboard.activity.times.${item.timeKey}`, { count: item.timeCount }),
    }));
    const mockAlertMetrics = ALERT_METRIC_DEFINITIONS.map((def) => ({
      ...def,
      count: adminAlertMetricCounts[def.messageKey] ?? 0,
      message: t(`admin.dashboard.alerts.messages.${def.messageKey}`),
      priorityLabel: t(`admin.dashboard.alerts.priority.${def.priority.toLowerCase()}`),
    }));

    return {
      statsLoading: USE_ADMIN_DASHBOARD_MOCK ? false : loading,
      stats: adminMockData.stats.map((stat) => ({
        ...stat,
        value: USE_ADMIN_DASHBOARD_MOCK
          ? stat.value
          : formatCount(counts[STAT_COUNT_KEYS[stat.id as DashboardStatId]] ?? 0),
        label: t(`admin.dashboard.stats.${stat.id}`),
        route: STAT_ROUTES[stat.id],
      })),
      alerts: adminMockData.alerts.map((alert) => ({
        ...alert,
        message: t(`admin.dashboard.alerts.messages.${alert.messageKey}`),
        priorityLabel: t(`admin.dashboard.alerts.priority.${alert.priority.toLowerCase()}`),
      })),
      alertMetrics: USE_ADMIN_DASHBOARD_MOCK
        ? mockAlertMetrics
        : alertMetrics.map((item) => ({
            ...item,
            message: t(`admin.dashboard.alerts.messages.${item.messageKey}`),
            priorityLabel: t(`admin.dashboard.alerts.priority.${item.priority.toLowerCase()}`),
          })),
      recentActivity: USE_ADMIN_DASHBOARD_MOCK ? mockRecentActivity : recentActivity,
      chartLabels: adminMockData.activityChart.labels.map((key) =>
        t(`admin.dashboard.chart.weekdays.${key}`),
      ),
      chartData,
      chartMaxValue: Math.max(
        10,
        ...chartData.applications,
        ...chartData.documents,
        ...chartData.announcements,
        ...chartData.studentActivity,
      ),
      health: USE_ADMIN_DASHBOARD_MOCK
        ? {
            score: adminPlatformHealthMock.health_score,
            criticalAlerts: adminPlatformHealthMock.critical_alerts,
            studentsAtRisk: adminPlatformHealthMock.students_at_risk,
            activeUsers: adminPlatformHealthMock.active_users,
            riskTrend: adminPlatformHealthMock.risk_trend,
            activityTrend: adminPlatformHealthMock.activity_trend,
          }
        : viewModel.health,
      legend: [
        { key: 'applications' as const, label: t('admin.dashboard.chart.legend.applications'), color: '#06b6d4' },
        { key: 'documents' as const, label: t('admin.dashboard.chart.legend.documents'), color: '#eab308' },
        { key: 'announcements' as const, label: t('admin.dashboard.chart.legend.announcements'), color: '#8b5cf6' },
        { key: 'studentActivity' as const, label: t('admin.dashboard.chart.legend.studentActivity'), color: '#2563eb' },
      ],
    };
  }, [t, loading, counts, chart, recentActivity, alertMetrics, viewModel.health]);
};

export type { DashboardStatId };
