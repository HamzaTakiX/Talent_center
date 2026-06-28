import { FunctionComponent } from 'react';
import InternshipOfferStatCard from './InternshipOfferStatCard';
import InternshipPopularOfferCard from './InternshipPopularOfferCard';
import AdminKpiGrid from '../../ui/AdminKpiGrid';
import { AdminKpiGridSkeleton } from '../../ui/AdminKpiGridSkeleton';
import { useStageDashboard } from '../hooks/useStageOffers';

const InternshipOffersStats: FunctionComponent = () => {
  const { stats, loading, error } = useStageDashboard();

  if (loading) {
    return <AdminKpiGridSkeleton count={9} columns={4} />;
  }

  if (error) {
    return (
      <p className="px-4 py-2 text-sm text-[var(--admin-danger)]" role="alert">
        {error}
      </p>
    );
  }

  return (
    <AdminKpiGrid columns={4}>
      {stats.map((stat, index) =>
        stat.popularOffer ? (
          <InternshipPopularOfferCard
            key={stat.statKey ?? stat.label}
            label={stat.label}
            labelKey={stat.labelKey}
            offer={stat.popularOffer}
            index={index}
          />
        ) : (
          <InternshipOfferStatCard
            key={stat.statKey ?? stat.label}
            label={stat.label}
            labelKey={stat.labelKey}
            valueKey={stat.valueKey}
            value={stat.value}
            icon={stat.icon}
            index={index}
          />
        ),
      )}
    </AdminKpiGrid>
  );
};

export default InternshipOffersStats;
