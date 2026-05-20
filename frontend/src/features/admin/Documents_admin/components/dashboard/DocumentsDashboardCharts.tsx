import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AdminDonutChart from '../../../ui/charts/AdminDonutChart';
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

  if (loading) {
    return <div className="admin-doc-charts-grid admin-doc-charts-grid--loading" />;
  }

  return (
    <div className="admin-doc-charts-grid">
      <section className="admin-doc-chart-card admin-doc-chart-card--premium">
        <h3>{t('admin.documentsModule.chart.statusMix')}</h3>
        <AdminDonutChart
          segments={statusSegments}
          ariaLabel={t('admin.documentsModule.chart.statusMix')}
          premiumGradients
        />
      </section>
      <section className="admin-doc-chart-card admin-doc-chart-card--premium">
        <h3>{t('admin.documentsModule.chart.rejectionCauses')}</h3>
        <AdminDonutChart
          segments={rejectionSegments}
          ariaLabel={t('admin.documentsModule.chart.rejectionCauses')}
          premiumGradients
        />
      </section>
      <section className="admin-doc-chart-card admin-doc-chart-card--wide">
        <h3>{t('admin.documentsModule.chart.reservationOccupancy')}</h3>
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
      </section>
    </div>
  );
};

export default DocumentsDashboardCharts;
