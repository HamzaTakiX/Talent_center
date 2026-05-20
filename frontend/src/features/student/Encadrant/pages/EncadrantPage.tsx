import { FunctionComponent } from 'react';
import StudentLayout from '../../components/StudentLayout';
import EncadrantMeetingsSection from '../components/EncadrantMeetingsSection';
import EncadrantQuickActionsGrid from '../components/EncadrantQuickActionsGrid';
import EncadrantReminderBanner from '../components/EncadrantReminderBanner';
import EncadrantReportProgressSection from '../components/EncadrantReportProgressSection';
import EncadrantStatsGrid from '../components/EncadrantStatsGrid';
import EncadrantSupervisorCard from '../components/EncadrantSupervisorCard';
import EncadrantTasksSection from '../components/EncadrantTasksSection';
import { ENCADRANT_PAGE_ROOT, ENCADRANT_TWO_COL_GRID } from '../constants/encadrantLayout';

const EncadrantPage: FunctionComponent = () => (
  <StudentLayout headerTitle="Encadrant" headerSubtitle="Digital Talent Center">
    <div id="student-encadrant-root" className={ENCADRANT_PAGE_ROOT}>
      <EncadrantSupervisorCard />
      <EncadrantStatsGrid />
      <EncadrantReminderBanner />

      <div className={ENCADRANT_TWO_COL_GRID}>
        <EncadrantMeetingsSection />
        <EncadrantTasksSection />
      </div>

      <EncadrantReportProgressSection />
      <EncadrantQuickActionsGrid />
    </div>
  </StudentLayout>
);

export default EncadrantPage;
