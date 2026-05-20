import { FunctionComponent, useMemo } from 'react';
import PlatformKpiStrip from '../../../../design-system/PlatformKpiStrip';
import {
  documentsStatColorMap,
  documentsStatIconMap,
  documentsStats,
} from '../data/documentsMock';

const DocumentsStatsGrid: FunctionComponent = () => {
  const items = useMemo(
    () =>
      documentsStats.map((stat, i) => ({
        id: `doc-stat-${i}`,
        label: stat.label,
        value: stat.value,
        icon: documentsStatIconMap[stat.iconKey],
        iconBgClass: documentsStatColorMap[stat.iconKey],
      })),
    []
  );

  return (
    <div id="student-documents-stats" className="min-w-0">
      <PlatformKpiStrip items={items} columns={4} ariaLabel="Documents statistics" />
    </div>
  );
};

export default DocumentsStatsGrid;
