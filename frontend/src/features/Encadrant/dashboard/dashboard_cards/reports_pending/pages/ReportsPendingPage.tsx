import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import EncadrantLayout from '../../../../components/EncadrantLayout';
import { ReportsPendingListSection, ReportsPendingSummaryGrid } from '../components';
import { REPORTS_PENDING_PAGE_ROOT } from '../constants/reportsPendingLayout';

const ReportsPendingPage: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <EncadrantLayout>
      <div id="encadrant-reports-pending-root" className={REPORTS_PENDING_PAGE_ROOT}>
        <header className="flex min-w-0 flex-col gap-1">
          <h1 className="m-0 text-xl font-semibold leading-7 tracking-tight text-[var(--admin-text)] sm:text-2xl">
            {t('encadrant.header.titles.reportsPending')}
          </h1>
          <p className="m-0 text-sm font-normal leading-5 text-[var(--admin-text-secondary)]">
            {t('encadrant.dashboard.pendingReports.subtitle')}
          </p>
        </header>

        <ReportsPendingSummaryGrid />
        <ReportsPendingListSection />
      </div>
    </EncadrantLayout>
  );
};

export default ReportsPendingPage;
