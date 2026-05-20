import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import AdminDonutChart from '../../ui/charts/AdminDonutChart';
import DocumentsSubPageLayout from '../components/DocumentsSubPageLayout';
import DocumentsPremiumEmpty from '../components/DocumentsPremiumEmpty';
import { useDocumentsAnalytics } from '../hooks/useDocumentsAdmin';

const DocumentsAnalyticsPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { data, loading } = useDocumentsAnalytics();

  if (!loading && !data) {
    return (
      <DocumentsSubPageLayout
        title={t('admin.documentsModule.analytics.title')}
        subtitle={t('admin.documentsModule.analytics.subtitle')}
      >
        <DocumentsPremiumEmpty variant="analytics" />
      </DocumentsSubPageLayout>
    );
  }

  const palette = ['#2563eb', '#16a34a', '#d97706', '#7c3aed'];
  const deliverySegments =
    data?.deliveryAnalytics.map((d, i) => ({
      key: d.method,
      label: t(`admin.documentsModule.delivery.${d.method}`),
      value: d.count,
      color: palette[i % palette.length],
    })) ?? [];

  return (
    <DocumentsSubPageLayout
      title={t('admin.documentsModule.analytics.title')}
      subtitle={t('admin.documentsModule.analytics.subtitle')}
    >
      <div className="admin-doc-kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="admin-doc-kpi-card">
          <span className="admin-doc-kpi-card__value">{data?.reservationSuccessRate ?? 0}%</span>
          <span className="admin-doc-kpi-card__label">
            {t('admin.documentsModule.analytics.reservationRate')}
          </span>
        </div>
        <div className="admin-doc-kpi-card">
          <span className="admin-doc-kpi-card__value">{data?.autoGenerationRate ?? 0}%</span>
          <span className="admin-doc-kpi-card__label">
            {t('admin.documentsModule.analytics.autoGenRate')}
          </span>
        </div>
      </div>
      <section className="admin-doc-chart-card mt-4">
        <h3>{t('admin.documentsModule.analytics.deliveryMix')}</h3>
        {!loading && <AdminDonutChart segments={deliverySegments} ariaLabel={t('admin.documentsModule.analytics.deliveryMix')} />}
      </section>
      {data?.bottlenecks && (
        <section className="admin-doc-panel mt-4">
          <h2>{t('admin.documentsModule.analytics.bottlenecks')}</h2>
          <ul className="mt-2 flex flex-col gap-2 text-sm">
            {data.bottlenecks.map((b) => (
              <li key={b.step} className="flex justify-between">
                <span>{t(`admin.documentsModule.workflow.${b.step}`)}</span>
                <strong>{b.avgHours}h</strong>
              </li>
            ))}
          </ul>
        </section>
      )}
    </DocumentsSubPageLayout>
  );
};

export default DocumentsAnalyticsPage;
