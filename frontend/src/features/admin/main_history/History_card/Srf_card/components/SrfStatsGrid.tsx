import { FunctionComponent } from 'react';
import { srfStats } from '../data/srfHistoryMock';
import AdminHistorySubStatsGrid from '../../../../ui/AdminHistorySubStatsGrid';

const SrfStatsGrid: FunctionComponent = () => (
  <AdminHistorySubStatsGrid stats={srfStats} columns={4} />
);

export default SrfStatsGrid;
