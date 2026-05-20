import { FunctionComponent } from 'react';
import StudentLayout from '../../components/StudentLayout';
import SrfFeesSection from '../components/SrfFeesSection';
import SrfPaymentHistorySection from '../components/SrfPaymentHistorySection';
import SrfUpcomingDeadlinesSection from '../components/SrfUpcomingDeadlinesSection';
import { SRF_PAGE_ROOT } from '../constants/srfLayout';

const SrfPage: FunctionComponent = () => (
  <StudentLayout headerTitle="SRF" headerSubtitle="Digital Talent Center">
    <div id="student-srf-root" className={SRF_PAGE_ROOT}>
      <SrfFeesSection />
      <SrfPaymentHistorySection />
      <SrfUpcomingDeadlinesSection />
    </div>
  </StudentLayout>
);

export default SrfPage;
