import { FunctionComponent } from 'react';
import EngagementMetricsChart from './EngagementMetricsChart';

const EngagementMetricsSection: FunctionComponent = () => (
  <div className="box-border flex w-full min-w-0 flex-col gap-6 admin-module-panel px-6 pb-6 pt-6 font-inter text-base text-[var(--admin-text)] shadow-sm">
    <div className="flex min-h-[70px] flex-col gap-1">
      <h2 className="text-base font-medium leading-4">Engagement Metrics</h2>
      <p className="text-base leading-6 text-[var(--admin-text-secondary)]">
        Student activity and participation trends over time.
      </p>
    </div>
    <EngagementMetricsChart />
  </div>
);

export default EngagementMetricsSection;
