import { FunctionComponent } from 'react';
import StudentFilteredListLayout from '../../shared/components/StudentFilteredListLayout';

const EngagementLevelListPage: FunctionComponent = () => (
  <StudentFilteredListLayout
    filter="engagement"
    chartId="students-engagement-distribution"
    showEngagementTable
    showOnboardingChart
  />
);

export default EngagementLevelListPage;
