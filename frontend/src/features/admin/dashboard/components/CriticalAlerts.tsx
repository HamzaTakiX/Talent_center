import { CSSProperties, FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DashboardSectionHeader from './DashboardSectionHeader';
import DashboardPanel from '../ui/DashboardPanel';
import CriticalAlertsSkeleton from './CriticalAlertsSkeleton';
import AdminSectionEmptyState from '../../ui/AdminSectionEmptyState';
import { easePremium } from '../ui/animations';
import { computeSeverityVolumes } from '../data/alertAnalyticsMock';
import { useAdminDashboardData } from '../hooks/useAdminDashboardData';

const DONUT_SIZE = 128;
const DONUT_R = 46;
const DONUT_STROKE = 14;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutArc(start: number, end: number) {
  const cx = DONUT_SIZE / 2;
  const cy = DONUT_SIZE / 2;
  const startPt = polar(cx, cy, DONUT_R, end);
  const endPt = polar(cx, cy, DONUT_R, start);
  const large = end - start <= 180 ? 0 : 1;
  return `M ${startPt.x} ${startPt.y} A ${DONUT_R} ${DONUT_R} 0 ${large} 0 ${endPt.x} ${endPt.y}`;
}

const SEVERITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#64748b',
} as const;

const CriticalAlerts: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { alertMetrics, loading } = useAdminDashboardData();

  const activeMetrics = useMemo(
    () => alertMetrics.filter((item) => item.count > 0),
    [alertMetrics],
  );

  const { high, medium, low, total } = useMemo(
    () => computeSeverityVolumes(alertMetrics),
    [alertMetrics],
  );
  const maxMetric = useMemo(
    () => Math.max(...alertMetrics.map((m) => m.count), 1),
    [alertMetrics],
  );

  const donutSegments = useMemo(() => {
    const slices = [
      { key: 'high', value: high, color: SEVERITY_COLORS.high },
      { key: 'medium', value: medium, color: SEVERITY_COLORS.medium },
      { key: 'low', value: low, color: SEVERITY_COLORS.low },
    ].filter((s) => s.value > 0);

    let cursor = 0;
    const sum = slices.reduce((s, x) => s + x.value, 0) || 1;
    return slices.map((slice, index) => {
      const sweep = (slice.value / sum) * 360;
      const start = cursor;
      const end = cursor + sweep;
      cursor = end;
      return {
        ...slice,
        path: donutArc(start, end),
        percent: Math.round((slice.value / sum) * 100),
        index,
      };
    });
  }, [high, medium, low]);

  return (
    <DashboardPanel
      data-admin-search-id="dashboard-alerts"
      className={`admin-section-panel admin-alerts-analytics-panel${loading ? ' admin-section-panel--loading' : ''}`}
      aria-busy={loading}
    >
      {loading ? (
        <CriticalAlertsSkeleton />
      ) : activeMetrics.length === 0 ? (
        <>
          <DashboardSectionHeader
            icon={<AlertTriangle strokeWidth={1.75} aria-hidden />}
            title={t('admin.dashboard.alerts.title')}
            subtitle={t('admin.dashboard.alerts.subtitle')}
          />
          <AdminSectionEmptyState
            variant="inline"
            iconPreset="reports"
            title={t('admin.dashboard.alerts.empty')}
            description={t('admin.dashboard.alerts.emptyDesc')}
          />
        </>
      ) : (
        <motion.div
          className="admin-alerts-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, ease: easePremium }}
        >
          <DashboardSectionHeader
            icon={<AlertTriangle strokeWidth={1.75} aria-hidden />}
            title={t('admin.dashboard.alerts.title')}
            subtitle={t('admin.dashboard.alerts.subtitle')}
            action={
              <span className="admin-alerts-total-badge" aria-label={t('admin.dashboard.alerts.analytics.totalActive')}>
                <span className="admin-alerts-total-badge__value">{activeMetrics.length}</span>
                <span className="admin-alerts-total-badge__label">{t('admin.dashboard.alerts.analytics.active')}</span>
              </span>
            }
          />

          <div className="admin-alerts-analytics-body">
            <div className="admin-alerts-analytics-visual">
              <div className="admin-alerts-analytics-glass" aria-hidden />
              <div className="admin-alerts-analytics-visual-inner">
                <div className="admin-alerts-donut-wrap">
                  <svg
                    viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
                    className="admin-alerts-donut-svg"
                    role="img"
                    aria-label={t('admin.dashboard.alerts.analytics.severityMix')}
                  >
                    <circle
                      cx={DONUT_SIZE / 2}
                      cy={DONUT_SIZE / 2}
                      r={DONUT_R}
                      fill="none"
                      stroke="var(--admin-border)"
                      strokeWidth={DONUT_STROKE}
                      opacity={0.45}
                    />
                    {donutSegments.map((seg) =>
                      seg.path ? (
                        <motion.path
                          key={seg.key}
                          d={seg.path}
                          fill="none"
                          stroke={seg.color}
                          strokeWidth={DONUT_STROKE}
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.55, delay: 0.05 + seg.index * 0.06, ease: easePremium }}
                        />
                      ) : null
                    )}
                  </svg>
                  <div className="admin-alerts-donut-center">
                    <span className="admin-alerts-donut-center__value">{total}</span>
                    <span className="admin-alerts-donut-center__label">{t('admin.dashboard.alerts.analytics.items')}</span>
                  </div>
                </div>

                <ul className="admin-alerts-severity-legend">
                  {[
                    { key: 'high', label: t('admin.dashboard.alerts.priority.high'), value: high, color: SEVERITY_COLORS.high },
                    { key: 'medium', label: t('admin.dashboard.alerts.priority.medium'), value: medium, color: SEVERITY_COLORS.medium },
                    { key: 'low', label: t('admin.dashboard.alerts.analytics.low'), value: low, color: SEVERITY_COLORS.low },
                  ].map((item) => (
                    <li key={item.key} className="admin-alerts-severity-legend__item">
                      <span className="admin-alerts-severity-legend__bar-wrap" aria-hidden>
                        <span
                          className="admin-alerts-severity-legend__bar"
                          style={{
                            width: total > 0 ? `${Math.max((item.value / total) * 100, item.value > 0 ? 8 : 0)}%` : '0%',
                            background: item.color,
                          }}
                        />
                      </span>
                      <span className="admin-alerts-severity-legend__dot" style={{ background: item.color }} aria-hidden />
                      <span className="admin-alerts-severity-legend__label">{item.label}</span>
                      <span className="admin-alerts-severity-legend__value">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <ul className="admin-alerts-metric-grid">
              {activeMetrics.map((item) => {
                const Icon = item.Icon;
                const toneStyle = {
                  '--alert-accent': item.accent,
                  '--alert-accent-bg': item.accentBg,
                } as CSSProperties;
                const share = Math.round((item.count / maxMetric) * 100);

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="admin-alerts-metric-card"
                      style={toneStyle}
                      onClick={() => navigate(item.route)}
                    >
                      <span className="admin-alerts-metric-card__glow" aria-hidden />
                      <span className="admin-alerts-metric-card__bar" aria-hidden />
                      <span className="admin-alerts-metric-card__top">
                        <span className={`admin-alerts-metric-card__icon admin-alerts-metric-card__icon--${item.priority.toLowerCase()}`}>
                          <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                        </span>
                        <span
                          className={`admin-alerts-metric-card__priority admin-alerts-metric-card__priority--${item.priority.toLowerCase()}`}
                        >
                          {item.priorityLabel}
                        </span>
                      </span>
                      <span className="admin-alerts-metric-card__count">{item.count}</span>
                      <span className="admin-alerts-metric-card__message">{item.message}</span>
                      <span className="admin-alerts-metric-card__progress" aria-hidden>
                        <span className="admin-alerts-metric-card__progress-fill" style={{ width: `${share}%` }} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </motion.div>
      )}
    </DashboardPanel>
  );
};

export default CriticalAlerts;
