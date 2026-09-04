import { CSSProperties, FunctionComponent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, FileEdit, User, Users, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AdminEncadrantRow } from '../../api/types';
import { easePremium } from '../../dashboard/ui/animations';
import { useTranslatedStatChart } from '../../i18n/useTranslatedStatChart';
import { AdminChartDonutSkeleton, AdminKpiStripSkeleton } from '../../ui/AdminSectionSkeleton';
import { ENCADRANT_CARD_ROUTES } from '../data/encadrantsMockData';
import { ENCADRANT_REPORT_FILTER_ROUTES } from '../reports/data/encadrantReportCardRoutes';
import { computeEncadrantReportKpiStats } from '../shared/utils/encadrantReportKpiStats';
import { useEncadrantReports } from '../reports/hooks/useEncadrantReports';
import { buildDepartmentDonut } from '../encadrant_cards/shared/utils/encadrantsSubpageChartData';
import type { EncadrantDashboardStats } from '../encadrant_cards/shared/utils/encadrantStats';

interface EncadrantsSummaryGridProps {
  rows: AdminEncadrantRow[];
  loading?: boolean;
  encadrantStats?: EncadrantDashboardStats | null;
  chartLoading?: boolean;
}

interface EncadrantKpiCardItem {
  key: string;
  label: string;
  value: string;
  badge: string;
  Icon: typeof User;
  accent: string;
  accentBg: string;
  piePercent?: number;
  route: string;
}

