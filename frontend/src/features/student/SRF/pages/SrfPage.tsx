import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import StudentLayout from '../../components/StudentLayout';
import SrfHeader from '../components/SrfHeader';
import SrfStatsGrid from '../components/SrfStatsGrid';
import SrfFeesSection from '../components/SrfFeesSection';
import SrfPaymentHistorySection from '../components/SrfPaymentHistorySection';
import SrfUpcomingDeadlinesSection from '../components/SrfUpcomingDeadlinesSection';
import { SRF_PAGE_ROOT, SRF_SURFACE_CARD } from '../constants/srfLayout';
import { SRF_PRIMARY_BTN } from '../constants/srfStyles';
import { STUDENT_ICON_CHIP_DANGER } from '../../design-system/studentSemanticStyles';
import { useStudentSrfData } from '../hooks';

const SrfPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const {
    feeRows,
    feeTabs,
    paymentHistoryRows,
    upcomingDeadline,
    summary,
    loading,
    isInitialLoad,
    error,
    submitting,
    submitError,
    submitPaymentProof,
    refresh,
  } = useStudentSrfData();

  const cleared = summary.remaining <= 0 && summary.canTakeExams;

  return (
    <StudentLayout>
      <div id="student-srf-root" className={SRF_PAGE_ROOT}>
        <SrfHeader cleared={cleared} loading={isInitialLoad} />

        <SrfStatsGrid summary={summary} loading={isInitialLoad} />

        {error && !loading ? (
          <section className={`${SRF_SURFACE_CARD} min-w-0`}>
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
              <span className={`inline-flex h-12 w-12 shrink-0 rounded-[14px] ${STUDENT_ICON_CHIP_DANGER}`}>
                <AlertTriangle className="h-6 w-6" strokeWidth={1.6} aria-hidden />
              </span>
              <p className="m-0 text-sm font-semibold leading-5 text-[var(--admin-text)]">
                {t('student.srf.loadError')}
              </p>
              <button type="button" className={SRF_PRIMARY_BTN} onClick={() => void refresh()}>
                <RefreshCw className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                {t('student.srf.retry')}
              </button>
            </div>
          </section>
        ) : (
          <>
            <SrfUpcomingDeadlinesSection deadline={upcomingDeadline} loading={isInitialLoad} />
            <SrfFeesSection
              feeRows={feeRows}
              feeTabs={feeTabs}
              loading={isInitialLoad}
              submitting={submitting}
              submitError={submitError}
              onSubmitPayment={submitPaymentProof}
            />
            <SrfPaymentHistorySection rows={paymentHistoryRows} loading={isInitialLoad} />
          </>
        )}
      </div>
    </StudentLayout>
  );
};

export default SrfPage;
