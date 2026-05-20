import { FunctionComponent, useMemo } from 'react';
import PlatformKpiStrip from '../../../../design-system/PlatformKpiStrip';
import {
  encadrantStatColorMap,
  encadrantStatIconMap,
  encadrantStats,
} from '../data/encadrantMock';

const EncadrantStatsGrid: FunctionComponent = () => {
  const items = useMemo(
    () =>
      encadrantStats.map((stat) => ({
        id: stat.iconKey,
        label: stat.label,
        value: stat.value,
        icon: encadrantStatIconMap[stat.iconKey],
        iconBgClass: encadrantStatColorMap[stat.iconKey],
      })),
    []
  );

  return (
    <div id="student-encadrant-stats" className="min-w-0">
      <PlatformKpiStrip items={items} columns={4} ariaLabel="Supervisor statistics" />
    </div>
  );
};

export default EncadrantStatsGrid;