const EncadrantsSummaryGrid: FunctionComponent<EncadrantsSummaryGridProps> = ({
  rows,
  loading = false,
  encadrantStats = null,
  chartLoading = false,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { rows: reportRows, loading: reportsLoading } = useEncadrantReports();
  const chartConfig = useTranslatedStatChart('encadrants-department-load');
  const othersLabel = t('admin.charts.encadrants-department-load.segments.others', {
    defaultValue: 'Autres',
  });

  const filiereSegments = useMemo(
    () => buildDepartmentDonut(rows, encadrantStats?.total ?? rows.length, othersLabel),
    [rows, encadrantStats?.total, othersLabel],
  );

  const filierePie = useMemo(() => {
    const total = encadrantStats?.total ?? rows.length;
    const segmentSum = filiereSegments.reduce((sum, segment) => sum + segment.value, 0);
    const basis = segmentSum > 0 ? segmentSum : 1;
    let cursor = 0;
    const stops = filiereSegments.map((segment) => {
      const start = cursor;
      cursor += (segment.value / basis) * 100;
      return `${segment.color} ${start}% ${cursor}%`;
    });
    const remainder =
      cursor < 99.5
        ? `, color-mix(in srgb, var(--admin-text-muted) 28%, var(--admin-surface-inset)) ${cursor}% 100%`
        : '';

    return {
      total,
      gradient:
        filiereSegments.length > 0
          ? `conic-gradient(from -90deg, ${stops.join(', ')}${remainder})`
          : undefined,
      legend: filiereSegments.map((segment) => ({
        key: segment.key,
        color: segment.color,
        label: segment.label.split(' — ')[0] ?? segment.label,
        count: segment.value,
        percent: total > 0 ? Math.round((segment.value / total) * 100) : 0,
      })),
    };
  }, [encadrantStats?.total, filiereSegments, rows.length]);

  const stats = useMemo<EncadrantKpiCardItem[]>(() => {
    const total = rows.length;
    const totalAssigned = rows.reduce((sum, r) => sum + r.current_students, 0);
    const withStudents = rows.filter((r) => r.current_students > 0).length;
    const reportTotal = computeEncadrantReportKpiStats(reportRows).total;
    const ratioFromTotal = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0);

    return [
      {
        key: 'total',
        label: t('admin.kpi.encadrants.total'),
        value: loading ? '—' : String(total),
        badge: `${rows.filter((r) => r.is_encadrant_active).length} actifs`,
        Icon: User,
        accent: '#a855f7',
        accentBg: 'rgba(168, 85, 247, 0.16)',
        route: ENCADRANT_CARD_ROUTES[0],
      },
      {
        key: 'assigned',
        label: t('admin.kpi.encadrants.assigned'),
        value: loading ? '—' : String(totalAssigned),
        badge: `${ratioFromTotal(withStudents)}% avec étudiants`,
        Icon: Users,
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.16)',
        piePercent: ratioFromTotal(withStudents),
        route: ENCADRANT_CARD_ROUTES[1],
      },
      {
        key: 'meetings',
        label: t('admin.kpi.encadrants.meetings'),
        value: loading ? '—' : String(withStudents),
        badge: `${ratioFromTotal(withStudents)}% du total`,
        Icon: Video,
        accent: '#22c55e',
        accentBg: 'rgba(34, 197, 94, 0.16)',
        piePercent: ratioFromTotal(withStudents),
        route: ENCADRANT_CARD_ROUTES[2],
      },
      {
        key: 'totalReports',
        label: t('admin.kpi.encadrants.totalReports'),
        value: loading || reportsLoading ? '—' : String(reportTotal),
        badge: 'Rapports soumis',
        Icon: FileEdit,
        accent: '#f97316',
        accentBg: 'rgba(249, 115, 22, 0.16)',
        route: ENCADRANT_REPORT_FILTER_ROUTES.all,
      },
    ];
  }, [rows, loading, reportRows, reportsLoading, t]);

  if (loading && rows.length === 0) {
    return <AdminKpiStripSkeleton count={4} />;
  }

  return (
    <div className="admin-students-stats-grid admin-encadrants-stats-grid">
      {stats.map((card, index) => (
        <motion.article
          key={card.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.4, ease: easePremium }}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`admin-students-stat-card cursor-pointer${card.piePercent != null ? ' admin-students-stat-card--rate' : ''}`}
          style={
            {
              '--student-stat-accent': card.accent,
              '--student-stat-accent-bg': card.accentBg,
            } as CSSProperties
          }
          onClick={() => navigate(card.route)}
        >
          <div className="admin-students-stat-card__body">
            <div className="admin-students-stat-card__head">
              <span className="admin-students-stat-card__icon">
                <card.Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
              </span>
              <p className="admin-students-stat-card__title">{card.label}</p>
            </div>

            <p className="admin-students-stat-card__value">{card.value}</p>
            <span className="admin-students-stat-card__badge">{card.badge}</span>
          </div>

          {card.piePercent != null ? (
            <div
              className="admin-students-stat-card__pie"
              style={
                {
                  '--student-stat-pie': card.piePercent,
                } as CSSProperties
              }
              role="img"
              aria-label={`${card.label} ${card.piePercent}%`}
            >
              <span className="admin-students-stat-card__pie-inner">{card.piePercent}%</span>
            </div>
          ) : null}
        </motion.article>
      ))}

      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: easePremium }}
        whileHover={{ scale: 1.02, y: -2 }}
        className="admin-students-stat-card admin-students-stat-card--rate admin-encadrants-stats-grid__chart"
        style={
          {
            '--student-stat-accent': '#8b5cf6',
            '--student-stat-accent-bg': 'rgba(139, 92, 246, 0.16)',
          } as CSSProperties
        }
        aria-labelledby="encadrants-filiere-chart-heading"
        aria-busy={chartLoading}
      >
        <div className="admin-students-stat-card__body">
          <div className="admin-students-stat-card__head">
            <span className="admin-students-stat-card__icon">
              <BarChart3 className="h-5 w-5" strokeWidth={1.8} aria-hidden />
            </span>
            <p id="encadrants-filiere-chart-heading" className="admin-students-stat-card__title">
              {chartConfig?.title ??
                t('admin.charts.encadrants-department-load.title', {
                  defaultValue: 'Répartition par filière',
                })}
            </p>
          </div>
          <div className="admin-encadrants-stats-grid__chart-meta">
            <span className="admin-students-stat-card__badge">
              {chartConfig?.subtitle ??
                t('admin.charts.encadrants-department-load.subtitle', {
                  defaultValue: 'Encadrants par filière sur le total',
                })}
            </span>
            {filierePie.legend.length > 0 ? (
              <ul className="admin-encadrants-stats-grid__chart-legend">
                {filierePie.legend.map((item) => (
                  <li key={item.key}>
                    <span style={{ backgroundColor: item.color, color: item.color }} />
                    <em>{item.label}</em>
                    <strong>
                      {item.count} ({item.percent}%)
                    </strong>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="admin-encadrants-stats-grid__chart-body">
          {chartLoading && !encadrantStats ? (
            <AdminChartDonutSkeleton />
          ) : (
            <div
              className="admin-students-stat-card__pie admin-encadrants-stats-grid__chart-pie"
              style={
                {
                  ...(filierePie.gradient
                    ? { '--student-stat-pie-gradient': filierePie.gradient }
                    : {}),
                  '--student-stat-pie': filierePie.legend[0]?.percent ?? 0,
                } as CSSProperties
              }
              role="img"
              aria-label={
                chartConfig?.ariaLabel ??
                t('admin.charts.encadrants-department-load.ariaLabel', {
                  defaultValue: 'Encadrants par filière sur le total',
                })
              }
            >
              <span className="admin-students-stat-card__pie-inner">
                {loading ? '—' : filierePie.total}
              </span>
            </div>
          )}
        </div>
      </motion.article>
    </div>
  );
};

export default EncadrantsSummaryGrid;
