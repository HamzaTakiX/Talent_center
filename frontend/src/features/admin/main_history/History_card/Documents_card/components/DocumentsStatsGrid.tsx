import { FunctionComponent } from 'react';
import { documentsStats } from '../data/documentsHistoryMock';
import AdminHistorySubStatsGrid from '../../../../ui/AdminHistorySubStatsGrid';

const DocumentsStatsGrid: FunctionComponent = () => (
  <AdminHistorySubStatsGrid stats={documentsStats} columns={4} />
);

export default DocumentsStatsGrid;
