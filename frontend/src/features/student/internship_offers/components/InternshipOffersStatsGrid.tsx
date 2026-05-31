import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PlatformKpiStrip from '../../../../design-system/PlatformKpiStrip';
import {
  internshipOffersStatColorMap,
  internshipOffersStatIconMap,
  internshipOffersStats,
} from '../data/internshipOffersMock';

const InternshipOffersStatsGrid: FunctionComponent = () => {
  const { t } = useTranslation();

  const items = useMemo(
    () =>
      internshipOffersStats.map((stat) => ({
        id: stat.iconKey,
        label: t(`student.internshipOffers.stats.${stat.iconKey}`),
        value: stat.value,
        icon: internshipOffersStatIconMap[stat.iconKey],
        iconBgClass: internshipOffersStatColorMap[stat.iconKey],
      })),
    [t]
  );

  return (
    <div id="internship-offers-stats" className="min-w-0">
      <PlatformKpiStrip items={items} columns={4} ariaLabel={t('student.internshipOffers.statsAria')} />
    </div>
  );
};

export default InternshipOffersStatsGrid;
