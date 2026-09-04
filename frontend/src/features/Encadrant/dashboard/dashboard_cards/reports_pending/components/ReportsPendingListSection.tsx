import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { REPORTS_PENDING_SECTION_CARD } from '../constants/reportsPendingLayout';
import ReportsPendingMobileList from './ReportsPendingMobileList';
import ReportsPendingTable from './ReportsPendingTable';

const ReportsPendingListSection: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <section
      className={REPORTS_PENDING_SECTION_CARD}
      aria-label={t('encadrant.dashboard.pendingReports.title')}
    >
      <header className="flex min-w-0 flex-col gap-1">
        <h2 className="m-0 text-base font-semibold leading-6 text-[var(--admin-text)] sm:text-lg">
          {t('encadrant.dashboard.pendingReports.title')}
        </h2>
        <p className="m-0 text-sm font-normal leading-5 text-[var(--admin-text-secondary)]">
          {t('encadrant.dashboard.pendingReports.subtitle')}
        </p>
      </header>

      <ReportsPendingTable />
      <ReportsPendingMobileList />
    </section>
  );
};

export default ReportsPendingListSection;
