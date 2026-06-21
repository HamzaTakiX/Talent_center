import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import InternshipOfferStatCard from './InternshipOfferStatCard';
import AdminKpiGrid from '../../ui/AdminKpiGrid';
import { AdminKpiGridSkeleton } from '../../ui/AdminKpiGridSkeleton';
import { useStageDashboard } from '../hooks/useStageOffers';

const routeByStatKey: Record<string, string> = {
  totalOffers: '/admin/internship-offers/all',
  activeOffers: '/admin/internship-offers/active',
  expiredOffers: '/admin/internship-offers/expired',
  draftOffers: '/admin/internship-offers/drafts',
  closedOffers: '/admin/internship-offers/closed',
  totalApplications: '/admin/internship-offers/with-applications',
};

const InternshipOffersStats: FunctionComponent = () => {
  const navigate = useNavigate();
  const { stats, loading, error } = useStageDashboard();

  if (loading) {
    return <AdminKpiGridSkeleton count={8} columns={4} />;
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
          key={stat.statKey ?? stat.label}
          label={stat.label}
          labelKey={stat.labelKey}
          valueKey={stat.valueKey}
          value={stat.value}
          icon={stat.icon}
          index={index}
          onClick={
            stat.statKey && routeByStatKey[stat.statKey]
              ? () => navigate(routeByStatKey[stat.statKey!])
              : undefined
          }
        />
      ))}
    </AdminKpiGrid>
  );
};

export default InternshipOffersStats;
