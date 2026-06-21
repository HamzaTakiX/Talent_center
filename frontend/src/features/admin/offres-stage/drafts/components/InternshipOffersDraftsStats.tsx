import { FunctionComponent } from 'react';
import InternshipOfferStatCard from '../../components/InternshipOfferStatCard';
import AdminKpiGrid from '../../../ui/AdminKpiGrid';
import { AdminKpiGridSkeleton } from '../../../ui/AdminKpiGridSkeleton';
import { useStageDraftsDashboard } from '../../hooks/useStageDraftsDashboard';

const InternshipOffersDraftsStats: FunctionComponent = () => {
  const { stats, loading, error } = useStageDraftsDashboard();

  if (loading) {
    return <AdminKpiGridSkeleton count={4} columns={4} />;
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
      {stats.map((stat, index) => (
        <InternshipOfferStatCard
          key={stat.labelKey ?? stat.label}
          label={stat.label}
          labelKey={stat.labelKey}
          valueKey={stat.valueKey}
          value={stat.value}
          icon={stat.icon}
          index={index}
        />
      ))}
    </AdminKpiGrid>
  );
};

export default InternshipOffersDraftsStats;
