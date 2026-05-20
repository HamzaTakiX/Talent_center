import { FunctionComponent, useMemo } from 'react';
import PlatformKpiStrip from '../../../../design-system/PlatformKpiStrip';
import {
  internshipOffersStatColorMap,
  internshipOffersStatIconMap,
  internshipOffersStats,
} from '../data/internshipOffersMock';

const InternshipOffersStatsGrid: FunctionComponent = () => {
  const items = useMemo(
    () =>
      internshipOffersStats.map((stat) => ({
        id: stat.iconKey,
        label: stat.label,
        value: stat.value,
        icon: internshipOffersStatIconMap[stat.iconKey],
        iconBgClass: internshipOffersStatColorMap[stat.iconKey],
      })),
    []
  );

  return (
    <div id="internship-offers-stats" className="min-w-0">
      <PlatformKpiStrip items={items} columns={4} ariaLabel="Application statistics" />
    </div>
  );
};

export default InternshipOffersStatsGrid;
