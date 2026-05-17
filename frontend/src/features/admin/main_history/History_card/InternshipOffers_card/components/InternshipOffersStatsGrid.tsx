import { FunctionComponent } from 'react';
import { internshipOffersStats } from '../data/internshipOffersHistoryMock';
import AdminHistorySubStatsGrid from '../../../../ui/AdminHistorySubStatsGrid';

const InternshipOffersStatsGrid: FunctionComponent = () => (
  <AdminHistorySubStatsGrid stats={internshipOffersStats} columns={4} />
);

export default InternshipOffersStatsGrid;
