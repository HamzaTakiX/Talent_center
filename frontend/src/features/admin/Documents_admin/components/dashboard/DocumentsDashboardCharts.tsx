import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AdminDonutChart from '../../../ui/charts/AdminDonutChart';
import { AdminChartDonutSkeleton } from '../../../ui/AdminSectionSkeleton';
import DocumentsSectionEmpty from '../DocumentsSectionEmpty';
import DocumentsSectionHeader from '../DocumentsSectionHeader';
import {
  getRejectionChartColor,
  getStatusChartColor,
} from '../../constants/documentsChartPalette';
import type { DocumentsDashboardData } from '../../types';

interface Props {
  data: DocumentsDashboardData;
  loading?: boolean;
}

const DocumentsDashboardCharts: FunctionComponent<Props> = ({ data, loading }) => {
  const { t } = useTranslation();

  const statusSegments = data.statusDistribution.map((s) => ({
    key: s.status,
    label: t(`admin.documentsModule.status.${s.status}`),
    value: s.count,
    color: getStatusChartColor(s.status),
  }));

  const rejectionSegments = data.rejectionCauses.map((r) => ({
    key: r.cause,
    label: t(`admin.documentsModule.rejectionCauses.${r.cause}`),
    value: r.count,
    color: getRejectionChartColor(r.cause),
  }));

  const hasStatus = statusSegments.some((s) => s.value > 0);
  const hasRejections = rejectionSegments.some((s) => s.value > 0);
  const hasOccupancy = data.reservationOccupancy.some((s) => s.percent > 0);

  return (
    <section className="admin-doc-analytics" aria-label={t('admin.documentsModule.analytics.title')}>
      <DocumentsSectionHeader
        variant="analytics"
        title={t('admin.documentsModule.analytics.title')}
        subtitle={t('admin.documentsModule.analytics.subtitle')}
        loading={loading}
      />

      <div className="admin-doc-charts-grid">
        <article className="admin-doc-chart-card">
          <h3 className="admin-doc-chart-card__title">{t('admin.documentsModule.chart.statusMix')}</h3>
          <div className="admin-doc-chart-card__body">
            {loading ? (
              <AdminChartDonutSkeleton legendItems={4} />
            ) : hasStatus ? (
              <AdminDonutChart
                segments={statusSegments}
                ariaLabel={t('admin.documentsModule.chart.statusMix')}
                premiumGradients
              />
            ) : (
              <DocumentsSectionEmpty section="statusMix" variant="compact" />
            )}
          </div>
        </article>

        <article className="admin-doc-chart-card">
          <h3 className="admin-doc-chart-card__title">
            {t('admin.documentsModule.chart.rejectionCauses')}
          </h3>
          <div className="admin-doc-chart-card__body">
            {loading ? (
              <AdminChartDonutSkeleton legendItems={3} />
            ) : hasRejections ? (
              <AdminDonutChart
                segments={rejectionSegments}
                ariaLabel={t('admin.documentsModule.chart.rejectionCauses')}
                premiumGradients
              />
            ) : (
              <DocumentsSectionEmpty section="rejectionCauses" variant="compact" />
            )}
          </div>
        </article>

        <article className="admin-doc-chart-card admin-doc-chart-card--wide">
          <h3 className="admin-doc-chart-card__title">
            {t('admin.documentsModule.chart.reservationOccupancy')}
          </h3>
          <div className="admin-doc-chart-card__body admin-doc-chart-card__body--bars">
            {loading ? (
              <div className="admin-doc-occupancy-skeleton" aria-hidden>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="admin-doc-occupancy-skeleton__row admin-shimmer" />
                ))}
              </div>
            ) : hasOccupancy ? (
              <motion.div className="admin-doc-occupancy-bars">
                {data.reservationOccupancy.map((slot) => (
                  <div key={slot.hour} className="admin-doc-occupancy-bar">
                    <span className="admin-doc-occupancy-bar__label">{slot.hour}</span>
                    <div className="admin-doc-occupancy-bar__track">
                      <motion.div
                        className="admin-doc-occupancy-bar__fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${slot.percent}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                    <span className="admin-doc-occupancy-bar__pct">{slot.percent}%</span>
                  </div>
                ))}
              </motion.div>
            ) : (
              <DocumentsSectionEmpty section="reservationOccupancy" variant="compact" />
            )}
          </div>
        </article>
      </div>
    </section>
  );
};

export default DocumentsDashboardCharts;
