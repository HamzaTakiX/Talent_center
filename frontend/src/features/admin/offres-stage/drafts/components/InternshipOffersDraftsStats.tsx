import { FunctionComponent } from 'react';
import InternshipOfferStatCard from '../../components/InternshipOfferStatCard';
import { AdminStudentsStatsSkeleton } from '../../../ui/AdminSectionSkeleton';
import { useStageDraftsDashboard } from '../../hooks/useStageDraftsDashboard';

const InternshipOffersDraftsStats: FunctionComponent = () => {
  const { stats, loading, error } = useStageDraftsDashboard();

  if (loading) {
    return <AdminStudentsStatsSkeleton count={4} compact withPiePattern={false} />;
  }

  if (error) {
    return (
      <p className="px-4 py-2 text-sm text-[var(--admin-danger)]" role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="admin-students-stats-grid admin-offers-stats-grid">
      {stats.map((stat, index) => (
        <InternshipOfferStatCard
          key={stat.labelKey ?? stat.label}
          label={stat.label}
          labelKey={stat.labelKey}
          valueKey={stat.valueKey}
          value={stat.value}
          icon={stat.icon}
          index={index}
          compact
        />
      ))}
    </div>
  );
};

export default InternshipOffersDraftsStats;
