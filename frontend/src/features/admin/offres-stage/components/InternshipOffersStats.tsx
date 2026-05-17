import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { internshipOffersStats } from '../data/internshipOffersMockData';
import InternshipOfferStatCard from './InternshipOfferStatCard';
import AdminKpiGrid from '../../ui/AdminKpiGrid';

const routeByStatKey: Record<string, string> = {
  totalOffers: '/admin/internship-offers/all',
  activeOffers: '/admin/internship-offers/active',
  expiredOffers: '/admin/internship-offers/expired',
  draftOffers: '/admin/internship-offers/draft',
  closedOffers: '/admin/internship-offers/closed',
  totalApplications: '/admin/internship-offers/with-applications',
};

const InternshipOffersStats: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <AdminKpiGrid columns={4}>
      {internshipOffersStats.map((stat, index) => (
        <InternshipOfferStatCard
          key={stat.statKey ?? stat.label}
          label={stat.label}
          labelKey={stat.labelKey}
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
