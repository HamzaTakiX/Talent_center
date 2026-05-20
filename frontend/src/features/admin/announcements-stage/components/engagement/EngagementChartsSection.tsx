import { FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AdminBarChart from '../../../ui/charts/AdminBarChart';
import AdminDonutChart from '../../../ui/charts/AdminDonutChart';
import AdminLineChart from '../../../ui/charts/AdminLineChart';
import { AdminChartDonutSkeleton } from '../../../ui/AdminSectionSkeleton';
import { fadeInUp } from '../../../dashboard/ui/animations';
import AnnouncementsPanelEmpty from '../AnnouncementsPanelEmpty';
import type { EngagementDashboardData } from '../../types/engagementDashboard';

interface Props {
  data: EngagementDashboardData;
  loading?: boolean;
}

const CHART_COLORS = ['#2563eb', '#3b82f6', '#0891b2', '#60a5fa', '#1d4ed8', '#16a34a'];

const EngagementChartsSection: FunctionComponent<Props> = ({ data, loading }) => {
  const { t } = useTranslation();
  const P = 'admin.announcementsModule.engagement.charts';
  const { trends, typeDistribution, funnel, audienceSegments, heatmap } = data;

  const hasTrendData = trends.views.some((v) => v > 0);
  const hasTypes = typeDistribution.length > 0;
  const hasAudience = audienceSegments.some((s) => s.value > 0);

  const donutSegments = useMemo(
    () =>
      typeDistribution.map((d, i) => ({
        key: d.code,
        label: d.name,
        value: d.count,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })),
    [typeDistribution],
  );

  const audienceLabels = audienceSegments.map((s) => s.label);
  const audienceSeries = useMemo(
    () => [
      {
        key: 'engagement',
        label: t(`${P}.views`),
        color: '#2563eb',
        values: audienceSegments.map((s) => s.value),
      },
    ],
    [audienceSegments, t, P],
  );

  const lineSeries = useMemo(
    () => [
      { key: 'views', label: t(`${P}.views`), color: '#2563eb', values: trends.views },
      { key: 'clicks', label: t(`${P}.clicks`), color: '#0891b2', values: trends.clicks },
      { key: 'saves', label: t(`${P}.saves`), color: '#16a34a', values: trends.saves },
    ],
    [trends, t, P],
  );

  const maxHeat = heatmap.max || 1;

  return (
    <div className="admin-eng-charts">
      <motion.section {...fadeInUp} className="admin-eng-chart-panel admin-eng-chart-panel--wide">
        <h3 className="admin-ann-panel-title">{t(`${P}.trendsTitle`)}</h3>
        <motion.div className="admin-eng-chart-panel__body" {...fadeInUp}>
          {loading ? (
            <div className="admin-eng-chart-placeholder" aria-hidden />
          ) : hasTrendData ? (
            <AdminLineChart
              labels={trends.labels}
              series={lineSeries}
              ariaLabel={t(`${P}.trendsAria`)}
            />
          ) : (
            <AnnouncementsPanelEmpty variant="chart" />
          )}
        </motion.div>
      </motion.section>

      <div className="admin-eng-charts__row">
        <motion.section {...fadeInUp} className="admin-eng-chart-panel">
          <h3 className="admin-ann-panel-title">{t(`${P}.funnelTitle`)}</h3>
          <motion.div className="admin-eng-funnel" {...fadeInUp}>
            {funnel.map((stage, i) => (
              <div key={stage.key} className="admin-eng-funnel__stage">
                <motion.div className="admin-eng-funnel__head">
                  <span>{t(`admin.announcementsModule.engagement.funnel.${stage.key}`)}</span>
                  <strong>{stage.value.toLocaleString()}</strong>
                </motion.div>
                <div className="admin-eng-funnel__track">
                  <motion.div
                    className="admin-eng-funnel__fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${stage.rate}%` }}
                    transition={{ duration: 0.55, delay: i * 0.08 }}
                    style={{ opacity: 1 - i * 0.12 }}
                  />
                </div>
                <span className="admin-eng-funnel__rate">{stage.rate}%</span>
              </div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section {...fadeInUp} className="admin-eng-chart-panel">
          <h3 className="admin-ann-panel-title">{t(`${P}.typeMixTitle`)}</h3>
          <motion.div className="admin-eng-chart-panel__body admin-eng-chart-panel__body--donut" {...fadeInUp}>
            {loading ? (
              <AdminChartDonutSkeleton legendItems={4} />
            ) : hasTypes ? (
              <AdminDonutChart segments={donutSegments} ariaLabel={t(`${P}.typeMixAria`)} />
            ) : (
              <AnnouncementsPanelEmpty variant="chart" />
            )}
          </motion.div>
        </motion.section>
      </div>

      <motion.div className="admin-eng-charts__row" {...fadeInUp}>
        <motion.section className="admin-eng-chart-panel">
          <h3 className="admin-ann-panel-title">{t(`${P}.audienceTitle`)}</h3>
          <motion.div className="admin-eng-chart-panel__body" {...fadeInUp}>
            {loading ? (
              <motion.div className="admin-eng-chart-placeholder" aria-hidden />
            ) : hasAudience ? (
              <AdminBarChart
                labels={audienceLabels}
                series={audienceSeries}
                ariaLabel={t(`${P}.audienceAria`)}
              />
            ) : (
              <AnnouncementsPanelEmpty variant="chart" />
            )}
          </motion.div>
        </motion.section>

        <motion.section className="admin-eng-chart-panel">
          <h3 className="admin-ann-panel-title">{t(`${P}.heatmapTitle`)}</h3>
          <motion.div
            className="admin-eng-heatmap"
            role="img"
            aria-label={t(`${P}.heatmapAria`)}
            {...fadeInUp}
          >
            <div className="admin-eng-heatmap__labels-y" aria-hidden>
              {(['1', '2', '3', '4', '5', '6', '7'] as const).map((wd) => (
                <span key={wd}>{t(`${P}.weekday.${wd}`)}</span>
              ))}
            </div>
            <div className="admin-eng-heatmap__grid">
              {heatmap.cells.map((cell) => {
                const intensity = cell.value / maxHeat;
                return (
                  <motion.div
                    key={`${cell.weekday}-${cell.bucket}`}
                    className="admin-eng-heatmap__cell"
                    style={{
                      opacity: 0.25 + intensity * 0.75,
                      background: `color-mix(in srgb, var(--admin-brand) ${Math.round(intensity * 85)}%, transparent)`,
                    }}
                    title={`${t(`${P}.weekday.${String(cell.weekday)}`)} ${t(`${P}.timeBlock.${String(cell.bucket)}`)}`}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.25 + intensity * 0.75 }}
                    transition={{ duration: 0.25 }}
                  />
                );
              })}
            </div>
            <div className="admin-eng-heatmap__labels-x" aria-hidden>
              {(['0', '1', '2', '3'] as const).map((b) => (
                <span key={b}>{t(`${P}.timeBlock.${b}`)}</span>
              ))}
            </div>
          </motion.div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default EngagementChartsSection;
