import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import type { JourneyAnalytics } from '../../types/journeyTypes';

interface InternshipJourneyAnalyticsProps {
  analytics: JourneyAnalytics;
}

const InternshipJourneyAnalytics: FunctionComponent<InternshipJourneyAnalyticsProps> = ({ analytics }) => {
  const { t } = useTranslation();

  const items = [
    { key: 'applications_sent', value: analytics.applications_sent },
    { key: 'interviews_obtained', value: analytics.interviews_obtained },
    { key: 'offers_accepted', value: analytics.offers_accepted },
    { key: 'success_rate', value: `${analytics.success_rate}%` },
  ];

  return (
    <section
      aria-label={t('student.internshipOffers.journey.analyticsAria')}
      className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3"
    >
      {items.map((item) => (
        <div
          key={item.key}
          className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-3 py-3 text-center sm:px-4"
        >
          <p className="m-0 text-xl font-bold tabular-nums text-[var(--admin-text)] sm:text-2xl">
            {item.value}
          </p>
          <p className="m-0 mt-1 text-[10px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)] sm:text-xs">
            {t(`student.internshipOffers.journey.analytics.${item.key}`)}
          </p>
        </div>
      ))}
    </section>
  );
};

export default InternshipJourneyAnalytics;
