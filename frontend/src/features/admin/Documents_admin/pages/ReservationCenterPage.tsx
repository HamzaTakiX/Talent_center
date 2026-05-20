import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import DocumentsSubPageLayout from '../components/DocumentsSubPageLayout';
import { MOCK_DASHBOARD } from '../data/documentsMockData';

const ReservationCenterPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const occupancy = MOCK_DASHBOARD.reservationOccupancy;

  return (
    <DocumentsSubPageLayout
      title={t('admin.documentsModule.reservations.title')}
      subtitle={t('admin.documentsModule.reservations.subtitle')}
    >
      <div className="admin-doc-charts-grid">
        <section className="admin-doc-chart-card admin-doc-chart-card--wide">
          <h3 className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[var(--admin-brand)]" />
            {t('admin.documentsModule.reservations.calendar')}
          </h3>
          <div className="admin-doc-occupancy-bars mt-4">
            {occupancy.map((slot) => (
              <div key={slot.hour} className="admin-doc-occupancy-bar">
                <span className="admin-doc-occupancy-bar__label">{slot.hour}</span>
                <div className="admin-doc-occupancy-bar__track">
                  <div
                    className="admin-doc-occupancy-bar__fill"
                    style={{ width: `${slot.percent}%` }}
                  />
                </div>
                <span className="admin-doc-occupancy-bar__pct">{slot.percent}%</span>
              </div>
            ))}
          </div>
        </section>
      </div>
      <p className="mt-4 text-sm text-[var(--admin-text-secondary)]">
        {t('admin.documentsModule.reservations.smartAssign')}
      </p>
    </DocumentsSubPageLayout>
  );
};

export default ReservationCenterPage;
