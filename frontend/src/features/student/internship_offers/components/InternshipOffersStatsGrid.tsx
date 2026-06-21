import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PlatformKpiStrip from '../../../../design-system/PlatformKpiStrip';
import { AdminKpiGridSkeleton } from '../../../admin/ui/AdminKpiGridSkeleton';
import { useStudentInternshipStats } from '../hooks/useStudentStageOffers';
import {
  internshipOffersStatColorMap,
  internshipOffersStatIconMap,
} from '../constants/internshipOffersStatConfig';

const InternshipOffersStatsGrid: FunctionComponent = () => {
  const { t } = useTranslation();
  const { stats, loading } = useStudentInternshipStats();

  const items = useMemo(
    () =>
      stats.map((stat) => ({
        id: stat.iconKey,
        label: t(`student.internshipOffers.stats.${stat.iconKey}`),
        value: stat.value,
        icon: internshipOffersStatIconMap[stat.iconKey],
        iconBgClass: internshipOffersStatColorMap[stat.iconKey],
      })),
    [stats, t],
  );

  if (loading) {
    return (
      <div id="internship-offers-stats" className="min-w-0">
        <AdminKpiGridSkeleton count={4} columns={4} />
      </div>
    );
  }

  return (
    <div id="internship-offers-stats" className="min-w-0">
      <PlatformKpiStrip items={items} columns={4} ariaLabel={t('student.internshipOffers.statsAria')} />
    </div>
  );
};

export default InternshipOffersStatsGrid;
