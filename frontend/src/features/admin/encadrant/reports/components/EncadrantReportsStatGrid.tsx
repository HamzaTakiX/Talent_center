import { FunctionComponent } from 'react';
import SRFSummaryStatCard from '../../../SRF/components/SRFSummaryStatCard';
import { encadrantReportsSummaryStats } from '../data/encadrantReportsMock';

const EncadrantReportsStatGrid: FunctionComponent = () => (
  <div className="relative w-full min-w-0 text-left font-inter text-num-14 text-[var(--admin-text-secondary)]">
    <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-x-4 xl:gap-y-4 xl:content-start">
      {encadrantReportsSummaryStats.map((stat) => (
        <SRFSummaryStatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          IconComponent={stat.Icon}
          iconBgClass={stat.iconBgClass}
          onClick={() => {}}
        />
      ))}
    </div>
  </div>
);

export default EncadrantReportsStatGrid;
